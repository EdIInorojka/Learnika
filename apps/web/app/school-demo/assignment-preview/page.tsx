import { readSchoolDemoSnapshot } from "../../../lib/school-demo-service.server";
import { SchoolDemoAssignmentPreviewView } from "../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoAssignmentPreviewPage() {
  return <SchoolDemoAssignmentPreviewView snapshot={await readSchoolDemoSnapshot()} />;
}
