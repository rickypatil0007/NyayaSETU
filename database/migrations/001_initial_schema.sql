-- Supabase Initial Schema for NyaySetu

-- 1. Audits Table
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id), -- If using Supabase Auth
    name TEXT NOT NULL,
    document_url TEXT,
    jurisdiction TEXT DEFAULT 'India',
    audit_type TEXT DEFAULT 'Regulatory Compliance',
    status TEXT DEFAULT 'PENDING', -- PENDING, RUNNING, COMPLETED, FAILED
    risk_level TEXT, -- CLEAR, LOW, MEDIUM, HIGH
    confidence_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Audit Events Table (For streaming execution state)
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
    stage TEXT NOT NULL, -- e.g., 'Document Processing', 'Clause Detection'
    status TEXT NOT NULL, -- 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED'
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Findings Table
CREATE TABLE IF NOT EXISTS findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
    clause_text TEXT NOT NULL,
    location TEXT, -- e.g., 'Page 8, Section 12.2'
    risk_level TEXT NOT NULL, -- LOW, MEDIUM, HIGH
    confidence_score INTEGER,
    issue_description TEXT NOT NULL,
    reviewer_comment TEXT,
    skeptic_comment TEXT,
    supervisor_comment TEXT,
    status TEXT DEFAULT 'ESCALATED', -- ESCALATED, CONFIRMED, ACCEPTED RISK
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Evidence (Linked to Findings)
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID REFERENCES findings(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL, -- e.g., 'Digital Personal Data Protection Act, 2023'
    section TEXT NOT NULL,
    relevance_score FLOAT,
    quote TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Enable Row Level Security (RLS) if required for frontend client access
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;

-- Basic Policies (assuming authenticated user access)
CREATE POLICY "Users can view their own audits" ON audits FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can view events for their audits" ON audit_events FOR SELECT USING (EXISTS (SELECT 1 FROM audits WHERE id = audit_id AND owner_id = auth.uid()));
CREATE POLICY "Users can view findings for their audits" ON findings FOR SELECT USING (EXISTS (SELECT 1 FROM audits WHERE id = audit_id AND owner_id = auth.uid()));
CREATE POLICY "Users can view evidence for their findings" ON evidence FOR SELECT USING (EXISTS (SELECT 1 FROM findings f JOIN audits a ON f.audit_id = a.id WHERE f.id = finding_id AND a.owner_id = auth.uid()));
