import { getAuth } from "@clerk/nextjs/server"; // Import Clerk's server-side auth
import { initTRPC, TRPCError } from "@trpc/server"; // Import tRPC core
import type { NextRequest } from "next/server";
import superjson from "superjson"; // Import transformer for better serialization
import { ZodError } from "zod"; // Zod for validation errors
import { db } from "~/server/db"; // Import your database connection, adjust path accordingly

/**
 * 1. CONTEXT
 *
 * This function generates the tRPC context, which will include Clerk authentication data
 * using Clerk’s `getAuth`. This allows access to the database and the authenticated user
 * in tRPC procedures.
 */
export const createTRPCContext = async (req: NextRequest) => {
  const auth = getAuth(req); // Clerk authentication - extracts user data from request headers

  return {
    db, // Your database connection
    auth, // Clerk auth object containing user session info
    ...req, // Include the original request object
  };
};

/**
 * 2. INITIALIZATION
 *
 * Initialize tRPC with the context and use superjson for transforming data. Handle Zod errors.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson, // Use superjson for serialization
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null, // Handle Zod validation errors
      },
    };
  },
});

/**
 * 3. MIDDLEWARE & PROCEDURES
 *
 * Middleware to check if the user is authenticated using Clerk's `auth` context.
 */
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth?.userId) {
    // Check if the user is authenticated (valid session)
    throw new TRPCError({ code: "UNAUTHORIZED" }); // Throw an error if not authenticated
  }
  return next({
    ctx: {
      auth: ctx.auth, // Forward the auth object to be accessible in the procedures
    },
  });
});

/**
 * Middleware to time procedure execution, mainly for development purposes.
 * Adds artificial delay in dev environment to simulate network latency.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  // Only add delay in development environment
  if (process.env.NODE_ENV === "development") {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure:
 * Can be used for routes that don't require user authentication.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure:
 * Can be used for routes that require the user to be authenticated.
 */
export const protectedProcedure = t.procedure.use(isAuthed);

/**
 * 4. ROUTER CREATION
 *
 * This is how we create new routers and sub-routers in the tRPC API.
 * You can import this and use it to build your API.
 */
export const createTRPCRouter = t.router;

/**
 * Server-side caller:
 * You can use this to call tRPC routes server-side.
 */
export const createCallerFactory = t.createCallerFactory;
