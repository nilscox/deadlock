import { Migration } from '@mikro-orm/migrations';

export class Migration20230506104117 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `level` (`id` text not null, `width` integer not null, `height` integer not null, `blocks` json not null, `start` json not null, primary key (`id`));');
  }

}
