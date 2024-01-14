import { Migration } from '@mikro-orm/migrations';

/* eslint-disable */

export class Migration20240114153047 extends Migration {

  async up(): Promise<void> {
    this.addSql('drop table if exists "solution" cascade;');

    this.addSql('alter table "level" drop column "number_of_solutions_score";');
    this.addSql('alter table "level" drop column "easiest_solution_score";');
  }

  async down(): Promise<void> {
    this.addSql('create table "solution" ("id" varchar not null default null, "level_id" varchar not null default null, "path" jsonb not null default null, "complexity" int4 not null default null, "created_at" timestamptz not null default null, "updated_at" timestamptz not null default null, constraint "solution_pkey" primary key ("id"));');

    this.addSql('alter table "solution" add constraint "solution_level_id_foreign" foreign key ("level_id") references "level" ("id") on update cascade on delete no action;');

    this.addSql('alter table "level" add column "number_of_solutions_score" float4 not null default null, add column "easiest_solution_score" float4 not null default null;');
  }

}
