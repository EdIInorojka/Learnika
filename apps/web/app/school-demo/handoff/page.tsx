import { readSchoolDemoSnapshot } from "../../../lib/school-demo-service.server";
import { SchoolDemoHandoffPackView } from "../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoHandoffPage() {
  return <SchoolDemoHandoffPackView snapshot={await readSchoolDemoSnapshot()} />;
}
