import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { LocalMediaObjectStorageService } from "../dist/media-storage/local-media-object-storage.service.js";

const localConfig = {
  accessKey: "synthetic-local-access-key",
  bucket: "learnika-test-local",
  endPoint: "127.0.0.1",
  port: 9000,
  secretKey: "synthetic-local-secret-key",
  useSSL: false,
};
const storageKey =
  "families/11111111-1111-4111-8111-111111111111/children/22222222-2222-4222-8222-222222222222/media/homework-image/33333333-3333-4333-8333-333333333333.png";

test("local object storage creates a bucket and only writes approved objects", async () => {
  const calls = [];
  const client = {
    async bucketExists(bucket) {
      calls.push(["bucketExists", bucket]);
      return false;
    },
    async makeBucket(bucket, region) {
      calls.push(["makeBucket", bucket, region]);
    },
    async putObject(bucket, key, content, sizeBytes, metadata) {
      calls.push(["putObject", bucket, key, content.byteLength, sizeBytes, metadata]);
      return {};
    },
  };
  const service = new LocalMediaObjectStorageService(localConfig, client);
  const content = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  await service.putObject({
    content,
    mimeType: "image/png",
    sizeBytes: content.byteLength,
    storageKey,
  });
  await service.putObject({
    content,
    mimeType: "image/png",
    sizeBytes: content.byteLength,
    storageKey,
  });

  assert.deepEqual(
    calls.map(([method]) => method),
    ["bucketExists", "makeBucket", "putObject", "putObject"],
  );
  assert.deepEqual(calls[2].slice(1), [
    localConfig.bucket,
    storageKey,
    content.byteLength,
    content.byteLength,
    { "Content-Type": "image/png" },
  ]);
});

test("local object storage rejects non-loopback configuration", () => {
  assert.throws(
    () =>
      new LocalMediaObjectStorageService({ ...localConfig, endPoint: "storage.example.test" }, {}),
    (error) => error.code === "LOCAL_MEDIA_STORAGE_CONFIG_INVALID",
  );
});

test("local object storage failures do not expose keys content or credentials", async () => {
  const service = new LocalMediaObjectStorageService(localConfig, {
    async bucketExists() {
      return true;
    },
    async putObject() {
      throw new Error(`${storageKey} synthetic-local-secret-key raw-media`);
    },
  });

  await assert.rejects(
    () =>
      service.putObject({
        content: Buffer.from("synthetic raw bytes"),
        mimeType: "image/png",
        sizeBytes: 19,
        storageKey,
      }),
    (error) => {
      const serialized = JSON.stringify(error);
      assert.equal(error.code, "LOCAL_MEDIA_STORAGE_WRITE_FAILED");
      assert.equal(serialized.includes(storageKey), false);
      assert.equal(serialized.includes("synthetic-local-secret-key"), false);
      assert.equal(serialized.includes("synthetic raw bytes"), false);
      return true;
    },
  );
});

test("local object storage source contains no read list delete or signing operations", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "src", "media-storage", "local-media-object-storage.service.ts"),
    "utf8",
  );
  for (const forbidden of [
    "getObject(",
    "listObjects(",
    "presignedUrl(",
    "presignedGetObject(",
    "presignedPutObject(",
    "removeObject(",
    "removeObjects(",
    "statObject(",
  ]) {
    assert.equal(source.includes(forbidden), false);
  }
});
