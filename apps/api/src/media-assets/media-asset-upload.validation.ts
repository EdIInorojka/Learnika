import {
  BadRequestException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from "@nestjs/common";
import type { MultipartFile } from "@fastify/multipart";

import type { ParsedMediaUpload } from "./media-asset-upload.types";

interface MultipartRequest {
  file(options: {
    limits: {
      fields: number;
      fileSize: number;
      files: number;
      parts: number;
    };
    throwFileSizeLimit: true;
  }): Promise<MultipartFile | undefined>;
  isMultipart(): boolean;
}

function invalid(code: string, message: string): BadRequestException {
  return new BadRequestException({ code, message });
}

function errorCode(error: unknown): string | undefined {
  return error && typeof error === "object" && "code" in error && typeof error.code === "string"
    ? error.code
    : undefined;
}

export async function parseMultipartMediaUpload(
  request: MultipartRequest,
  maxFileSizeBytes: number,
): Promise<ParsedMediaUpload> {
  if (!request.isMultipart()) {
    throw new UnsupportedMediaTypeException({
      code: "MEDIA_UPLOAD_MULTIPART_REQUIRED",
      message: "Multipart file upload is required.",
    });
  }

  let file: MultipartFile | undefined;
  try {
    file = await request.file({
      limits: { fields: 0, fileSize: maxFileSizeBytes, files: 1, parts: 1 },
      throwFileSizeLimit: true,
    });
  } catch (error: unknown) {
    if (errorCode(error) === "FST_REQ_FILE_TOO_LARGE") {
      throw new PayloadTooLargeException({
        code: "MEDIA_UPLOAD_FILE_TOO_LARGE",
        message: "Media file exceeds the configured limit.",
      });
    }

    throw invalid("MEDIA_UPLOAD_INVALID_MULTIPART", "Media upload body is invalid.");
  }

  if (!file || file.fieldname !== "file") {
    throw invalid("MEDIA_UPLOAD_FILE_REQUIRED", "One media file field is required.");
  }

  let content: Buffer;
  try {
    content = await file.toBuffer();
  } catch (error: unknown) {
    if (errorCode(error) === "FST_REQ_FILE_TOO_LARGE" || file.file.truncated) {
      throw new PayloadTooLargeException({
        code: "MEDIA_UPLOAD_FILE_TOO_LARGE",
        message: "Media file exceeds the configured limit.",
      });
    }

    throw invalid("MEDIA_UPLOAD_INVALID_MULTIPART", "Media upload body is invalid.");
  }

  if (file.file.truncated || content.byteLength > maxFileSizeBytes) {
    throw new PayloadTooLargeException({
      code: "MEDIA_UPLOAD_FILE_TOO_LARGE",
      message: "Media file exceeds the configured limit.",
    });
  }

  if (content.byteLength === 0) {
    throw invalid("MEDIA_UPLOAD_EMPTY_FILE", "Media file is empty.");
  }

  return {
    content,
    mimeType: file.mimetype.toLowerCase(),
    sizeBytes: content.byteLength,
  };
}

export function hasExpectedMediaSignature(mimeType: string, content: Buffer): boolean {
  if (mimeType === "image/png") {
    return content.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }

  if (mimeType === "image/jpeg") {
    return content.length >= 3 && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff;
  }

  if (mimeType === "image/webp") {
    return (
      content.length >= 12 &&
      content.subarray(0, 4).toString("ascii") === "RIFF" &&
      content.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  if (mimeType === "application/pdf") {
    return content.subarray(0, 5).toString("ascii") === "%PDF-";
  }

  return false;
}

export type { MultipartRequest };
