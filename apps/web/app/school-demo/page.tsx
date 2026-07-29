import { readSchoolDemoSnapshot } from "../../lib/school-demo-service.server";
import { SchoolDemoDashboardView } from "../../lib/school-demo-view";

export const dynamic = "force-dynamic";

type SchoolDemoPresentationStepKey =
  "overview" | "classes" | "teacher-assignments" | "license" | "class-drilldown";

function normalizeSchoolDemoPresentationStep(
  value: string | string[] | undefined,
  fallback: SchoolDemoPresentationStepKey,
): SchoolDemoPresentationStepKey {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (
    rawValue === "overview" ||
    rawValue === "classes" ||
    rawValue === "teacher-assignments" ||
    rawValue === "license" ||
    rawValue === "class-drilldown"
  ) {
    return rawValue;
  }
  return fallback;
}

interface SchoolDemoPageProps {
  searchParams: Promise<{ step?: string | string[] }>;
}

export default async function SchoolDemoPage({ searchParams }: SchoolDemoPageProps) {
  const query = await searchParams;
  const presentationStep = normalizeSchoolDemoPresentationStep(query.step, "overview");

  try {
    return (
      <SchoolDemoDashboardView
        presentationStep={presentationStep}
        snapshot={await readSchoolDemoSnapshot()}
      />
    );
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
