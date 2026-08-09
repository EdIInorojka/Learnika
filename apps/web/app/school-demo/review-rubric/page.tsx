import { readSchoolDemoSnapshot } from "../../../lib/school-demo-service.server";
import { SchoolDemoTeacherReviewRubricView } from "../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

export default async function SchoolDemoReviewRubricPage() {
  return <SchoolDemoTeacherReviewRubricView snapshot={await readSchoolDemoSnapshot()} />;
}
