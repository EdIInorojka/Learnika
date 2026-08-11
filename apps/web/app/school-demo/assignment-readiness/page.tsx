import { readSchoolDemoSnapshot } from "../../../lib/school-demo-service.server";
import { SchoolDemoAssignmentReadinessView } from "../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoAssignmentReadinessPage() {
  return <SchoolDemoAssignmentReadinessView snapshot={await readSchoolDemoSnapshot()} />;
}
