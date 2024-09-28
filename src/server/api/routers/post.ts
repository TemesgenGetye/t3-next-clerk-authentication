import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { posts } from "~/server/db/schema";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        name: input.name,
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.posts.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return post ?? null;
  }),

  getProtectedMessage: publicProcedure.query(async ({ ctx }) => {
    const user = ctx.auth.userId; // Get the user ID from the context

    // Check if the user is authenticated
    if (!user) {
      throw new Error("User not authenticated"); // Handle unauthenticated access
    }

    // Here you can fetch the protected message from your database

    // Return the message or handle the case when it's not found
    return {
      message: "This is a protected message",
      user,
    };
  }),
});
