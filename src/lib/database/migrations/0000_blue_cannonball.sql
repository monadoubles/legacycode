CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_path" text NOT NULL,
	"relative_path" text,
	"file_size" integer NOT NULL,
	"file_type" varchar(10) NOT NULL,
	"mime_type" varchar(100),
	"content_hash" varchar(64) NOT NULL,
	"encoding" varchar(20) DEFAULT 'utf-8',
	"status" varchar(20) DEFAULT 'uploaded' NOT NULL,
	"processing_started_at" timestamp,
	"processing_completed_at" timestamp,
	"uploaded_by" varchar(100),
	"upload_session_id" uuid,
	"batch_id" uuid,
	"is_analyzed" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"has_errors" boolean DEFAULT false,
	"error_message" text,
	"error_details" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid NOT NULL,
	"lines_of_code" integer DEFAULT 0 NOT NULL,
	"code_lines" integer DEFAULT 0 NOT NULL,
	"comment_lines" integer DEFAULT 0 NOT NULL,
	"blank_lines" integer DEFAULT 0 NOT NULL,
	"cyclomatic_complexity" integer DEFAULT 0 NOT NULL,
	"nesting_depth" integer DEFAULT 0 NOT NULL,
	"maintainability_index" numeric(5, 2) DEFAULT '0',
	"function_count" integer DEFAULT 0 NOT NULL,
	"class_count" integer DEFAULT 0 NOT NULL,
	"loop_count" integer DEFAULT 0 NOT NULL,
	"conditional_count" integer DEFAULT 0 NOT NULL,
	"technology_type" varchar(50) NOT NULL,
	"sql_join_count" integer DEFAULT 0,
	"dependency_count" integer DEFAULT 0,
	"complexity_level" varchar(20) DEFAULT 'low' NOT NULL,
	"risk_score" numeric(5, 2) DEFAULT '0',
	"analysis_version" varchar(20) NOT NULL,
	"detailed_metrics" jsonb,
	"issues_found" jsonb,
	"analyzed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"version" varchar(20) DEFAULT '1.0' NOT NULL,
	"file_ids" jsonb NOT NULL,
	"filters" jsonb,
	"settings" jsonb,
	"total_files" integer DEFAULT 0 NOT NULL,
	"total_lines_of_code" integer DEFAULT 0,
	"average_complexity" numeric(5, 2) DEFAULT '0',
	"high_complexity_files" integer DEFAULT 0,
	"technology_distribution" jsonb,
	"complexity_distribution" jsonb,
	"summary" jsonb,
	"recommendations" jsonb,
	"status" varchar(20) DEFAULT 'generating' NOT NULL,
	"generated_by" varchar(100),
	"export_formats" jsonb,
	"last_exported_at" timestamp,
	"is_public" boolean DEFAULT false,
	"is_template" boolean DEFAULT false,
	"is_pinned" boolean DEFAULT false,
	"generated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"analysis_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"category" varchar(50) NOT NULL,
	"start_line" integer,
	"end_line" integer,
	"start_column" integer,
	"end_column" integer,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"explanation" text,
	"code_snippet" text,
	"suggested_fix" text,
	"modernization_approach" text,
	"alternative_solutions" jsonb,
	"impact_score" numeric(3, 2) DEFAULT '0',
	"effort_estimate" varchar(20),
	"ai_model" varchar(50),
	"ai_confidence" numeric(3, 2) DEFAULT '0',
	"ai_prompt_used" text,
	"tags" jsonb,
	"references" jsonb,
	"examples" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_analysis_id_analyses_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."analyses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "files_filename_idx" ON "files" USING btree ("filename");--> statement-breakpoint
CREATE INDEX "files_file_type_idx" ON "files" USING btree ("file_type");--> statement-breakpoint
CREATE INDEX "files_status_idx" ON "files" USING btree ("status");--> statement-breakpoint
CREATE INDEX "files_content_hash_idx" ON "files" USING btree ("content_hash");--> statement-breakpoint
CREATE INDEX "files_upload_session_idx" ON "files" USING btree ("upload_session_id");--> statement-breakpoint
CREATE INDEX "files_batch_id_idx" ON "files" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "files_created_at_idx" ON "files" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "files_content_hash_unique" ON "files" USING btree ("content_hash");--> statement-breakpoint
CREATE INDEX "analyses_file_id_idx" ON "analyses" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "analyses_technology_type_idx" ON "analyses" USING btree ("technology_type");--> statement-breakpoint
CREATE INDEX "analyses_complexity_level_idx" ON "analyses" USING btree ("complexity_level");--> statement-breakpoint
CREATE INDEX "analyses_analyzed_at_idx" ON "analyses" USING btree ("analyzed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "analyses_file_version_unique" ON "analyses" USING btree ("file_id","analysis_version");--> statement-breakpoint
CREATE INDEX "reports_name_idx" ON "reports" USING btree ("name");--> statement-breakpoint
CREATE INDEX "reports_version_idx" ON "reports" USING btree ("version");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reports_generated_by_idx" ON "reports" USING btree ("generated_by");--> statement-breakpoint
CREATE INDEX "reports_created_at_idx" ON "reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reports_generated_at_idx" ON "reports" USING btree ("generated_at");--> statement-breakpoint
CREATE INDEX "suggestions_analysis_id_idx" ON "suggestions" USING btree ("analysis_id");--> statement-breakpoint
CREATE INDEX "suggestions_type_idx" ON "suggestions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "suggestions_severity_idx" ON "suggestions" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "suggestions_category_idx" ON "suggestions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "suggestions_start_line_idx" ON "suggestions" USING btree ("start_line");--> statement-breakpoint
CREATE INDEX "suggestions_created_at_idx" ON "suggestions" USING btree ("created_at");