import Link from "next/link";

import { readSchoolDemoSnapshot } from "../../lib/school-demo-service.server";

export const dynamic = "force-dynamic";

export default async function SchoolDemoPage() {
  try {
    const snapshot = await readSchoolDemoSnapshot();

    return (
      <main className="app-shell">
        <header className="app-header">
          <div>
            <h1 className="brand">Демо школы</h1>
            <p className="page-context">
              Синтетический, неproduction-контура для показа школьной ветки.
            </p>
          </div>
          <Link className="button-link" href="/">
            Назад
          </Link>
        </header>

        <section className="metadata-section" aria-labelledby="demo-boundary-title">
          <h2 id="demo-boundary-title">Границы и статус</h2>
          <dl className="metadata-list">
            <div>
              <dt>Marker</dt>
              <dd>{snapshot.marker}</dd>
            </div>
            <div>
              <dt>Readiness</dt>
              <dd>{snapshot.boundary.readiness}</dd>
            </div>
            <div>
              <dt>Activation</dt>
              <dd>{snapshot.boundary.activation}</dd>
            </div>
            <div>
              <dt>Workflow</dt>
              <dd>{snapshot.boundary.workflow}</dd>
            </div>
            <div>
              <dt>Production data</dt>
              <dd>{snapshot.boundary.productionDataCount}</dd>
            </div>
            <div>
              <dt>Real schools</dt>
              <dd>{snapshot.boundary.realSchoolCount}</dd>
            </div>
          </dl>
        </section>

        <section className="metadata-section" aria-labelledby="demo-structure-title">
          <h2 id="demo-structure-title">Synthetic school snapshot</h2>
          <p className="attempt-metadata-note">
            Organization {snapshot.organization.code} · school {snapshot.school.code} ·{" "}
            {snapshot.academicYear.code}
          </p>
          <dl className="metadata-list">
            <div>
              <dt>Classes</dt>
              <dd>{snapshot.classes.map((item) => item.code).join(", ")}</dd>
            </div>
            <div>
              <dt>Teachers</dt>
              <dd>{snapshot.teachers.map((item) => item.demoCode).join(", ")}</dd>
            </div>
            <div>
              <dt>Students</dt>
              <dd>{snapshot.students.map((item) => item.demoCode).join(", ")}</dd>
            </div>
            <div>
              <dt>Assignments</dt>
              <dd>{snapshot.teacherAssignments.length}</dd>
            </div>
            <div>
              <dt>Enrollments</dt>
              <dd>{snapshot.studentEnrollments.length}</dd>
            </div>
            <div>
              <dt>Entitlements</dt>
              <dd>{snapshot.entitlements.map((item) => item.capabilityCode).join(", ")}</dd>
            </div>
          </dl>
        </section>

        <section className="metadata-section" aria-labelledby="demo-classes-title">
          <h2 id="demo-classes-title">Classes and assignments</h2>
          <ul className="session-list">
            {snapshot.classes.map((schoolClass) => (
              <li key={schoolClass.code}>
                <div className="session-row">
                  <div>
                    <strong>
                      {schoolClass.code} · grade {schoolClass.gradeLevel}
                    </strong>
                    <span className="session-meta">
                      Students: {schoolClass.studentCount} · Subjects:{" "}
                      {schoolClass.subjectGroupCodes.join(", ")}
                    </span>
                    <span className="session-meta">
                      Teachers: {schoolClass.teacherDemoCodes.join(", ")}
                    </span>
                  </div>
                  <span className="status-label">Read only</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    );
  } catch {
    return (
      <main className="app-shell">
        <header className="app-header">
          <div>
            <h1 className="brand">Демо школы</h1>
            <p className="page-context">Синтетический контур ожидает seed data.</p>
          </div>
          <Link className="button-link" href="/">
            Назад
          </Link>
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
