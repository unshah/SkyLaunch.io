import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface StudentLinkStore {
    linkedCFI: { name: string; inviteCode: string } | null;
    isLoading: boolean;
    error: string | null;

    fetchLinkedCFI: () => Promise<void>;
    linkWithCFI: (inviteCode: string) => Promise<{ success: boolean; error?: string }>;
}

export const useStudentLinkStore = create<StudentLinkStore>((set) => ({
    linkedCFI: null,
    isLoading: false,
    error: null,

    fetchLinkedCFI: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Get any active link for this student
            const { data: link, error } = await supabase
                .from('student_cfi_links')
                .select(`
                    *,
                    cfi:cfi_id (
                        id,
                        invite_code,
                        user_id
                    )
                `)
                .eq('student_id', session.user.id)
                .eq('status', 'active')
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching CFI link:', error);
                return;
            }

            if (link?.cfi) {
                // Get CFI's profile name
                const { data: cfiProfile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', link.cfi.user_id)
                    .single();

                set({
                    linkedCFI: {
                        name: cfiProfile?.full_name || 'Your CFI',
                        inviteCode: link.cfi.invite_code || '',
                    }
                });
            }
        } catch (error) {
            console.error('Error in fetchLinkedCFI:', error);
        }
    },

    linkWithCFI: async (inviteCode: string) => {
        set({ isLoading: true, error: null });

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                set({ isLoading: false });
                return { success: false, error: 'Not authenticated' };
            }

            // Find CFI with this invite code
            const { data: cfiProfile, error: findError } = await supabase
                .from('cfi_profiles')
                .select('id, user_id')
                .eq('invite_code', inviteCode.toUpperCase())
                .single();

            if (findError || !cfiProfile) {
                set({ isLoading: false, error: 'Invalid invite code' });
                return { success: false, error: 'Invalid invite code' };
            }

            // Create the link
            const { error: linkError } = await supabase
                .from('student_cfi_links')
                .insert({
                    student_id: session.user.id,
                    cfi_id: cfiProfile.id,
                    status: 'active',
                });

            if (linkError) {
                // Check if already linked
                if (linkError.code === '23505') {
                    set({ isLoading: false, error: 'Already linked to this CFI' });
                    return { success: false, error: 'Already linked to this CFI' };
                }
                throw linkError;
            }

            // Get CFI name
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', cfiProfile.user_id)
                .single();

            set({
                linkedCFI: {
                    name: profile?.full_name || 'Your CFI',
                    inviteCode,
                },
                isLoading: false,
                error: null,
            });

            return { success: true };
        } catch (error) {
            console.error('Error linking with CFI:', error);
            set({ isLoading: false, error: 'Failed to link' });
            return { success: false, error: 'Failed to link with CFI' };
        }
    },
}));
