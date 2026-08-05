import { readSchoolDemoSnapshot } from "../../../lib/school-demo-service.server";
import { SchoolDemoRolloutView } from "../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoRolloutPage() {
  return <SchoolDemoRolloutView snapshot={await readSchoolDemoSnapshot()} />;
}
