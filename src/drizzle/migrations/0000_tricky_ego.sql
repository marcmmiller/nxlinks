CREATE TABLE "links" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"created" timestamp DEFAULT now(),
	"owner" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;