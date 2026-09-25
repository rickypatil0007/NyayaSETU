-- 00001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: profiles
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- RLS: profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile." ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to create a profile automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (new.id, new.raw_user_meta_data->>'full_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Table: audits
CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID,
    status TEXT NOT NULL DEFAULT 'CREATED',
    contract_type TEXT,
    corpus_snapshot_id UUID,
    consensus_threshold INTEGER,
    round_cap INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- RLS: audits
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own audits." ON audits FOR ALL USING (auth.uid() = owner_id);

-- Table: audit_events
CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- RLS: audit_events
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
-- For policies, we join with audits to check owner_id.
CREATE POLICY "Users can view own audit events." ON audit_events FOR SELECT
USING (EXISTS (SELECT 1 FROM audits WHERE audits.id = audit_events.audit_id AND audits.owner_id = auth.uid()));

-- Insert events can also check ownership
CREATE POLICY "Users can insert own audit events." ON audit_events FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM audits WHERE audits.id = audit_events.audit_id AND audits.owner_id = auth.uid()));
