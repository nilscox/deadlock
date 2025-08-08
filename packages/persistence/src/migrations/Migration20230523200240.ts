import { Migration } from '@mikro-orm/migrations';

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
    -- when l.flags @> '{easy}' then 1
    -- when l.flags @> '{hard}' then 6
    when tries_avg <= 1 or time_avg < 5 then 1
    when tries_avg <= 3 or time_avg < 10 then 2
    when tries_avg <= 6 or time_avg < 15 then 3
    when tries_avg <= 10 or time_avg < 25 then 4
    when tries_avg <= 20 or time_avg < 90 then 5
    else 6
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
    this.addSql('drop view level_difficulty;');
    this.addSql('drop view sessions;');
  }

}
