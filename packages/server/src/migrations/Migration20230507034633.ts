import { Migration } from '@mikro-orm/migrations';

export class Migration20230507034633 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `level` add column `level_number` integer null;');
    this.addSql('alter table `level` add column `difficulty` integer not null;');
    this.addSql('alter table `level` add column `number_of_solutions_score` integer not null;');
    this.addSql('alter table `level` add column `easiest_solution_score` integer not null;');
  }

}
