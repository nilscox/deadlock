import { Migration } from '@mikro-orm/migrations';

/* eslint-disable */

const sessions = `
create view sessions as
select
  l.id level_id,
  min(s.tries) tries_min,
  max(s.tries) tries_max,
  avg(s.tries) tries_avg,
  min(s.time) / 1000 time_min,
  max(s.time) / 1000 time_max,
  avg(s.time) / 1000 time_avg
from
  level l
  join session s on l.id = s.level_id
group by
  l.id
order by
  l.position;
`;

const level_difficulty = `
create view level_difficulty as
select
  level_id,
  case
    when l.flags @> '{easy}' then 1
    when l.flags @> '{hard}' then 4
    when tries_avg <= 1 or time_avg < 5 then 1
    when tries_avg <= 5 or time_avg < 15 then 2
    when tries_avg <= 20 or time_avg < 120 then 3
    else 4
  end difficulty
from
  level l
  join sessions s on s.level_id = l.id;
`;

export class Migration20230523200240 extends Migration {

  async up(): Promise<void> {
    this.addSql(sessions);
    this.addSql(level_difficulty);
  }

  async down(): Promise<void> {
    this.addSql('drop view sessions;');
    this.addSql('drop view level_difficulty;');
  }

}
