import { notFound } from "next/navigation";

import { readSchoolDemoSnapshot } from "../../../../lib/school-demo-service.server";
import { SchoolDemoClassDetailView } from "../../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

interface SchoolDemoClassPageProps {
  params: Promise<{ classCode: string }>;
}

export default async function SchoolDemoClassPage({ params }: SchoolDemoClassPageProps) {
  const { classCode } = await params;
  const snapshot = await readSchoolDemoSnapshot();

  if (!snapshot.classes.some((item) => item.code === classCode)) {
    notFound();
  }

  return <SchoolDemoClassDetailView classCode={classCode} snapshot={snapshot} />;
}
