ALTER TABLE "mikro_orm_migrations" DISABLE ROW LEVEL SECURITY;
DROP TABLE "mikro_orm_migrations" CASCADE;

DROP VIEW "public"."level_difficulty";
DROP VIEW "public"."level_sessions";

CREATE TYPE "public"."level_flag" AS ENUM('déjàVu', 'easy', 'hard', 'cool');

ALTER TABLE "level" ALTER COLUMN "id" SET DATA TYPE varchar(16);
ALTER TABLE "level" ALTER COLUMN "created_at" SET DATA TYPE timestamp;
ALTER TABLE "level" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "level" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;
ALTER TABLE "level" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE "level" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp;
ALTER TABLE "level" ALTER COLUMN "flags" SET DEFAULT '{}'::"public"."level_flag"[];
ALTER TABLE "level" ALTER COLUMN "flags" SET DATA TYPE "public"."level_flag"[] USING "flags"::"public"."level_flag"[];

ALTER TABLE "session" ALTER COLUMN "id" SET DATA TYPE varchar(16);
ALTER TABLE "session" ALTER COLUMN "date" SET DATA TYPE timestamp;
ALTER TABLE "session" ALTER COLUMN "ip" SET DATA TYPE varchar(40);
ALTER TABLE "session" ALTER COLUMN "level_id" SET DATA TYPE varchar(16);
ALTER TABLE "session" ALTER COLUMN "created_at" SET DATA TYPE timestamp;
ALTER TABLE "session" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DEFAULT now();

ALTER TABLE "session" DROP CONSTRAINT "session_level_id_foreign";
ALTER TABLE "session" ADD CONSTRAINT "session_level_id_level_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."level"("id") ON DELETE no action ON UPDATE no action;

CREATE VIEW "public"."level_sessions" AS (
select
  l.id level_id,
  min(s.tries) tries_min,
  max(s.tries) tries_max,
  avg(s.tries) tries_avg,
  min(s.time) / 1000 time_min,
  max(s.time) / 1000 time_max,
  avg(s.time) / 1000 time_avg
from
  level l
  join session s on l.id = s.level_id
group by
  l.id
order by
  l.position
);

CREATE VIEW "public"."level_difficulty" AS (
select
  level_id,
  case
    -- when l.flags @> '{easy}' then 1
    -- when l.flags @> '{hard}' then 6
    when tries_avg <= 1 or time_avg < 5 then 1
    when tries_avg <= 3 or time_avg < 10 then 2
    when tries_avg <= 6 or time_avg < 15 then 3
    when tries_avg <= 10 or time_avg < 25 then 4
    when tries_avg <= 20 or time_avg < 90 then 5
    else 6
  end difficulty
from
  level l
  join level_sessions s on s.level_id = l.id
);
