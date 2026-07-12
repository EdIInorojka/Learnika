import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { readAuthShellState } from "../../lib/auth-service.server";
import { canViewHomework } from "../../lib/homework-contract";

export default async function HomeworkLayout({ children }: Readonly<{ children: ReactNode }>) {
  const authState = await readAuthShellState();
  if (!canViewHomework(authState.status)) {
    redirect(`/?authError=${authState.status === "unavailable" ? "service" : "session"}`);
  }

  return children;
}
