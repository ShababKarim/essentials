import { cookies } from "next/headers";

import { getAdminSessionCookieName, verifySessionCookie } from "@/lib/admin-auth";

import { AdminLoginForm } from "./AdminLoginForm";
import { AdminLogoutButton } from "./AdminLogoutButton";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(getAdminSessionCookieName())?.value;
  let isAuthenticated = false;
  try {
    isAuthenticated = verifySessionCookie(sessionCookie);
  } catch (err) {
    console.warn("Session verification failed.");
  }

  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  return (
    <main className="container py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[var(--font-heading)] text-4xl font-bold text-emerald-950">
            Admin Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-emerald-900/80">
        Use Prisma Studio or seed scripts to manage the question bank and choose which 5-question quiz is published at midnight.
          </p>
        </div>
        <AdminLogoutButton />
      </div>
      <div className="mt-6 rounded-xl border border-amber-200 bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Planned additions: protected admin auth, question CRUD, and a publish workflow.
        </p>
      </div>
    </main>
  );
}
