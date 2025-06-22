import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(
  buffer: Buffer,
  folder: string,
  filename: string
): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME!;

  const params = {
    Bucket: bucketName,
    Key: `${folder}/${filename}`,
    Body: buffer,
    ContentType: "image/png",
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  // Construct the public URL
  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${folder}/${filename}`;
}
