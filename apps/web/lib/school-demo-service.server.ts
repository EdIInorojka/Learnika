import { apiRequest } from "./api-client.server";
import { parseSchoolDemoSnapshotResponse, type SchoolDemoSnapshot } from "./school-demo-contract";

export async function readSchoolDemoSnapshot(): Promise<SchoolDemoSnapshot> {
  const response = await apiRequest<unknown>("/demo/school-snapshot");
  return parseSchoolDemoSnapshotResponse(response);
}
