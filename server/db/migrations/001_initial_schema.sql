CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('faculty', 'ta', 'student', 'administrator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deliverables (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE versions (
  id BIGSERIAL PRIMARY KEY,
  deliverable_id BIGINT NOT NULL REFERENCES deliverables(id),
  version_number VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  change_summary TEXT NOT NULL,
  author_id BIGINT NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (deliverable_id, version_number)
);

CREATE TABLE files (
  id BIGSERIAL PRIMARY KEY,
  version_id BIGINT NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
  original_name VARCHAR(255) NOT NULL,
  storage_key VARCHAR(512) NOT NULL UNIQUE,
  mime_type VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL CHECK (size >= 0),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX versions_deliverable_id_index ON versions(deliverable_id);
CREATE INDEX versions_author_id_index ON versions(author_id);
CREATE INDEX files_version_id_index ON files(version_id);
