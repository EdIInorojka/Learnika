import { readSchoolDemoSnapshot } from "../../../lib/school-demo-service.server";
import { SchoolDemoPilotConfigView } from "../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoPilotConfigPage() {
  return <SchoolDemoPilotConfigView snapshot={await readSchoolDemoSnapshot()} />;
}
