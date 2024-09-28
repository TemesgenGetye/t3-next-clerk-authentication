"use client";

import * as React from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const router = useRouter();

  // Handle the submission of the sign-in form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) {
      return;
    }

    try {
      // Start the sign-in process
      const signInAttempt = await signIn.create({
        identifier: username, // username or email
        password,
      });

      // Check the status of the sign-in process
      if (signInAttempt.status === "complete") {
        // Set session and redirect to dashboard if sign-in is complete
        await setActive({ session: signInAttempt.createdSessionId });
        router.push("/dashbord");
      } else if (signInAttempt.status === "needs_second_factor") {
        // Handle cases where additional steps like 2FA are required
        setError("Two-factor authentication is required.");
      } else {
        // Handle any other case where sign-in is incomplete
        setError("Sign-in incomplete. Please complete additional steps.");
      }
    } catch (err: any) {
      setError("Invalid username or password.");
      console.error("Sign-in error:", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username or Email
            </label>
            <input
              onChange={(e) => setUsername(e.target.value)}
              id="username"
              name="username"
              type="text"
              value={username}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              name="password"
              type="password"
              value={password}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
