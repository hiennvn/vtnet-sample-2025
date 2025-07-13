-- Initial database schema for the Project Document Management System

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
);

-- Roles table
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- User roles mapping table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Projects table
CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_project_status (status),
    INDEX idx_project_created_by (created_by)
);

-- Project members table
CREATE TABLE project_members (
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    added_by BIGINT NOT NULL,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users(id),
    INDEX idx_project_member_role (role)
);

-- Folders table
CREATE TABLE folders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    parent_folder_id BIGINT,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_folder_id) REFERENCES folders(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY uk_folder_name_parent (project_id, parent_folder_id, name),
    INDEX idx_folder_project (project_id),
    INDEX idx_folder_parent (parent_folder_id)
);

-- Documents table
CREATE TABLE documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    folder_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY uk_document_name_folder (folder_id, name),
    INDEX idx_document_folder (folder_id),
    INDEX idx_document_mime_type (mime_type)
);

-- Document versions table
CREATE TABLE document_versions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    version_number INT NOT NULL,
    storage_path VARCHAR(512) NOT NULL,
    size BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY uk_document_version (document_id, version_number),
    INDEX idx_document_version_document (document_id)
);

-- Document content table for search indexing
CREATE TABLE document_content (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_version_id BIGINT NOT NULL,
    content_text LONGTEXT,
    indexed_at TIMESTAMP NULL,
    embedding_status VARCHAR(20) DEFAULT 'PENDING',
    FOREIGN KEY (document_version_id) REFERENCES document_versions(id) ON DELETE CASCADE,
    INDEX idx_document_content_version (document_version_id),
    INDEX idx_document_content_embedding_status (embedding_status)
);

-- Chatbot conversations table
CREATE TABLE chatbot_conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    project_id BIGINT,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_conversation_user (user_id),
    INDEX idx_conversation_project (project_id)
);

-- Chatbot messages table
CREATE TABLE chatbot_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    message_type VARCHAR(10) NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
    INDEX idx_message_conversation (conversation_id),
    INDEX idx_message_type (message_type)
);

-- Chatbot references table
CREATE TABLE chatbot_references (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT NOT NULL,
    document_id BIGINT NOT NULL,
    relevance_score FLOAT NOT NULL,
    FOREIGN KEY (message_id) REFERENCES chatbot_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    INDEX idx_reference_message (message_id),
    INDEX idx_reference_document (document_id)
);

-- Insert default roles
INSERT INTO roles (name) VALUES ('ROLE_ADMIN');
INSERT INTO roles (name) VALUES ('ROLE_DIRECTOR');
INSERT INTO roles (name) VALUES ('ROLE_PROJECT_MANAGER');
INSERT INTO roles (name) VALUES ('ROLE_TEAM_MEMBER');

-- Insert default admin user (password: admin)
INSERT INTO users (email, password_hash, name) 
VALUES ('admin@vtnet.com', '$2a$12$COBhaGrAA4od4aNE5LpnP.2Sp8FeR0260YTiMHimW1xG3clH67wzm', 'System Administrator');

-- Assign admin role to admin user
INSERT INTO user_roles (user_id, role_id) 
VALUES (1, (SELECT id FROM roles WHERE name = 'ROLE_ADMIN')); 