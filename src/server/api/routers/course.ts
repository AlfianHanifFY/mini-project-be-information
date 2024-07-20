// Router ini digunakan untuk segala yang berkaitan dengan presensi event
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm/expressions";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const courseRouter = createTRPCRouter({
  getAllCourses: publicProcedure.query(async ({ ctx }) => {
    // TODO: isi logic disini
    // Expected output: seluruh data course yang ada
  }),

  getStudentsListOnCourseId: publicProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // TODO: isi logic disini
      // Expected output: data course berdasarkan id yang diberikan beserta seluruh student yang mengikutinya
    }),

  insertNewCourse: publicProcedure
    .input(z.object({ name: z.string(), credits: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: isi logic disini
      // Expected output: hasil data yang di insert
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
      // TODO: isi logic disini
      // Expected output: hasil data yang di update berdasarkan courseId yang diberikan, apabila name atau credits tidak diberikan, tidak usah di update
    }),

  enrollNewStudent: publicProcedure
    .input(
      z.object({ studentId: z.string().uuid(), courseId: z.string().uuid() }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: isi logic disini
      // Expected output: hasil data yang di-insert, enrollment_date mengikuti waktu ketika fungsi dijalankan
    }),

  removeStudentfromCourse: publicProcedure
    .input(
      z.object({ studentId: z.string().uuid(), courseId: z.string().uuid() }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: isi logic disini
      // Expected output: hasil data yang di delete
    }),
});
