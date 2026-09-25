-- Migration: Knowledge Base Provenance Schema
-- Adds minimum relational schema for RAG/Legal Knowledge Base traceability.

CREATE TABLE IF NOT EXISTS legal_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    jurisdiction TEXT,
    document_type TEXT,
    status TEXT NOT NULL, -- e.g., in_force, repealed, partially_in_force, archived
    in_force_from DATE,
    repealed_on DATE,
    superseded_by TEXT,
    amended_up_to DATE,
    sha256 TEXT,
    official_url TEXT,
    is_authoritative BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by source_id (Pinecone namespace equivalent)
CREATE INDEX IF NOT EXISTS idx_legal_sources_source_id ON legal_sources(source_id);
CREATE INDEX IF NOT EXISTS idx_legal_sources_status ON legal_sources(status);
CREATE INDEX IF NOT EXISTS idx_legal_sources_in_force_from ON legal_sources(in_force_from);
CREATE INDEX IF NOT EXISTS idx_legal_sources_repealed_on ON legal_sources(repealed_on);

-- Relationships Table (Repeal/Replacement Crosswalk)
CREATE TABLE IF NOT EXISTS legal_source_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES legal_sources(id) ON DELETE CASCADE,
    related_source_id UUID REFERENCES legal_sources(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL, -- supersedes, superseded_by, repeals, repealed_by, amends, amended_by
    effective_from DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (source_id, related_source_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_legal_source_relationships_source ON legal_source_relationships(source_id);
CREATE INDEX IF NOT EXISTS idx_legal_source_relationships_related ON legal_source_relationships(related_source_id);

-- Ingestion Runs
CREATE TABLE IF NOT EXISTS knowledge_ingestion_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL, -- 'in_progress', 'completed', 'failed'
    source_count INTEGER DEFAULT 0,
    sections_detected INTEGER DEFAULT 0,
    chunks_produced INTEGER DEFAULT 0,
    vectors_deleted INTEGER DEFAULT 0,
    vectors_inserted INTEGER DEFAULT 0,
    embedding_failures INTEGER DEFAULT 0,
    error_message TEXT,
    triggered_by TEXT
);

-- Ingestion Sources (Per Source metrics in a run)
CREATE TABLE IF NOT EXISTS knowledge_ingestion_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingestion_run_id UUID REFERENCES knowledge_ingestion_runs(id) ON DELETE CASCADE,
    legal_source_id UUID REFERENCES legal_sources(id) ON DELETE CASCADE,
    sections_detected INTEGER DEFAULT 0,
    chunks_produced INTEGER DEFAULT 0,
    empty_chunks INTEGER DEFAULT 0,
    vectors_deleted INTEGER DEFAULT 0,
    vectors_inserted INTEGER DEFAULT 0,
    embedding_failures INTEGER DEFAULT 0,
    status TEXT NOT NULL, -- 'success', 'failed'
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_ingestion_sources_run ON knowledge_ingestion_sources(ingestion_run_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_ingestion_sources_source ON knowledge_ingestion_sources(legal_source_id);

-- Links audit findings explicitly back to the legal source used
CREATE TABLE IF NOT EXISTS finding_legal_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finding_id UUID REFERENCES findings(id) ON DELETE CASCADE,
    legal_source_id UUID REFERENCES legal_sources(id) ON DELETE CASCADE,
    section_number TEXT,
    section_title TEXT,
    citation_text TEXT,
    retrieval_status TEXT,
    is_primary_authority BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_finding_legal_sources_finding ON finding_legal_sources(finding_id);
CREATE INDEX IF NOT EXISTS idx_finding_legal_sources_source ON finding_legal_sources(legal_source_id);

-- Enable RLS (Service Role Only by default unless policies are added)
ALTER TABLE legal_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_source_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_ingestion_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_ingestion_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE finding_legal_sources ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users to legal_sources
CREATE POLICY "Allow public read access to legal sources" ON legal_sources FOR SELECT USING (true);
CREATE POLICY "Allow public read access to relationships" ON legal_source_relationships FOR SELECT USING (true);
CREATE POLICY "Allow public read access to finding sources" ON finding_legal_sources FOR SELECT USING (true);

-- No public insert policies; these tables are strictly managed by the backend service key.
