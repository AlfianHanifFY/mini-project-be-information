// Router ini digunakan untuk segala yang berkaitan dengan presensi event
import { TRPCError } from "@trpc/server";
import {  z } from "zod";
import {  eq } from "drizzle-orm/expressions";

import { students,courses,courseEnrollments } from "~/server/db/schema";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export type enrolledCourseType = 
    { courseId: string | undefined; 
      courseName: string | undefined; 
      courseCredits: number | undefined; 
    }[];

export const studentRouter = createTRPCRouter({
  getStudentsWithCoursesOnId: publicProcedure
    .input(z.object({ studentId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      // Expected output: data student berdasarkan id yang diberikan, kalau id tidak diberikan, fetch semua data

      // if studentId provided
      if(input.studentId != null){

        //Get student based on studentId
        const student = await ctx.db
          .select()
          .from(students)
          .where(eq(students.id,input.studentId));

        //check if student exist
        if (student.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Student not found",
          });
        }

        // Get enrolled student
        const enrolledCourse = await ctx.db
          .select({
            courseId : courses.id,
            courseName : courses.name,
            courseCredits : courses.credits
          })
          .from(courseEnrollments)
          .leftJoin(students,eq(students.id,courseEnrollments.studentId))
          .leftJoin(courses,eq(courses.id,courseEnrollments.courseId))
          .where(eq(courseEnrollments.studentId,input.studentId))

        return {
          id : student[0]?.id,
          firstName : student[0]?.firstName,
          lastName : student[0]?.lastName,
          createdAt : student[0]?.createdAt,
          updatedAt : student[0]?.updatedAt,
          enrolledCourse : enrolledCourse,
        }
      } else {
        // if studentId not provided
        // Get all student
        const allStudent = await ctx.db
          .select()
          .from(students)

        // Get all enrolled student on all course
        const allStudentNCourse = await ctx.db
          .select()
          .from(courseEnrollments)
          .leftJoin(students,eq(students.id,courseEnrollments.studentId))
          .leftJoin(courses,eq(courses.id,courseEnrollments.courseId))
        
        // map student to match their enrolled course
        return allStudent.map((student)=>{
          const enrolledCourse:enrolledCourseType  = [];
          const studentId = student.id;

          // push all enrolled course to array
          allStudentNCourse.forEach(function(row){
            if(row.student?.id == studentId){
              enrolledCourse.push(
                { courseId : row.course?.id,
                  courseName : row.course?.name,
                  courseCredits : row.course?.credits
                })
            }
          })
          return {
            id : studentId,
            firstName : student.firstName,
            lastName : student.lastName,
            enrolledCourse : enrolledCourse,
          }

        })
      }
      }
    ),

  insertNewStudent: publicProcedure
    .input(z.object({ firstName: z.string(), lastName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Expected output: hasil data yang di insert

      // create new student
      await ctx.db
        .insert(students)
        .values({
          firstName : input.firstName,
          lastName : input.lastName,
          createdAt : new Date,
          updatedAt : new Date
        })
        .returning({
          id : students.id,
        })
        return {message : "Student successfully created"}
    }),
});
