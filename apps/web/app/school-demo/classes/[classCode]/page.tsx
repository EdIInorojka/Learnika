import { notFound } from "next/navigation";

import { readSchoolDemoSnapshot } from "../../../../lib/school-demo-service.server";
import { SchoolDemoClassDetailView } from "../../../../lib/school-demo-view";

export const dynamic = "force-dynamic";

type SchoolDemoPresentationStepKey =
  "overview" | "classes" | "teacher-assignments" | "license" | "class-drilldown";

function normalizeSchoolDemoPresentationStep(
  value: string | string[] | undefined,
  fallback: SchoolDemoPresentationStepKey,
): SchoolDemoPresentationStepKey {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (
    rawValue === "overview" ||
    rawValue === "classes" ||
    rawValue === "teacher-assignments" ||
    rawValue === "license" ||
    rawValue === "class-drilldown"
  ) {
    return rawValue;
  }
  return fallback;
}

interface SchoolDemoClassPageProps {
  params: Promise<{ classCode: string }>;
  searchParams: Promise<{ step?: string | string[] }>;
}

export default async function SchoolDemoClassPage({
  params,
  searchParams,
}: SchoolDemoClassPageProps) {
  const { classCode } = await params;
  const query = await searchParams;
  const presentationStep = normalizeSchoolDemoPresentationStep(query.step, "class-drilldown");
  const snapshot = await readSchoolDemoSnapshot();

  if (!snapshot.classes.some((item) => item.code === classCode)) {
    notFound();
  }

  return (
    <SchoolDemoClassDetailView
      classCode={classCode}
      presentationStep={presentationStep}
      snapshot={snapshot}
    />
  );
}
