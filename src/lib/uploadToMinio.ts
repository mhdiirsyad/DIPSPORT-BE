import path from "path"
import { lookup } from "es-mime-types"
import { v4 as uuidv4 } from "uuid"
import { BUCKET, minioClient, PUBLIC_URL } from "./minioClient.js"
import type { FileUpload } from 'graphql-upload/processRequest.mjs';

export async function uploadToMinio(file: FileUpload, folder: string) {
  const { createReadStream, filename, mimetype } = file
  const ext = path.extname(filename)
  const objectName = `${folder}/${uuidv4()}${ext}`

  const stream = createReadStream()

  await minioClient.putObject(BUCKET, objectName, stream, undefined, {
    "Content-Type": mimetype || lookup(ext) || "application/octet-stream",
  })

  const publicUrl = `https://${PUBLIC_URL}/${BUCKET}/${objectName}`
  return { publicUrl, objectName }
}