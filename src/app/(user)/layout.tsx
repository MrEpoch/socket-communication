import { validateRequest } from "@/lib/validateRequest";
import { redirect } from "next/navigation";
import React from "react";

export default async function UserLayout({ children }) {
  const user = await validateRequest();

  if (!user.session || !user.user) {
    throw redirect("/login");
  }

  return <>{children}</>;
}
