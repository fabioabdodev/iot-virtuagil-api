ALTER TABLE "jade_contacts"
ADD COLUMN "sales_mode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "interest_topic" TEXT,
ADD COLUMN "lead_temperature" TEXT DEFAULT 'warm',
ADD COLUMN "commercial_status" TEXT DEFAULT 'active',
ADD COLUMN "last_commercial_intent_at" TIMESTAMPTZ,
ADD COLUMN "last_offer_at" TIMESTAMPTZ,
ADD COLUMN "opt_out_at" TIMESTAMPTZ,
ADD COLUMN "converted_at" TIMESTAMPTZ;

ALTER TABLE "jade_follow_up_queue"
ADD COLUMN "interest_topic" TEXT,
ADD COLUMN "follow_up_stage" TEXT DEFAULT 'initial',
ADD COLUMN "offer_type" TEXT,
ADD COLUMN "last_response" TEXT,
ADD COLUMN "last_offer_at" TIMESTAMPTZ,
ADD COLUMN "opt_out_at" TIMESTAMPTZ;

ALTER TABLE "jade_human_handoff"
ADD COLUMN "interest_topic" TEXT,
ADD COLUMN "commercial_intent" TEXT,
ADD COLUMN "source_stage" TEXT;

CREATE INDEX IF NOT EXISTS "idx_jade_contacts_commercial_status"
ON "jade_contacts" ("commercial_status", "updated_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_jade_contacts_interest_topic"
ON "jade_contacts" ("interest_topic");

CREATE INDEX IF NOT EXISTS "idx_jade_contacts_is_client_sales_mode"
ON "jade_contacts" ("is_client", "sales_mode");

CREATE INDEX IF NOT EXISTS "idx_jade_followup_stage_status_next"
ON "jade_follow_up_queue" ("follow_up_stage", "status", "next_contact_at");

CREATE INDEX IF NOT EXISTS "idx_jade_handoff_interest_status_created"
ON "jade_human_handoff" ("interest_topic", "status", "created_at" DESC);
