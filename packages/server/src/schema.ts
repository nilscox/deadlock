import { type IPoint } from '@deadlock/game';
import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  pgView,
  real,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

const id = () => varchar({ length: 16 });
const pk = () => id().notNull().primaryKey();

export const flag = pgEnum('level_flag', ['déjàVu', 'easy', 'hard', 'cool']);

export const levels = pgTable('level', {
  id: pk(),
  width: integer().notNull(),
  height: integer().notNull(),
  blocks: jsonb().$type<IPoint[]>().notNull(),
  start: jsonb().$type<IPoint>().notNull(),
  teleports: jsonb().$type<IPoint[]>().notNull(),
  fingerprint: varchar({ length: 255 }).notNull().unique(),
  position: integer().unique(),
  difficulty: real().notNull(),
  flags: flag().array().default([]).notNull(),
  createdAt: timestamp({ mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'date' }).defaultNow().notNull(),
  deletedAt: timestamp({ mode: 'date' }),
});

export type Level = typeof levels.$inferSelect;

export const sessions = pgTable('session', {
  id: pk(),
  levelId: id()
    .notNull()
    .references(() => levels.id),
  completed: boolean().notNull(),
  tries: integer().notNull(),
  time: integer().notNull(),
  date: timestamp({ mode: 'date' }).notNull(),
  ip: varchar({ length: 40 }).notNull(),
  createdAt: timestamp({ mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'date' }).defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;

export const sessionsRelations = relations(sessions, ({ one }) => ({
  level: one(levels, { fields: [sessions.levelId], references: [levels.id] }),
}));

export const sessionsView = pgView('level_sessions', {
  levelId: id().notNull(),
  triesMin: integer().notNull(),
  triesMax: integer().notNull(),
  triesAvg: integer().notNull(),
  timeMin: integer().notNull(),
  timeMax: integer().notNull(),
  timeAvg: integer().notNull(),
}).as(sql`
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
  l.position
`);

export const levelDifficultyView = pgView('level_difficulty', {
  levelId: id().notNull(),
  difficulty: integer().notNull(),
}).as(sql`
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
  join level_sessions s on s.level_id = l.id
`);
