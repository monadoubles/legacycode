import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { analyses } from './analysis';
import { reports } from './report';

export const files = pgTable(
  'files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    
    // File information
    filename: varchar('filename', { length: 255 }).notNull(),
    originalPath: text('original_path').notNull(),
    relativePath: text('relative_path'),
    fileSize: integer('file_size').notNull(),
    fileType: varchar('file_type', { length: 10 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }),
    
    // File content
    contentHash: varchar('content_hash', { length: 64 }).notNull(),
    encoding: varchar('encoding', { length: 20 }).default('utf-8'),
    
    // Processing status
    status: varchar('status', { length: 20 }).notNull().default('uploaded'),
    processingStartedAt: timestamp('processing_started_at'),
    processingCompletedAt: timestamp('processing_completed_at'),
    
    // Upload information
    uploadedBy: varchar('uploaded_by', { length: 100 }),
    uploadSessionId: uuid('upload_session_id'),
    batchId: uuid('batch_id'),
    
    // Flags
    isAnalyzed: boolean('is_analyzed').default(false),
    isArchived: boolean('is_archived').default(false),
    hasErrors: boolean('has_errors').default(false),
    
    // Error tracking
    errorMessage: text('error_message'),
    errorDetails: text('error_details'),
    
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    filenameIdx: index('files_filename_idx').on(table.filename),
    fileTypeIdx: index('files_file_type_idx').on(table.fileType),
    statusIdx: index('files_status_idx').on(table.status),
    contentHashIdx: index('files_content_hash_idx').on(table.contentHash),
    uploadSessionIdx: index('files_upload_session_idx').on(table.uploadSessionId),
    batchIdIdx: index('files_batch_id_idx').on(table.batchId),
    createdAtIdx: index('files_created_at_idx').on(table.createdAt),
    uniqueContentHash: uniqueIndex('files_content_hash_unique').on(table.contentHash),
  })
);

// Relations
export const filesRelations = relations(files, ({ one, many }) => ({
  analyses: many(analyses),
  reports: many(reports),
}));

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;

// File status enum
export const FileStatus = {
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  ANALYZED: 'analyzed',
  FAILED: 'failed',
  ARCHIVED: 'archived',
  PENDING: 'pending',
} as const;

export type FileStatusType = (typeof FileStatus)[keyof typeof FileStatus];

// Supported file types
export const SupportedFileTypes = {
  PERL: 'pl',
  PERL_MODULE: 'pm',
  TIBCO_XML: 'xml',
  PENTAHO_TRANSFORMATION: 'ktr',
  PENTAHO_JOB: 'kjb',
  TEXT: 'txt',
  LOG: 'log',
} as const;

export type SupportedFileType = (typeof SupportedFileTypes)[keyof typeof SupportedFileTypes];
