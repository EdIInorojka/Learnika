import { readSchoolDemoSnapshot } from "../../../lib/school-demo-service.server";
import { SchoolDemoTeacherReviewQueueView } from "../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoReviewQueuePage() {
  return <SchoolDemoTeacherReviewQueueView snapshot={await readSchoolDemoSnapshot()} />;
}
