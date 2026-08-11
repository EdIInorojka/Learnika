import { readSchoolDemoSnapshot } from "../../../lib/school-demo-service.server";
import { SchoolDemoPrintPackView } from "../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoPrintPackPage() {
  return <SchoolDemoPrintPackView snapshot={await readSchoolDemoSnapshot()} />;
}
