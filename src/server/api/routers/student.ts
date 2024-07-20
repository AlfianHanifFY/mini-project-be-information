// Router ini digunakan untuk segala yang berkaitan dengan presensi event
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm/expressions";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const studentRouter = createTRPCRouter({
  getStudentsWithCoursesOnId: publicProcedure
    .input(z.object({ studentId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      // TODO: isi logic disini
      // Expected output: data student berdasarkan id yang diberikan, kalau id tidak diberikan, fetch semua data
    }),

  insertNewStudent: publicProcedure
    .input(z.object({ firstName: z.string(), lastName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: isi logic disini
      // Expected output: hasil data yang di insert
    }),
});
