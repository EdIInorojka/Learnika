import { readSchoolDemoSnapshot } from "../../../lib/school-demo-service.server";
import { SchoolDemoCompactSummaryView } from "../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoSummaryPage() {
  return <SchoolDemoCompactSummaryView snapshot={await readSchoolDemoSnapshot()} />;
}
