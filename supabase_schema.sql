-- SkyLaunch Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Extends auth.users with training-specific data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  training_goal TEXT CHECK (training_goal IN ('private', 'instrument', 'commercial', 'atp')),
  weekly_hours INTEGER DEFAULT 10,
  schedule_intensity TEXT CHECK (schedule_intensity IN ('aggressive', 'balanced', 'relaxed')) DEFAULT 'balanced',
  current_flight_hours DECIMAL DEFAULT 0,
  target_completion_date DATE,
  home_airport TEXT, -- ICAO code (e.g., 'KFFZ')
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- TRAINING TASKS CATALOG
-- ============================================
-- Master list of all training tasks (read-only for users)
CREATE TABLE IF NOT EXISTS training_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT CHECK (category IN ('ground_school', 'flight', 'simulator', 'exam')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_hours DECIMAL DEFAULT 1,
  prerequisites UUID[], -- Array of other task IDs
  certification_level TEXT CHECK (certification_level IN ('private', 'instrument', 'commercial', 'atp')),
  far_reference TEXT, -- FAA regulation reference
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (read-only for all authenticated users)
ALTER TABLE training_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tasks" ON training_tasks
  FOR SELECT TO authenticated USING (true);

-- ============================================
-- USER TASKS (Progress Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS user_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES training_tasks(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  scheduled_date DATE,
  completed_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON user_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON user_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON user_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON user_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FLIGHT LOG
-- ============================================
CREATE TABLE IF NOT EXISTS flight_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  flight_date DATE NOT NULL,
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT,
  duration_hours DECIMAL NOT NULL,
  instructor_name TEXT,
  aircraft_type TEXT,
  aircraft_registration TEXT,
  conditions TEXT CHECK (conditions IN ('vfr', 'ifr', 'night')),
  is_solo BOOLEAN DEFAULT false,
  is_cross_country BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE flight_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flights" ON flight_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flights" ON flight_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flights" ON flight_log
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flights" ON flight_log
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SEED PPL TRAINING TASKS
-- ============================================
INSERT INTO training_tasks (category, title, description, estimated_hours, certification_level, far_reference) VALUES
-- Ground School
('ground_school', 'Aerodynamics & Principles of Flight', 'Understand lift, drag, thrust, weight, and how they affect aircraft performance.', 4, 'private', 'FAR 61.105(b)(1)'),
('ground_school', 'Aircraft Systems', 'Learn about engine, electrical, fuel, and flight control systems.', 3, 'private', 'FAR 61.105(b)(2)'),
('ground_school', 'Weather Theory & Reports', 'Interpret METARs, TAFs, and understand weather patterns affecting flight.', 5, 'private', 'FAR 61.105(b)(5)'),
('ground_school', 'Navigation & Flight Planning', 'VFR navigation techniques, chart reading, and flight computer use.', 4, 'private', 'FAR 61.105(b)(7)'),
('ground_school', 'Federal Aviation Regulations', 'Part 61, 91, and related regulations for private pilots.', 4, 'private', 'FAR 61.105(b)(8)'),
('ground_school', 'Aeromedical Factors', 'Hypoxia, spatial disorientation, and physiological factors.', 2, 'private', 'FAR 61.105(b)(9)'),
('ground_school', 'Airspace & ATC Procedures', 'Understanding airspace classes, communication, and ATC.', 3, 'private', 'FAR 61.105(b)(10)'),
('ground_school', 'Airport Operations', 'Taxiing, runway markings, lighting, and traffic patterns.', 2, 'private', 'FAR 61.105(b)(11)'),
-- Flight Training
('flight', 'Pre-flight Procedures', 'Aircraft inspection, weight & balance, and preflight planning.', 1, 'private', 'FAR 61.107(b)(1)'),
('flight', 'Takeoffs & Landings', 'Normal, crosswind, short field, and soft field takeoffs/landings.', 8, 'private', 'FAR 61.109(a)(2)'),
('flight', 'Basic Maneuvers', 'Straight and level, climbs, descents, turns, and stalls.', 5, 'private', 'FAR 61.107(b)(3)'),
('flight', 'Slow Flight & Stalls', 'Power-on stalls, power-off stalls, and slow flight practice.', 3, 'private', 'FAR 61.107(b)(4)'),
('flight', 'Ground Reference Maneuvers', 'S-turns, turns around a point, rectangular course.', 3, 'private', 'FAR 61.107(b)(5)'),
('flight', 'Emergency Procedures', 'Engine failures, emergency landings, and system malfunctions.', 2, 'private', 'FAR 61.107(b)(11)'),
('flight', 'Night Flying', 'Night takeoffs, landings, and navigation (3 hours required).', 3, 'private', 'FAR 61.109(a)(2)'),
('flight', 'Cross-Country Flight', 'Navigation flights over 50nm with landings at other airports.', 5, 'private', 'FAR 61.109(a)(5)'),
('flight', 'Solo Practice', 'Solo practice of maneuvers and cross-country (10 hours required).', 10, 'private', 'FAR 61.109(a)(5)'),
-- Simulator
('simulator', 'Basic Instrument Flying', 'Instrument reference to straight and level, turns, climbs, descents.', 3, 'private', 'FAR 61.109(a)(3)'),
-- Exam Prep
('exam', 'FAA Knowledge Test Prep', 'Study and practice for the FAA Private Pilot written exam.', 20, 'private', 'FAR 61.103(d)'),
('exam', 'Oral Exam Preparation', 'Prepare for the oral portion of the practical test.', 5, 'private', 'FAR 61.103(f)'),
('exam', 'Checkride Preparation', 'Review all maneuvers and procedures for the practical test.', 5, 'private', 'FAR 61.103(f)');

-- ============================================
-- HELPER FUNCTION: Update timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_tasks_updated_at
  BEFORE UPDATE ON user_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
