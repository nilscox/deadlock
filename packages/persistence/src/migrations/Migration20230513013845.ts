import { Migration } from '@mikro-orm/migrations';

/* eslint-disable */

export class Migration20230513013845 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "level" add column "created_at" timestamptz(0) not null, add column "updated_at" timestamptz(0) not null, add column "deleted_at" timestamptz(0) null;');

    this.addSql('alter table "session" add column "created_at" timestamptz(0) not null, add column "updated_at" timestamptz(0) not null;');

    this.addSql('alter table "solution" add column "created_at" timestamptz(0) not null, add column "updated_at" timestamptz(0) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "level" drop column "created_at";');
    this.addSql('alter table "level" drop column "updated_at";');
    this.addSql('alter table "level" drop column "deleted_at";');

    this.addSql('alter table "session" drop column "created_at";');
    this.addSql('alter table "session" drop column "updated_at";');

    this.addSql('alter table "solution" drop column "created_at";');
    this.addSql('alter table "solution" drop column "updated_at";');
  }

}
