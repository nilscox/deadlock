import { Migration } from '@mikro-orm/migrations';

export class Migration20230524222619 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "level" alter column "position" drop not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "level" alter column "position" set not null;');
  }

}
