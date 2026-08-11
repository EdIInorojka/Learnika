import { notFound } from "next/navigation";

import { readSchoolDemoSnapshot } from "../../../../lib/school-demo-service.server";
import { SchoolDemoAssignmentDraftDetailView } from "../../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

interface SchoolDemoAssignmentDraftDetailPageProps {
  params: Promise<{ assignmentCode: string }>;
}

export default async function SchoolDemoAssignmentDraftDetailPage({
  params,
}: SchoolDemoAssignmentDraftDetailPageProps) {
  const { assignmentCode } = await params;
  const snapshot = await readSchoolDemoSnapshot();

  if (!snapshot.assignmentDrafts.some((item) => item.assignmentCode === assignmentCode)) {
    notFound();
  }

  return (
    <SchoolDemoAssignmentDraftDetailView assignmentCode={assignmentCode} snapshot={snapshot} />
  );
}
