-- AI Schedule Generation Schema
-- Run this in Supabase SQL Editor

-- ==========================================
-- USER AVAILABILITY (Student's weekly slots)
-- ==========================================
CREATE TABLE IF NOT EXISTS user_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_preferred BOOLEAN DEFAULT false, -- preferred vs just available
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, day_of_week, start_time, end_time)
);

-- ==========================================
-- CFI AVAILABILITY (Instructor's weekly slots)
-- ==========================================
CREATE TABLE IF NOT EXISTS cfi_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cfi_id UUID REFERENCES cfi_profiles(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_students INT DEFAULT 1, -- how many students this slot can accommodate
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(cfi_id, day_of_week, start_time, end_time)
);

-- ==========================================
-- TRAINING SCHEDULE (Generated schedule entries)
-- ==========================================
CREATE TABLE IF NOT EXISTS training_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    cfi_id UUID REFERENCES cfi_profiles(id), -- nullable for ground school
    
    -- When
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- What
    activity_type TEXT NOT NULL CHECK (activity_type IN ('flight', 'ground', 'sim', 'exam_prep')),
    task_id UUID REFERENCES training_tasks(id),
    task_title TEXT, -- denormalized for quick display
    
    -- Status
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'weather_hold', 'rescheduled')),
    
    -- Weather context
    weather_conditions JSONB, -- snapshot of weather at generation time
    weather_suitable BOOLEAN DEFAULT true,
    
    -- Booking info
    aircraft_type TEXT, -- 'C172', 'PA-28', etc.
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ==========================================
-- SCHEDULE GENERATION LOG
-- ==========================================
CREATE TABLE IF NOT EXISTS schedule_generation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    schedule_start DATE NOT NULL,
    schedule_end DATE NOT NULL,
    entries_created INT DEFAULT 0,
    generation_params JSONB, -- store inputs used for generation
    weather_data JSONB -- store weather forecast used
);

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- User Availability: Users can only see/edit their own
ALTER TABLE user_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own availability" ON user_availability
    FOR ALL USING (auth.uid() = user_id);

-- CFI Availability: CFIs manage own, students can view their CFI's
ALTER TABLE cfi_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CFIs manage own availability" ON cfi_availability
    FOR ALL USING (
        cfi_id IN (SELECT id FROM cfi_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Students view linked CFI availability" ON cfi_availability
    FOR SELECT USING (
        cfi_id IN (
            SELECT cfi_id FROM student_cfi_links 
            WHERE student_id = auth.uid() AND status = 'active'
        )
    );

-- Training Schedule: Users see own, CFIs see their students'
ALTER TABLE training_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own schedule" ON training_schedule
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "CFIs view student schedules" ON training_schedule
    FOR SELECT USING (
        cfi_id IN (SELECT id FROM cfi_profiles WHERE user_id = auth.uid())
    );

-- Schedule Log
ALTER TABLE schedule_generation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own schedule logs" ON schedule_generation_log
    FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_user_availability_user ON user_availability(user_id);
CREATE INDEX idx_cfi_availability_cfi ON cfi_availability(cfi_id);
CREATE INDEX idx_training_schedule_user_date ON training_schedule(user_id, scheduled_date);
CREATE INDEX idx_training_schedule_cfi ON training_schedule(cfi_id, scheduled_date);
CREATE INDEX idx_training_schedule_status ON training_schedule(status);

-- ==========================================
-- UPDATED_AT TRIGGERS
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_availability_updated_at
    BEFORE UPDATE ON user_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cfi_availability_updated_at
    BEFORE UPDATE ON cfi_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_schedule_updated_at
    BEFORE UPDATE ON training_schedule
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
