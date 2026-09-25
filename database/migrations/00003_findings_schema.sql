-- 00003_findings_schema.sql

-- Table: findings
CREATE TABLE findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    clause_text TEXT,
    issue_summary TEXT,
    risk_level TEXT,
    confidence_score FLOAT,
    recommendation TEXT,
    status TEXT DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- RLS: findings
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own audit findings." ON findings FOR SELECT
USING (EXISTS (SELECT 1 FROM audits WHERE audits.id = findings.audit_id AND audits.owner_id = auth.uid()));

CREATE POLICY "Users can insert own audit findings." ON findings FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM audits WHERE audits.id = findings.audit_id AND audits.owner_id = auth.uid()));

CREATE POLICY "Users can update own audit findings." ON findings FOR UPDATE
USING (EXISTS (SELECT 1 FROM audits WHERE audits.id = findings.audit_id AND audits.owner_id = auth.uid()));

-- Table: evidence
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
    source_title TEXT NOT NULL,
    source_url TEXT,
    passage_text TEXT NOT NULL,
    relevance_score FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- RLS: evidence
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own evidence." ON evidence FOR SELECT
USING (EXISTS (
    SELECT 1 FROM findings 
    JOIN audits ON findings.audit_id = audits.id 
    WHERE findings.id = evidence.finding_id AND audits.owner_id = auth.uid()
));

CREATE POLICY "Users can insert own evidence." ON evidence FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM findings 
    JOIN audits ON findings.audit_id = audits.id 
    WHERE findings.id = evidence.finding_id AND audits.owner_id = auth.uid()
));

-- Table: escalations
CREATE TABLE escalations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    finding_id UUID REFERENCES findings(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    reviewer_position TEXT,
    skeptic_position TEXT,
    status TEXT DEFAULT 'PENDING_REVIEW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- RLS: escalations
ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own escalations." ON escalations FOR ALL
USING (EXISTS (SELECT 1 FROM audits WHERE audits.id = escalations.audit_id AND audits.owner_id = auth.uid()));

-- Alter audits to add a report column to store final report JSON and a name column
ALTER TABLE audits ADD COLUMN report JSONB;
ALTER TABLE audits ADD COLUMN name TEXT;
