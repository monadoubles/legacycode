import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  decimal,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { analyses } from './analysis';

export const suggestions = pgTable(
  'suggestions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    analysisId: uuid('analysis_id').references(() => analyses.id, { onDelete: 'cascade' }).notNull(),
    
    // Suggestion details
    type: varchar('type', { length: 50 }).notNull(), // refactor, security, performance, etc.
    severity: varchar('severity', { length: 20 }).notNull(), // low, medium, high, critical
    category: varchar('category', { length: 50 }).notNull(), // complexity, maintainability, security
    
    // Location information
    startLine: integer('start_line'),
    endLine: integer('end_line'),
    startColumn: integer('start_column'),
    endColumn: integer('end_column'),
    
    // Content
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    explanation: text('explanation'),
    codeSnippet: text('code_snippet'),
    
    // Solution
    suggestedFix: text('suggested_fix'),
    modernizationApproach: text('modernization_approach'),
    alternativeSolutions: jsonb('alternative_solutions'),
    
    // Impact assessment
    impactScore: decimal('impact_score', { precision: 3, scale: 2 }).default('0'),
    effortEstimate: varchar('effort_estimate', { length: 20 }), // low, medium, high
    
    // AI metadata
    aiModel: varchar('ai_model', { length: 50 }),
    aiConfidence: decimal('ai_confidence', { precision: 3, scale: 2 }).default('0'),
    aiPromptUsed: text('ai_prompt_used'),
    
    // Additional context
    tags: jsonb('tags'), // Array of tags
    references: jsonb('references'), // External references
    examples: jsonb('examples'), // Code examples
    
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    analysisIdIdx: index('suggestions_analysis_id_idx').on(table.analysisId),
    typeIdx: index('suggestions_type_idx').on(table.type),
    severityIdx: index('suggestions_severity_idx').on(table.severity),
    categoryIdx: index('suggestions_category_idx').on(table.category),
    startLineIdx: index('suggestions_start_line_idx').on(table.startLine),
    createdAtIdx: index('suggestions_created_at_idx').on(table.createdAt),
  })
);

// Relations
export const suggestionsRelations = relations(suggestions, ({ one }) => ({
  analysis: one(analyses, {
    fields: [suggestions.analysisId],
    references: [analyses.id],
  }),
}));

export type Suggestion = typeof suggestions.$inferSelect;
export type NewSuggestion = typeof suggestions.$inferInsert;

// Suggestion types
export const SuggestionType = {
  REFACTOR: 'refactor',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  MAINTAINABILITY: 'maintainability',
  MODERNIZATION: 'modernization',
  BUG_FIX: 'bug_fix',
  CODE_STYLE: 'code_style',
  DOCUMENTATION: 'documentation',
} as const;

export type SuggestionTypeType = (typeof SuggestionType)[keyof typeof SuggestionType];

// Severity levels
export const SeverityLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type SeverityLevelType = (typeof SeverityLevel)[keyof typeof SeverityLevel];

// Categories
export const SuggestionCategory = {
  COMPLEXITY: 'complexity',
  MAINTAINABILITY: 'maintainability',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  RELIABILITY: 'reliability',
  PORTABILITY: 'portability',
} as const;

export type SuggestionCategoryType = (typeof SuggestionCategory)[keyof typeof SuggestionCategory];
