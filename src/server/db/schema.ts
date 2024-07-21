import { relations} from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";


/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `t3-template-app_${name}`);

// TABLE FOR STUDENTS
export const students = createTable(
  "student",
  {
    id : uuid("id").primaryKey().defaultRandom(),
    firstName: varchar("fistsName", { length: 255 }).notNull(),
    lastName: varchar("lastName", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updatedAt", {
      mode: "date",
      withTimezone: true,
    }).notNull(),


});

// STUDENTS RELATIONS
export const studentsRelations = relations(students, ({ many }) => ({
  courses: many(courses),
}));

// TABLE FOR COURSES 
export const courses = createTable(
  'course',
  {
    id : uuid("id").primaryKey().defaultRandom(),
    name : varchar("name", { length: 255 }).notNull(),
    credits : integer('credits').notNull(),
    createdAt: timestamp("createdAt", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updatedAt", {
      mode: "date",
      withTimezone: true,
    }).notNull(),

  });

// TABLE FOR COURSES ENROLLMENT 

export const courseEnrollments = createTable(
  "courseEnrollment",
  {
    id : uuid("id").notNull().defaultRandom(),
    studentId : uuid("studentId").notNull(),
    courseId : uuid("courseId").notNull(),
    createdAt: timestamp("createdAt", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updatedAt", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    
  },
  (enrollment) => ({
    studentIdIdx: index("submission_studentId_idx").on(enrollment.studentId),
  }),
)

// COURSE ENROLLMENT RELATION
export const courseEnrollmentRelations = relations(
  courseEnrollments,
  ({ one }) => ({
    course: one(courses, {
      fields: [courseEnrollments.courseId],
      references: [courses.id],
    }),
    student: one(students, {
      fields: [courseEnrollments.studentId],
      references: [students.id],
    }),
  }),
);