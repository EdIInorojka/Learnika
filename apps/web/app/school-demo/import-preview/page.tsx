import { readSchoolDemoSnapshot } from "../../../lib/school-demo-service.server";
import { SchoolDemoImportPreviewView } from "../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoImportPreviewPage() {
  return <SchoolDemoImportPreviewView snapshot={await readSchoolDemoSnapshot()} />;
}
