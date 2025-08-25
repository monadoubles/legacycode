import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  decimal,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { files } from './file';

export const reports = pgTable(
  'reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    
    // Report metadata
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    version: varchar('version', { length: 20 }).notNull().default('1.0'),
    
    // Report configuration
    fileIds: jsonb('file_ids').notNull(), // Array of file IDs included in report
    filters: jsonb('filters'), // Applied filters
    settings: jsonb('settings'), // Report generation settings
    
    // Aggregated metrics
    totalFiles: integer('total_files').notNull().default(0),
    totalLinesOfCode: integer('total_lines_of_code').default(0),
    averageComplexity: decimal('average_complexity', { precision: 5, scale: 2 }).default('0'),
    highComplexityFiles: integer('high_complexity_files').default(0),
    
    // Technology breakdown
    technologyDistribution: jsonb('technology_distribution'),
    complexityDistribution: jsonb('complexity_distribution'),
    
    // Summary data
    summary: jsonb('summary'),
    recommendations: jsonb('recommendations'),
    
    // Report status
    status: varchar('status', { length: 20 }).notNull().default('generating'),
    generatedBy: varchar('generated_by', { length: 100 }),
    
    // Export information
    exportFormats: jsonb('export_formats'), // Available export formats
    lastExportedAt: timestamp('last_exported_at'),
    
    // Flags
    isPublic: boolean('is_public').default(false),
    isTemplate: boolean('is_template').default(false),
    isPinned: boolean('is_pinned').default(false),
    
    // Timestamps
    generatedAt: timestamp('generated_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index('reports_name_idx').on(table.name),
    versionIdx: index('reports_version_idx').on(table.version),
    statusIdx: index('reports_status_idx').on(table.status),
    generatedByIdx: index('reports_generated_by_idx').on(table.generatedBy),
    createdAtIdx: index('reports_created_at_idx').on(table.createdAt),
    generatedAtIdx: index('reports_generated_at_idx').on(table.generatedAt),
  })
);

// Relations
export const reportsRelations = relations(reports, ({ many }) => ({
  files: many(files),
}));

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;

// Report status enum
export const ReportStatus = {
  GENERATING: 'generating',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ARCHIVED: 'archived',
} as const;

export type ReportStatusType = (typeof ReportStatus)[keyof typeof ReportStatus];

// Export format enum
export const ExportFormat = {
  JSON: 'json',
  CSV: 'csv',
  PDF: 'pdf',
  XLSX: 'xlsx',
} as const;

export type ExportFormatType = (typeof ExportFormat)[keyof typeof ExportFormat];
