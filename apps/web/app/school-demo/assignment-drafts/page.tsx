import { readSchoolDemoSnapshot } from "../../../lib/school-demo-service.server";
import { SchoolDemoAssignmentDraftsView } from "../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoAssignmentDraftsPage() {
  return <SchoolDemoAssignmentDraftsView snapshot={await readSchoolDemoSnapshot()} />;
}
