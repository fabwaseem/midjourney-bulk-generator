import { Midjourney } from "midjourney";
import { NextResponse } from "next/server";
import { retryOperation } from "@/lib/utils";
import { uploadToS3 } from "@/lib/s3";
import { v4 as uuidv4 } from "uuid";

function sanitizeContentToFilename(content: string): string {
  // Extracts the prompt from the content, which is typically between **
  const promptMatch = content.match(/\*\*(.*?)\*\*/);
  const prompt = promptMatch ? promptMatch[1] : `upscaled-image-${uuidv4()}`;

  const sanitized = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with one

  return sanitized.slice(0, 100).replace(/-$/, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { msgId, hash, flags, index, serverId, channelId, token } = body;

    if (!msgId || !hash || flags === undefined || !index) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (!serverId || !channelId) {
      return NextResponse.json(
        { error: "Discord Server ID and Channel ID are required" },
        { status: 400 }
      );
    }

    // Initialize Midjourney client
    const client = new Midjourney({
      ServerId: serverId,
      ChannelId: channelId,
      SalaiToken: token,
      Debug: true,
      Ws: true,
      ApiInterval: 350,
      MaxWait: 200,
      Limit: 50,
      BotId: "936929561302675456",
      DiscordBaseUrl: "https://discord.com",
      WsBaseUrl: "wss://gateway.discord.gg/?encoding=json&v=9",
    });

    await client.Connect();

    // Perform upscaling
    const upscaled = await retryOperation(() =>
      client.Upscale({
        index,
        msgId,
        hash,
        flags,
        loading: (uri: string, progress: string) => {
          console.log("Upscale.loading", uri, "progress", progress);
        },
      })
    );

    if (!upscaled) {
      throw new Error("Failed to upscale image");
    }

    // Download the image buffer
    const response = await fetch(upscaled.uri);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const baseFilename = sanitizeContentToFilename(upscaled.content);
    const filename = `${baseFilename}-upscaled-${uuidv4().slice(0, 8)}.png`;
    const s3Url = await uploadToS3(buffer, "upscaled", filename);

    // Close the client connection
    client.Close();

    return NextResponse.json({
      success: true,
      image: {
        url: s3Url,
        content: upscaled.content,
      },
    });
  } catch (error) {
    console.error("Error in image upscaling:", error);
    return NextResponse.json(
      {
        error: "Failed to upscale image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
