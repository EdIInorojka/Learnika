import { readSchoolDemoSnapshot } from "../../../lib/school-demo-service.server";
import { SchoolDemoPilotChecklistView } from "../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoPilotPage() {
  return <SchoolDemoPilotChecklistView snapshot={await readSchoolDemoSnapshot()} />;
}
