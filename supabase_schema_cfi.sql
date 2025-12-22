-- ============================================
-- CFI INTERFACE SCHEMA ADDITIONS
-- ============================================
-- Run this AFTER the main supabase_schema.sql

-- Add role to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  role TEXT CHECK (role IN ('student', 'cfi')) DEFAULT 'student';

-- ============================================
-- CFI PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS cfi_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  certificate_number TEXT,
  certificate_expiry DATE,
  ratings TEXT[] DEFAULT '{"CFI"}', -- CFI, CFII, MEI
  invite_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cfi_profiles ENABLE ROW LEVEL SECURITY;

-- CFI can view/update own profile
CREATE POLICY "CFI can view own cfi_profile" ON cfi_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "CFI can insert own cfi_profile" ON cfi_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "CFI can update own cfi_profile" ON cfi_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- STUDENT-CFI LINKS
-- ============================================
CREATE TABLE IF NOT EXISTS student_cfi_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  cfi_id UUID REFERENCES cfi_profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, cfi_id)
);

ALTER TABLE student_cfi_links ENABLE ROW LEVEL SECURITY;

-- Students can view their links
CREATE POLICY "Students can view own links" ON student_cfi_links
  FOR SELECT USING (auth.uid() = student_id);

-- Students can insert links (join via code)
CREATE POLICY "Students can insert links" ON student_cfi_links
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- CFIs can view students linked to them
CREATE POLICY "CFI can view linked students" ON student_cfi_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cfi_profiles 
      WHERE cfi_profiles.id = student_cfi_links.cfi_id 
      AND cfi_profiles.user_id = auth.uid()
    )
  );

-- ============================================
-- MANEUVERS CATALOG
-- ============================================
CREATE TABLE IF NOT EXISTS maneuvers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- e.g., 'steep_turns', 'power_off_stalls'
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('preflight', 'takeoff_landing', 'performance', 'slow_flight_stalls', 'navigation', 'emergency')) NOT NULL,
  acs_reference TEXT, -- ACS task code
  description TEXT,
  certification_level TEXT CHECK (certification_level IN ('private', 'instrument', 'commercial')) DEFAULT 'private',
  display_order INTEGER DEFAULT 0
);

ALTER TABLE maneuvers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view maneuvers" ON maneuvers
  FOR SELECT TO authenticated USING (true);

-- ============================================
-- MANEUVER GRADES
-- ============================================
CREATE TABLE IF NOT EXISTS maneuver_grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  cfi_id UUID REFERENCES cfi_profiles(id) ON DELETE CASCADE NOT NULL,
  flight_log_id UUID REFERENCES flight_log(id) ON DELETE SET NULL,
  maneuver_id UUID REFERENCES maneuvers(id) ON DELETE CASCADE NOT NULL,
  grade TEXT CHECK (grade IN ('introduced', 'needs_work', 'satisfactory', 'proficient')) NOT NULL,
  notes TEXT,
  graded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE maneuver_grades ENABLE ROW LEVEL SECURITY;

-- Students can view their own grades
CREATE POLICY "Students can view own grades" ON maneuver_grades
  FOR SELECT USING (auth.uid() = student_id);

-- CFIs can view and manage grades for their students
CREATE POLICY "CFI can view grades they created" ON maneuver_grades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cfi_profiles 
      WHERE cfi_profiles.id = maneuver_grades.cfi_id 
      AND cfi_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "CFI can insert grades" ON maneuver_grades
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cfi_profiles 
      WHERE cfi_profiles.id = maneuver_grades.cfi_id 
      AND cfi_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "CFI can update grades" ON maneuver_grades
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cfi_profiles 
      WHERE cfi_profiles.id = maneuver_grades.cfi_id 
      AND cfi_profiles.user_id = auth.uid()
    )
  );

-- ============================================
-- ENDORSEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  cfi_id UUID REFERENCES cfi_profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN (
    'pre_solo_written', 'pre_solo_flight', 'solo', 
    'solo_xc', 'solo_xc_repeated', 
    'knowledge_test', 'practical_test'
  )) NOT NULL,
  text TEXT NOT NULL, -- Full endorsement text per FAR 61
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at DATE -- Some endorsements expire (90 days for solo)
);

ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;

-- Students can view their endorsements
CREATE POLICY "Students can view own endorsements" ON endorsements
  FOR SELECT USING (auth.uid() = student_id);

-- CFIs can manage endorsements
CREATE POLICY "CFI can view endorsements they created" ON endorsements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cfi_profiles 
      WHERE cfi_profiles.id = endorsements.cfi_id 
      AND cfi_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "CFI can insert endorsements" ON endorsements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cfi_profiles 
      WHERE cfi_profiles.id = endorsements.cfi_id 
      AND cfi_profiles.user_id = auth.uid()
    )
  );

-- ============================================
-- SEED MANEUVERS (ACS-aligned for PPL)
-- ============================================
INSERT INTO maneuvers (code, name, category, acs_reference, description, display_order) VALUES
-- Preflight
('certs_documents', 'Certificates and Documents', 'preflight', 'PA.I.A', 'Verify required documents and certificates', 1),
('weather_information', 'Weather Information', 'preflight', 'PA.I.B', 'Obtain and evaluate weather data', 2),
('xc_flight_planning', 'Cross-Country Flight Planning', 'preflight', 'PA.I.C', 'Plan a VFR cross-country flight', 3),
('national_airspace', 'National Airspace System', 'preflight', 'PA.I.D', 'Understand airspace classes and requirements', 4),

-- Takeoffs & Landings
('normal_takeoff', 'Normal Takeoff and Climb', 'takeoff_landing', 'PA.IV.A', 'Standard takeoff with proper technique', 10),
('normal_landing', 'Normal Approach and Landing', 'takeoff_landing', 'PA.IV.B', 'Standard approach and landing', 11),
('crosswind_takeoff', 'Crosswind Takeoff and Climb', 'takeoff_landing', 'PA.IV.C', 'Takeoff with crosswind correction', 12),
('crosswind_landing', 'Crosswind Approach and Landing', 'takeoff_landing', 'PA.IV.D', 'Landing with crosswind correction', 13),
('soft_field_takeoff', 'Soft-Field Takeoff and Climb', 'takeoff_landing', 'PA.IV.E', 'Soft-field takeoff technique', 14),
('soft_field_landing', 'Soft-Field Approach and Landing', 'takeoff_landing', 'PA.IV.F', 'Soft-field landing technique', 15),
('short_field_takeoff', 'Short-Field Takeoff and Maximum Performance Climb', 'takeoff_landing', 'PA.IV.G', 'Short-field takeoff technique', 16),
('short_field_landing', 'Short-Field Approach and Landing', 'takeoff_landing', 'PA.IV.H', 'Short-field landing technique', 17),
('forward_slip', 'Forward Slip to a Landing', 'takeoff_landing', 'PA.IV.I', 'Forward slip technique', 18),
('go_around', 'Go-Around/Rejected Landing', 'takeoff_landing', 'PA.IV.J', 'Go-around procedure', 19),

-- Performance Maneuvers
('steep_turns', 'Steep Turns', 'performance', 'PA.V.A', '45° bank turns maintaining altitude ±100ft', 20),
('ground_reference', 'Ground Reference Maneuvers', 'performance', 'PA.V.B', 'S-turns, turns around a point, rectangular course', 21),

-- Slow Flight & Stalls
('slow_flight', 'Maneuvering During Slow Flight', 'slow_flight_stalls', 'PA.VI.A', 'Flight at minimum controllable airspeed', 30),
('power_off_stalls', 'Power-Off Stalls', 'slow_flight_stalls', 'PA.VI.B', 'Approach-to-landing stall recovery', 31),
('power_on_stalls', 'Power-On Stalls', 'slow_flight_stalls', 'PA.VI.C', 'Departure stall recovery', 32),
('spin_awareness', 'Spin Awareness', 'slow_flight_stalls', 'PA.VI.D', 'Spin entry recognition and avoidance', 33),

-- Navigation
('pilotage_ded_reckoning', 'Pilotage and Dead Reckoning', 'navigation', 'PA.VII.A', 'Navigate using charts and calculations', 40),
('nav_systems', 'Navigation Systems and Radar Services', 'navigation', 'PA.VII.B', 'Use of VOR, GPS, and ATC radar services', 41),
('diversion', 'Diversion', 'navigation', 'PA.VII.C', 'Divert to alternate airport', 42),
('lost_procedures', 'Lost Procedures', 'navigation', 'PA.VII.D', 'Procedures when unsure of position', 43),

-- Emergency Operations  
('emergency_descent', 'Emergency Descent', 'emergency', 'PA.VIII.A', 'Rapid descent when required', 50),
('emergency_approach', 'Emergency Approach and Landing', 'emergency', 'PA.VIII.B', 'Simulated engine failure landing', 51),
('systems_malfunctions', 'Systems and Equipment Malfunctions', 'emergency', 'PA.VIII.C', 'Handle various system failures', 52)

ON CONFLICT (code) DO NOTHING;

-- ============================================
-- HELPER: Generate invite code for CFI
-- ============================================
CREATE OR REPLACE FUNCTION generate_cfi_invite_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Generate 6-character alphanumeric code
  new_code := upper(substr(md5(random()::text), 1, 6));
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;
