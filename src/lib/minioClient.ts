import {Client} from "minio"
import "dotenv/config"

export const minioClient = new Client({
  endPoint: process.env.MINIO_HOST || "localhost",
  region: process.env.MINIO_REGION,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

export const BUCKET = process.env.MINIO_BUCKET || "";
export const PUBLIC_URL = process.env.MINIO_HOST;