import { readSchoolDemoSnapshot } from "../../../lib/school-demo-service.server";
import { SchoolDemoDeliveryPreviewView } from "../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoDeliveryPreviewPage() {
  return <SchoolDemoDeliveryPreviewView snapshot={await readSchoolDemoSnapshot()} />;
}
