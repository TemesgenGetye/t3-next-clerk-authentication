"use client";

import { SignOutButton } from "@clerk/nextjs";
import React from "react";
import { api } from "~/trpc/react";
// import { SignOutButton } from "../_components/SignOutButton";

function page() {
  const data = api.post.getProtectedMessage.useQuery();
  console.log(data.data);
  return (
    <div className="flex h-screen flex-col items-center justify-center text-center text-3xl text-blue-500/50">
      Finally i loged in
      <p>{data.data?.message}</p>
      <SignOutButton />
    </div>
  );
}

export default page;
