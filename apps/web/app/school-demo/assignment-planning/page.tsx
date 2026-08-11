import { readSchoolDemoSnapshot } from "../../../lib/school-demo-service.server";
import { SchoolDemoAssignmentPlanningView } from "../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoAssignmentPlanningPage() {
  return <SchoolDemoAssignmentPlanningView snapshot={await readSchoolDemoSnapshot()} />;
}
