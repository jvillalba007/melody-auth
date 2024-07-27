-- Migration number: 0004 	 2024-07-19T19:26:30.000Z
CREATE TABLE [role] (
  "id" integer PRIMARY KEY,
  "name" text NOT NULL,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null
);
CREATE UNIQUE INDEX idx_unique_role_name ON role (name) WHERE deletedAt IS NULL;
INSERT INTO role ("name") values ("super_admin");
