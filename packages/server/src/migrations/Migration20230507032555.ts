import { Migration } from '@mikro-orm/migrations';

export class Migration20230507032555 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `solution` (`id` text not null, `level_id` text not null, `path` json not null, constraint `solution_level_id_foreign` foreign key(`level_id`) references `level`(`id`) on update cascade, primary key (`id`));');
    this.addSql('create index `solution_level_id_index` on `solution` (`level_id`);');
  }

}
