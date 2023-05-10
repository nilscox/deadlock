import { Migration } from '@mikro-orm/migrations';

export class Migration20230510182719 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `level` add column `teleports` json not null;');
  }

}
