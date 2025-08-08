import { Migration } from '@mikro-orm/migrations';

export class Migration20230517200204 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "level" add column "flags" text[] not null default \'{}\';');
  }

  async down(): Promise<void> {
    this.addSql('alter table "level" drop column "flags";');
  }

}
