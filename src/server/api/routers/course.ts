// Router ini digunakan untuk segala yang berkaitan dengan presensi event
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm/expressions";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { students, courses, courseEnrollments } from "~/server/db/schema";

export const courseRouter = createTRPCRouter({
  getAllCourses: publicProcedure.query(async ({ ctx }) => {
    // Expected output: seluruh data course yang ada
    // Get all courses
    return await ctx.db.select().from(courses);
  }),

  getStudentsListOnCourseId: publicProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Expected output: data course berdasarkan id yang diberikan beserta seluruh student yang mengikutinya

      // Get course based on id
      const course = await ctx.db
        .select()
        .from(courses)
        .where(eq(courses.id,input.courseId));
      
      // Check if course exist
      if(course.length == 0){
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      // Get enrolled student
      const enrolledStudent = await ctx.db
        .select({
          firstName : students.firstName,
          lastName : students.lastName
        })
        .from(courseEnrollments)
        .leftJoin(students,eq(courseEnrollments.studentId,students.id))
        .leftJoin(courses,eq(courseEnrollments.courseId,courses.id))
        .where(eq(courseEnrollments.courseId,input.courseId));


      return {
        id : course[0]?.id,
        name : course[0]?.name,
        credits : course[0]?.credits,
        courseStudents : enrolledStudent
      }
      
    }),

  insertNewCourse: publicProcedure
    .input(z.object({ name: z.string(), credits: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Expected output: hasil data yang di insert
      // Create data into courses
      await ctx.db
        .insert(courses)
        .values({
          name : input.name,
          credits : input.credits,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({
          id : courses.id,
          name : courses.name
        });
        return { message: "Course successfully created" };
    }),

  updateCourseData: publicProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
        name: z.string().optional(),
        credits: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Expected output: hasil data yang di update berdasarkan courseId yang diberikan, apabila name atau credits tidak diberikan, tidak usah di update

      // Get course based on courseId
      const course = await ctx.db
        .select()
        .from(courses)
        .where(eq(courses.id, input.courseId));
  
      // check if course exist
      if (course.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      } else {
        // if course exist
        await ctx.db
          .update(courses)
          .set({
            name : input.name,
            credits : input.credits,
            updatedAt : new Date
          })
          .where(eq(courses.id,input.courseId))
          return {message : "Course successfully updated"}
      }



    }),

  enrollNewStudent: publicProcedure
    .input(
      z.object({ studentId: z.string().uuid(), courseId: z.string().uuid() }),
    )
    .mutation(async ({ ctx, input }) => {
      // Expected output: hasil data yang di-insert, enrollment_date mengikuti waktu ketika fungsi dijalankan

      // Get student based on studentId
      const student = await ctx.db
        .select()
        .from(students)
        .where(eq(students.id, input.studentId));

      // check if student exist
      if (student.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      // Get course based on courseId
      const course = await ctx.db
        .select()
        .from(courses)
        .where(eq(courses.id, input.courseId));

      // check if course exist
      if (course.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      // check if student allready enrolled in the course
      const existingStudent = await ctx.db
        .select()
        .from(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.studentId,input.studentId),
            eq(courseEnrollments.courseId,input.courseId)
          )
        );

      // if student already enrolled on course
        if (existingStudent.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Student allready enrolled in this course"
          })
        } else {
          // if student not enrolled on course
          await ctx.db
            .insert(courseEnrollments)
            .values({
              studentId: input.studentId,
              courseId: input.courseId,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            return { message: "Student successfully enrolled" }
        }


    }),

  removeStudentfromCourse: publicProcedure
    .input(
      z.object({ studentId: z.string().uuid(), courseId: z.string().uuid() }),
    )
    .mutation(async ({ ctx, input }) => {
      // Expected output: hasil data yang di delete

      // Get student based on studentId
      const student = await ctx.db
        .select()
        .from(students)
        .where(eq(students.id, input.studentId));

      // check if student exist
      if (student.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      // Get course based on courseId
      const course = await ctx.db
        .select()
        .from(courses)
        .where(eq(courses.id, input.courseId));

      // check if course exist
      if (course.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      // delete student on course
      await ctx.db
        .delete(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.studentId,input.studentId),
            eq(courseEnrollments.courseId,input.courseId)
          ))
      return {message : "Student successfully remmoved"}

    }),
});
