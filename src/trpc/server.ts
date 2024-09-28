"server-only";
import { initTRPC } from "@trpc/server";
import { headers } from "next/headers";

// Define the context structure explicitly
export const createContext = async ({ req }: { req: Request }) => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  return {
    headers: heads,
    req,
  };
};

// Initialize tRPC with the defined context type
const t = initTRPC.context<typeof createContext>().create();

// Exporting the router and procedure methods
export const router = t.router;
export const procedure = t.procedure;

// Define your API router and procedures
export const appRouter = router({
  hello: procedure.query(() => {
    return "Hello, World!";
  }),
});

// Export type definition of the API
export type AppRouter = typeof appRouter;
