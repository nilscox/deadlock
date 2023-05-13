import { Migration } from '@mikro-orm/migrations';

/* eslint-disable */

export class Migration20230513010517 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "level" ("id" varchar(255) not null, "width" int not null, "height" int not null, "blocks" jsonb not null, "start" jsonb not null, "teleports" jsonb not null, "fingerprint" varchar(255) not null, "position" int not null, "difficulty" real not null, "number_of_solutions_score" real not null, "easiest_solution_score" real not null, constraint "level_pkey" primary key ("id"));');
    this.addSql('alter table "level" add constraint "level_fingerprint_unique" unique ("fingerprint");');
    this.addSql('alter table "level" add constraint "level_position_unique" unique ("position");');

    this.addSql('create table "session" ("id" varchar(255) not null, "date" timestamptz(0) not null, "ip" varchar(255) not null, "level_id" varchar(255) not null, "completed" boolean not null, "tries" int not null, "time" int not null, constraint "session_pkey" primary key ("id"));');

    this.addSql('create table "solution" ("id" varchar(255) not null, "level_id" varchar(255) not null, "path" jsonb not null, "complexity" int not null, constraint "solution_pkey" primary key ("id"));');

    this.addSql('alter table "session" add constraint "session_level_id_foreign" foreign key ("level_id") references "level" ("id") on update cascade;');

    this.addSql('alter table "solution" add constraint "solution_level_id_foreign" foreign key ("level_id") references "level" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "session" drop constraint "session_level_id_foreign";');

    this.addSql('alter table "solution" drop constraint "solution_level_id_foreign";');

    this.addSql('drop table if exists "level" cascade;');

    this.addSql('drop table if exists "session" cascade;');

    this.addSql('drop table if exists "solution" cascade;');
  }

}
