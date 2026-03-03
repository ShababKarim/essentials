export default function AdminPage() {
  return (
    <main className="container py-10">
      <h1 className="font-[var(--font-heading)] text-4xl font-bold text-emerald-950">
        Admin Console (MVP)
      </h1>
      <p className="mt-3 max-w-2xl text-emerald-900/80">
        Use Prisma Studio or seed scripts to manage the question bank and choose which
        3-question quiz is published at midnight.
      </p>
      <div className="mt-6 rounded-xl border border-amber-200 bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Planned additions: protected admin auth, question CRUD, and a publish workflow.
        </p>
      </div>
    </main>
  );
}
