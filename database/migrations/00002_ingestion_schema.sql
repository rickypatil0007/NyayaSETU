-- 00002_ingestion_schema.sql

-- Table: documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    sha256 TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    page_count INTEGER,
    extraction_status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- RLS: documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own documents." ON documents FOR ALL USING (auth.uid() = owner_id);

-- Table: document_chunks
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_start INTEGER NOT NULL,
    page_end INTEGER NOT NULL,
    clause_label TEXT,
    text TEXT NOT NULL,
    text_hash TEXT NOT NULL,
    embedding_model TEXT NOT NULL,
    vector_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- RLS: document_chunks
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own document chunks." ON document_chunks FOR SELECT
USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_chunks.document_id AND documents.owner_id = auth.uid()));

CREATE POLICY "Users can insert own document chunks." ON document_chunks FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_chunks.document_id AND documents.owner_id = auth.uid()));
