import { Migration } from '@mikro-orm/migrations';

/* eslint-disable */

const sessions = `
create view level_sessions as
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
where
  s.completed
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
    when tries_avg <= 2 or time_avg < 5 then 1
    when tries_avg <= 4 or time_avg < 15 then 2
    when tries_avg <= 8 or time_avg < 30 then 3
    when tries_avg <= 16 or time_avg < 60 then 4
    when tries_avg <= 32 or time_avg < 180 then 5
    else 6
  end difficulty
from
  level l
join
  level_sessions s on s.level_id = l.id;
`;

export class Migration20240316223641 extends Migration {

  async up(): Promise<void> {
    this.addSql(`drop view if exists level_difficulty`);
    this.addSql(`drop view if exists sessions`);

    this.addSql(sessions);
    this.addSql(level_difficulty);
  }

  async down(): Promise<void> {
    this.addSql(`drop view level_difficulty`);
    this.addSql(`drop view level_sessions`);
  }

}
