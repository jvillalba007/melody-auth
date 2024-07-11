-- Migration number: 0001 	 2024-07-09T02:01:37.604Z
CREATE TABLE [app] (
  "id" integer PRIMARY KEY,
  "clientId" text NOT NULL,
  "secret" text NOT NULL,
  "redirectUris" text NOT NULL DEFAULT "",
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null,
  UNIQUE(clientId)
);
