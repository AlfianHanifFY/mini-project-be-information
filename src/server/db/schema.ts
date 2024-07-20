import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTableCreator,
  timestamp,
  uuid,
  varchar,
  text,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `t3-template-app_${name}`);

// KALO EXAMPLE-NYA MAU DIHAPUS, HAPUS AJA YA, CUMAN CONTOH AJA KOK INI SUPAYA BISA MEMANDU KALIAN, SEMANGAT!

// ENUMS EXAMPLE
export const fakultasEnum = pgEnum("fakultas", [
  "FITB",
  "FMIPA",
  "FSRD",
  "FTMD",
  "FTTM",
  "FTSL",
  "FTI",
  "SAPPK",
  "SBM",
  "SF",
  "SITH",
  "STEI",
]);

export const roleEnum = pgEnum("role", ["Peserta", "Mentor", "Mamet"]);

// USER TABLE EXAMPLE
export const users = createTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  nim: varchar("nim", { length: 255 }).notNull().unique(),
  role: roleEnum("role").notNull(),
  fakultas: fakultasEnum("fakultas"),
  nomorKelompok: integer("nomorKelompok"),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  password: varchar("password", { length: 255 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 255 }),
  profilePicture: varchar("profilePicture", { length: 255 }),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

// USER RELATIONS EXAMPLE
export const usersRelations = relations(users, ({ many }) => ({
  assignmentSubmissions: many(assignmentSubmissions),
}));

// ASSIGNMENT TABLE EXAMPLE
export const assignments = createTable("assignment", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  deadline: timestamp("deadline", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  files: varchar("files", { length: 255 })
    .array()
    .default(sql`ARRAY[]::varchar[]`),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

// ASSIGNMENT RELATIONS EXAMPLE
export const assignmentSubmissions = createTable(
  "assignmentSubmission",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assignmentId: uuid("assignmentId").notNull(),
    userNim: varchar("userNim", { length: 255 }).notNull(),
    files: varchar("files", { length: 255 })
      .array()
      .default(sql`ARRAY[]::varchar[]`),
    createdAt: timestamp("createdAt", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updatedAt", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (submission) => ({
    userIdIdx: index("submission_userId_idx").on(submission.userNim),
  }),
);

// ASSIGNMENT RELATIONS EXAMPLE
export const assignmentSubmissionsRelations = relations(
  assignmentSubmissions,
  ({ one }) => ({
    assignment: one(assignments, {
      fields: [assignmentSubmissions.assignmentId],
      references: [assignments.id],
    }),
    user: one(users, {
      fields: [assignmentSubmissions.userNim],
      references: [users.nim],
    }),
  }),
);
