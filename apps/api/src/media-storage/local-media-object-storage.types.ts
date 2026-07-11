import type { Buffer } from "node:buffer";

export interface LocalMediaObjectStorageConfig {
  accessKey: string;
  bucket: string;
  endPoint: string;
  port: number;
  secretKey: string;
  useSSL: false;
}

export interface LocalMediaObjectStorageClient {
  bucketExists(bucket: string): Promise<boolean>;
  makeBucket(bucket: string, region?: string): Promise<void>;
  putObject(
    bucket: string,
    storageKey: string,
    content: Buffer,
    sizeBytes: number,
    metadata: Record<string, string>,
  ): Promise<unknown>;
}

export interface LocalMediaPutInput {
  content: Buffer;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
}

export interface LocalMediaObjectStorageFailure {
  code: "LOCAL_MEDIA_STORAGE_CONFIG_INVALID" | "LOCAL_MEDIA_STORAGE_WRITE_FAILED";
  details: Record<string, unknown>;
  message: string;
}
