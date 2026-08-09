import { readSchoolDemoSnapshot } from "../../../lib/school-demo-service.server";
import { SchoolDemoStudentPreviewView } from "../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoStudentPreviewPage() {
  return <SchoolDemoStudentPreviewView snapshot={await readSchoolDemoSnapshot()} />;
}
