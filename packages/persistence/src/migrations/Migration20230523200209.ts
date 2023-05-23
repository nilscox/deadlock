import { Migration } from '@mikro-orm/migrations';

/* eslint-disable */

export class Migration20230523200209 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "level" alter column "created_at" drop default;');
    this.addSql('alter table "level" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "level" alter column "updated_at" drop default;');
    this.addSql('alter table "level" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');

    this.addSql('alter table "session" alter column "created_at" drop default;');
    this.addSql('alter table "session" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "session" alter column "updated_at" drop default;');
    this.addSql('alter table "session" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');

    this.addSql('alter table "solution" alter column "created_at" drop default;');
    this.addSql('alter table "solution" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "solution" alter column "updated_at" drop default;');
    this.addSql('alter table "solution" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
  }

  async down(): Promise<void> {
    this.addSql('alter table "level" alter column "created_at" type timestamptz using ("created_at"::timestamptz);');
    this.addSql('alter table "level" alter column "created_at" set default now();');
    this.addSql('alter table "level" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);');
    this.addSql('alter table "level" alter column "updated_at" set default now();');

    this.addSql('alter table "session" alter column "created_at" type timestamptz using ("created_at"::timestamptz);');
    this.addSql('alter table "session" alter column "created_at" set default now();');
    this.addSql('alter table "session" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);');
    this.addSql('alter table "session" alter column "updated_at" set default now();');

    this.addSql('alter table "solution" alter column "created_at" type timestamptz using ("created_at"::timestamptz);');
    this.addSql('alter table "solution" alter column "created_at" set default now();');
    this.addSql('alter table "solution" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);');
    this.addSql('alter table "solution" alter column "updated_at" set default now();');
  }

}
