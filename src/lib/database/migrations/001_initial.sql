-- Initial migration for Legacy Code Analyzer
-- This creates all the necessary tables and indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Files table
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_path TEXT NOT NULL,
    relative_path TEXT,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(10) NOT NULL,
    mime_type VARCHAR(100),
    content_hash VARCHAR(64) NOT NULL,
    encoding VARCHAR(20) DEFAULT 'utf-8',
    status VARCHAR(20) NOT NULL DEFAULT 'uploaded',
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    uploaded_by VARCHAR(100),
    upload_session_id UUID,
    batch_id UUID,
    is_analyzed BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    has_errors BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    error_details TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE NOT NULL,
    lines_of_code INTEGER NOT NULL DEFAULT 0,
    code_lines INTEGER NOT NULL DEFAULT 0,
    comment_lines INTEGER NOT NULL DEFAULT 0,
    blank_lines INTEGER NOT NULL DEFAULT 0,
    cyclomatic_complexity INTEGER NOT NULL DEFAULT 0,
    nesting_depth INTEGER NOT NULL DEFAULT 0,
    maintainability_index DECIMAL(5,2) DEFAULT 0,
    function_count INTEGER NOT NULL DEFAULT 0,
    class_count INTEGER NOT NULL DEFAULT 0,
    loop_count INTEGER NOT NULL DEFAULT 0,
    conditional_count INTEGER NOT NULL DEFAULT 0,
    technology_type VARCHAR(50) NOT NULL,
    sql_join_count INTEGER DEFAULT 0,
    dependency_count INTEGER DEFAULT 0,
    complexity_level VARCHAR(20) NOT NULL DEFAULT 'low',
    risk_score DECIMAL(5,2) DEFAULT 0,
    analysis_version VARCHAR(20) NOT NULL,
    detailed_metrics JSONB,
    issues_found JSONB,
    analyzed_at TIMESTAMP DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    file_ids JSONB NOT NULL,
    filters JSONB,
    settings JSONB,
    total_files INTEGER NOT NULL DEFAULT 0,
    total_lines_of_code INTEGER DEFAULT 0,
    average_complexity DECIMAL(5,2) DEFAULT 0,
    high_complexity_files INTEGER DEFAULT 0,
    technology_distribution JSONB,
    complexity_distribution JSONB,
    summary JSONB,
    recommendations JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'generating',
    generated_by VARCHAR(100),
    export_formats JSONB,
    last_exported_at TIMESTAMP,
    is_public BOOLEAN DEFAULT FALSE,
    is_template BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    generated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    start_line INTEGER,
    end_line INTEGER,
    start_column INTEGER,
    end_column INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    explanation TEXT,
    code_snippet TEXT,
    suggested_fix TEXT,
    modernization_approach TEXT,
    alternative_solutions JSONB,
    impact_score DECIMAL(3,2) DEFAULT 0,
    effort_estimate VARCHAR(20),
    ai_model VARCHAR(50),
    ai_confidence DECIMAL(3,2) DEFAULT 0,
    ai_prompt_used TEXT,
    tags JSONB,
    references JSONB,
    examples JSONB,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS files_filename_idx ON files(filename);
CREATE INDEX IF NOT EXISTS files_file_type_idx ON files(file_type);
CREATE INDEX IF NOT EXISTS files_status_idx ON files(status);
CREATE INDEX IF NOT EXISTS files_content_hash_idx ON files(content_hash);
CREATE INDEX IF NOT EXISTS files_upload_session_idx ON files(upload_session_id);
CREATE INDEX IF NOT EXISTS files_batch_id_idx ON files(batch_id);
CREATE INDEX IF NOT EXISTS files_created_at_idx ON files(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS files_content_hash_unique ON files(content_hash);

CREATE INDEX IF NOT EXISTS analyses_file_id_idx ON analyses(file_id);
CREATE INDEX IF NOT EXISTS analyses_technology_type_idx ON analyses(technology_type);
CREATE INDEX IF NOT EXISTS analyses_complexity_level_idx ON analyses(complexity_level);
CREATE INDEX IF NOT EXISTS analyses_analyzed_at_idx ON analyses(analyzed_at);
CREATE UNIQUE INDEX IF NOT EXISTS analyses_file_version_unique ON analyses(file_id, analysis_version);

CREATE INDEX IF NOT EXISTS reports_name_idx ON reports(name);
CREATE INDEX IF NOT EXISTS reports_version_idx ON reports(version);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
CREATE INDEX IF NOT EXISTS reports_generated_by_idx ON reports(generated_by);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at);
CREATE INDEX IF NOT EXISTS reports_generated_at_idx ON reports(generated_at);

CREATE INDEX IF NOT EXISTS suggestions_analysis_id_idx ON suggestions(analysis_id);
CREATE INDEX IF NOT EXISTS suggestions_type_idx ON suggestions(type);
CREATE INDEX IF NOT EXISTS suggestions_severity_idx ON suggestions(severity);
CREATE INDEX IF NOT EXISTS suggestions_category_idx ON suggestions(category);
CREATE INDEX IF NOT EXISTS suggestions_start_line_idx ON suggestions(start_line);
CREATE INDEX IF NOT EXISTS suggestions_created_at_idx ON suggestions(created_at);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_suggestions_updated_at BEFORE UPDATE ON suggestions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
