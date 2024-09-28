"use client";

import * as React from "react";
import { useSignUp, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const clerk = useClerk(); // Access Clerk functions
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [code, setCode] = React.useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      await clerk.signOut(); // Sign out existing session

      // Start the sign-up process
      await signUp.create({
        username,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifying(true);
    } catch (err: any) {
      // Handle specific error for taken username
      if (
        err.errors.some((error: any) => error.code === "form_identifier_exists")
      ) {
        console.error("Username already taken. Please try another.");
        alert("That username is taken. Please try another."); // Display error message to user
      } else {
        console.error("Sign-up error:", JSON.stringify(err, null, 2));
      }
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.push("/dashbord"); // Change this to /dashboard
      } else {
        console.error(
          "Verification error:",
          JSON.stringify(signUpAttempt, null, 2),
        );
      }
    } catch (err: any) {
      console.error("Verification error:", JSON.stringify(err, null, 2));
    }
  };

  // Render verification form if needed
  if (verifying) {
    return (
      <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-bold">Verify your email</h2>
        <form onSubmit={handleVerify}>
          <label className="mb-2 block" htmlFor="code">
            Enter verification code
          </label>
          <input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="mb-4 w-full rounded border border-gray-300 p-2"
          />
          <button
            type="submit"
            className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
          >
            Verify
          </button>
        </form>
      </div>
    );
  }

  // Render the sign-up form
  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-bold">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <label className="mb-2 block" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="mb-4 w-full rounded border border-gray-300 p-2"
        />
        <label className="mb-2 block" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-4 w-full rounded border border-gray-300 p-2"
        />
        <button
          type="submit"
          className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
