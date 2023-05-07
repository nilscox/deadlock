import { Migration } from '@mikro-orm/migrations';

export class Migration20230507015505 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `level` add column `fingerprint` text not null;');
  }

}
