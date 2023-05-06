import { Migration } from '@mikro-orm/migrations';

export class Migration20230506174741 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `level` (`id` text not null, `width` integer not null, `height` integer not null, `blocks` json not null, `start` json not null, primary key (`id`));');

    this.addSql('create table `level_session` (`id` text not null, `date` datetime not null, `ip` text not null, `level_id` text not null, `completed` integer not null, `tries` integer not null, `time` integer not null, constraint `level_session_level_id_foreign` foreign key(`level_id`) references `level`(`id`) on update cascade, primary key (`id`));');
    this.addSql('create index `level_session_level_id_index` on `level_session` (`level_id`);');
  }

}
