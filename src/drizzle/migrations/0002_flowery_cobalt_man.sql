CREATE TABLE "url_metadata" (
	"url" text PRIMARY KEY NOT NULL,
	"title" text,
	"thumbnail" "bytea"
);
--> statement-breakpoint
ALTER TABLE "links" DROP COLUMN "thumbnail";