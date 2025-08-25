import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  jsonb,
  boolean,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { files } from './file';
import { suggestions } from './suggestion';

export const analyses = pgTable(
  'analyses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fileId: uuid('file_id').references(() => files.id, { onDelete: 'cascade' }).notNull(),
    
    // Basic metrics
    linesOfCode: integer('lines_of_code').notNull().default(0),
    codeLines: integer('code_lines').notNull().default(0),
    commentLines: integer('comment_lines').notNull().default(0),
    blankLines: integer('blank_lines').notNull().default(0),
    
    // Complexity metrics
    cyclomaticComplexity: integer('cyclomatic_complexity').notNull().default(0),
    nestingDepth: integer('nesting_depth').notNull().default(0),
    maintainabilityIndex: decimal('maintainability_index', { precision: 5, scale: 2 }).default('0'),
    
    // Structure metrics
    functionCount: integer('function_count').notNull().default(0),
    classCount: integer('class_count').notNull().default(0),
    loopCount: integer('loop_count').notNull().default(0),
    conditionalCount: integer('conditional_count').notNull().default(0),
    
    // Technology specific
    technologyType: varchar('technology_type', { length: 50 }).notNull(),
    sqlJoinCount: integer('sql_join_count').default(0),
    dependencyCount: integer('dependency_count').default(0),
    
    // Quality indicators
    complexityLevel: varchar('complexity_level', { length: 20 }).notNull().default('low'),
    riskScore: decimal('risk_score', { precision: 5, scale: 2 }).default('0'),
    
    // Analysis metadata
    analysisVersion: varchar('analysis_version', { length: 20 }).notNull(),
    detailedMetrics: jsonb('detailed_metrics'),
    issuesFound: jsonb('issues_found'),
    
    // Timestamps
    analyzedAt: timestamp('analyzed_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    fileIdIdx: index('analyses_file_id_idx').on(table.fileId),
    technologyTypeIdx: index('analyses_technology_type_idx').on(table.technologyType),
    complexityLevelIdx: index('analyses_complexity_level_idx').on(table.complexityLevel),
    analyzedAtIdx: index('analyses_analyzed_at_idx').on(table.analyzedAt),
    uniqueFileAnalysis: uniqueIndex('analyses_file_version_unique').on(
      table.fileId,
      table.analysisVersion
    ),
  })
);

// Relations
export const analysesRelations = relations(analyses, ({ one, many }) => ({
  file: one(files, {
    fields: [analyses.fileId],
    references: [files.id],
  }),
  suggestions: many(suggestions),
}));

export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;
