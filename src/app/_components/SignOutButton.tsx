"use client";

import { useClerk } from "@clerk/nextjs";

export const SignOutButton = () => {
  const { signOut } = useClerk();

  return (
    // Clicking this button signs out a user
    // and redirects them to the home page "/".
    <button
      className="rounded-full border border-slate-950 bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
      onClick={() => signOut({ redirectUrl: "/" })}
    >
      Sign out
    </button>
  );
};
