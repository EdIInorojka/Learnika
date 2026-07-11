import { Client as MinioClient } from "minio";

import { loadLocalEnvironment } from "../config/local-env";
import type {
  LocalMediaObjectStorageClient,
  LocalMediaObjectStorageConfig,
  LocalMediaObjectStorageFailure,
  LocalMediaPutInput,
} from "./local-media-object-storage.types";

const localHosts = new Set(["127.0.0.1", "localhost", "::1"]);
const bucketPattern = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;

function safeFailure(
  code: LocalMediaObjectStorageFailure["code"],
  message: string,
): LocalMediaObjectStorageFailure {
  return { code, details: {}, message };
}

function assertLocalConfig(config: LocalMediaObjectStorageConfig): void {
  if (
    !localHosts.has(config.endPoint) ||
    config.useSSL !== false ||
    !Number.isSafeInteger(config.port) ||
    config.port <= 0 ||
    config.port > 65_535 ||
    !bucketPattern.test(config.bucket) ||
    config.accessKey.length === 0 ||
    config.secretKey.length === 0
  ) {
    throw safeFailure(
      "LOCAL_MEDIA_STORAGE_CONFIG_INVALID",
      "Local media storage configuration is invalid.",
    );
  }
}

export function getLocalMediaObjectStorageConfig(): LocalMediaObjectStorageConfig {
  loadLocalEnvironment();

  const endpointValue = process.env.S3_ENDPOINT ?? "http://127.0.0.1:9000";
  const bucket = process.env.S3_BUCKET ?? "learnika-local";
  const accessKey = process.env.S3_ACCESS_KEY_ID ?? "";
  const secretKey = process.env.S3_SECRET_ACCESS_KEY ?? "";
  let endpoint: URL;

  try {
    endpoint = new URL(endpointValue);
  } catch {
    throw safeFailure(
      "LOCAL_MEDIA_STORAGE_CONFIG_INVALID",
      "Local media storage configuration is invalid.",
    );
  }

  const port = Number.parseInt(endpoint.port || "80", 10);
  if (
    endpoint.protocol !== "http:" ||
    !localHosts.has(endpoint.hostname) ||
    endpoint.pathname !== "/" ||
    endpoint.username !== "" ||
    endpoint.password !== "" ||
    endpoint.search !== "" ||
    endpoint.hash !== "" ||
    !Number.isSafeInteger(port) ||
    port <= 0 ||
    port > 65_535 ||
    !bucketPattern.test(bucket) ||
    accessKey.length === 0 ||
    secretKey.length === 0
  ) {
    throw safeFailure(
      "LOCAL_MEDIA_STORAGE_CONFIG_INVALID",
      "Local media storage configuration is invalid.",
    );
  }

  return {
    accessKey,
    bucket,
    endPoint: endpoint.hostname,
    port,
    secretKey,
    useSSL: false,
  };
}

function createClient(config: LocalMediaObjectStorageConfig): LocalMediaObjectStorageClient {
  return new MinioClient({
    accessKey: config.accessKey,
    endPoint: config.endPoint,
    port: config.port,
    secretKey: config.secretKey,
    useSSL: config.useSSL,
  }) as LocalMediaObjectStorageClient;
}

export class LocalMediaObjectStorageService {
  private bucketReady: Promise<void> | undefined;
  private readonly client: LocalMediaObjectStorageClient;

  constructor(
    private readonly config: LocalMediaObjectStorageConfig = getLocalMediaObjectStorageConfig(),
    client?: LocalMediaObjectStorageClient,
  ) {
    assertLocalConfig(config);
    this.client = client ?? createClient(config);
  }

  async putObject(input: LocalMediaPutInput): Promise<void> {
    try {
      await this.ensureBucket();
      await this.client.putObject(
        this.config.bucket,
        input.storageKey,
        input.content,
        input.sizeBytes,
        { "Content-Type": input.mimeType },
      );
    } catch {
      throw safeFailure("LOCAL_MEDIA_STORAGE_WRITE_FAILED", "Local media storage write failed.");
    }
  }

  private async ensureBucket(): Promise<void> {
    this.bucketReady ??= this.ensureBucketOnce().catch((error: unknown) => {
      this.bucketReady = undefined;
      throw error;
    });
    await this.bucketReady;
  }

  private async ensureBucketOnce(): Promise<void> {
    if (!(await this.client.bucketExists(this.config.bucket))) {
      await this.client.makeBucket(this.config.bucket, "us-east-1");
    }
  }
}
