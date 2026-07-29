import { readSchoolDemoSnapshot } from "../../lib/school-demo-service.server";
import { SchoolDemoDashboardView } from "../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoPage() {
  try {
    return <SchoolDemoDashboardView snapshot={await readSchoolDemoSnapshot()} />;
  } catch {
    return (
      <main className="app-shell">
        <header className="app-header">
          <div>
            <h1 className="brand">Демо школы</h1>
            <p className="page-context">Синтетический контур ожидает seed data.</p>
          </div>
          <a className="button-link" href="/">
            Назад
          </a>
        </header>
        <section className="metadata-section" aria-labelledby="demo-unavailable-title">
          <h2 id="demo-unavailable-title">Demo snapshot unavailable</h2>
          <p className="attempt-metadata-note">
            Prepare the synthetic school seed to show organization, classes, assignments and
            entitlements.
          </p>
        </section>
      </main>
    );
  }
}
