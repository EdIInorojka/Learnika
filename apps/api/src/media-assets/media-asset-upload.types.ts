import type { Buffer } from "node:buffer";
import type { MediaAsset } from "@prisma/client";

export interface ParsedMediaUpload {
  content: Buffer;
  mimeType: string;
  sizeBytes: number;
}

export type PreparedMediaUploadTarget = MediaAsset;
