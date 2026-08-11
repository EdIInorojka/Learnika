import { readSchoolDemoSnapshot } from "../../../lib/school-demo-service.server";
import { SchoolDemoTeacherDashboardView } from "../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoTeacherDashboardPage() {
  return <SchoolDemoTeacherDashboardView snapshot={await readSchoolDemoSnapshot()} />;
}
