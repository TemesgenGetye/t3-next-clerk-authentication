import { getAuth } from "@clerk/nextjs/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";

export async function createContext({ req }: CreateNextContextOptions) {
  const auth = getAuth(req);
  return { auth };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
