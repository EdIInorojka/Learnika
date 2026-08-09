import { readSchoolDemoSnapshot } from "../../../lib/school-demo-service.server";
import { SchoolDemoClassAnalyticsView } from "../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoAnalyticsPage() {
  return <SchoolDemoClassAnalyticsView snapshot={await readSchoolDemoSnapshot()} />;
}
