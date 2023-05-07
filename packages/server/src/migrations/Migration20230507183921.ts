import { Migration } from '@mikro-orm/migrations';

export class Migration20230507183921 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `solution` add column `complexity` integer not null;');
  }

}
