import { Midjourney } from "midjourney";
import { NextResponse } from "next/server";
import { retryOperation } from "@/lib/utils";
import { enhancePrompt } from "@/lib/openai";
import { buildPrompt } from "@/lib/api-client";
import { uploadToS3 } from "@/lib/s3";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

function sanitizePromptToFilename(prompt: string): string {
  const sanitized = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with one

  // Truncate to a max length and remove trailing hyphen
  return sanitized.slice(0, 100).replace(/-$/, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      prompt,
      enhanceWithAI,
      parameters,
      serverId,
      channelId,
      token,
      openaiApiKey,
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!serverId || !channelId || !token) {
      return NextResponse.json(
        { error: "Discord Server ID, Channel ID and Token are required" },
        { status: 400 }
      );
    }

    if (enhanceWithAI) {
      if (!openaiApiKey) {
        return NextResponse.json(
          { error: "OpenAI API key is required for enhancement" },
          { status: 400 }
        );
      }
    }

    // Enhance prompt if requested
    let finalPrompt = prompt;
    if (enhanceWithAI) {
      try {
        finalPrompt = await enhancePrompt(prompt, openaiApiKey);
        console.log("Enhanced prompt:", finalPrompt);
      } catch (error) {
        console.error("Error enhancing prompt:", error);
        // Continue with original prompt if enhancement fails
      }
    } else {
      finalPrompt = buildPrompt(prompt, parameters);
    }

    // Initialize Midjourney client
    const client = new Midjourney({
      ServerId: serverId,
      ChannelId: channelId,
      SalaiToken: token,
      // Debug: true,
      Ws: true,
      ApiInterval: 350,
      MaxWait: 200,
      Limit: 50,
      BotId: "936929561302675456",
      DiscordBaseUrl: "https://discord.com",
      WsBaseUrl: "wss://gateway.discord.gg/?encoding=json&v=9",
    });

    await client.Connect();

    // Generate initial image
    const imagine = await retryOperation(() =>
      client.Imagine(finalPrompt, (uri: string, progress: string) => {
        console.log("progress", progress);
      })
    );

    if (!imagine) {
      throw new Error("Failed to generate initial image");
    }

    // Download the image
    const response = await fetch(imagine.uri);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Split the image into quadrants
    const quadrants = await splitImageIntoQuadrants(buffer);

    // Process and upload all quadrants concurrently
    const uploadPromises = quadrants.map(async (quadrant, i) => {
      const baseFilename = sanitizePromptToFilename(finalPrompt);
      const uniqueId = uuidv4().slice(0, 4);
      const filename = `${baseFilename}-${i + 1}${uniqueId}.png`;

      const s3Url = await uploadToS3(quadrant, "generated", filename);

      return {
        url: s3Url,
        msgId: imagine.id!,
        hash: imagine.hash!,
        flags: imagine.flags,
        index: i + 1,
        content: imagine.content,
        filename: filename,
      };
    });

    const generatedImages = await Promise.all(uploadPromises);

    // Close the client connection
    client.Close();

    return NextResponse.json({
      success: true,
      images: generatedImages,
      enhancedPrompt: enhanceWithAI ? finalPrompt : undefined,
    });
  } catch (error) {
    console.error("Error in image generation:", error);
    return NextResponse.json(
      {
        error: "Failed to generate image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Function to split an image into 4 equal parts
async function splitImageIntoQuadrants(inputBuffer: Buffer): Promise<Buffer[]> {
  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to get image dimensions");
  }

  const halfWidth = Math.floor(metadata.width / 2);
  const halfHeight = Math.floor(metadata.height / 2);

  // Extract each quadrant
  const topLeft = image.clone().extract({
    left: 0,
    top: 0,
    width: halfWidth,
    height: halfHeight,
  });

  const topRight = image.clone().extract({
    left: halfWidth,
    top: 0,
    width: halfWidth,
    height: halfHeight,
  });

  const bottomLeft = image.clone().extract({
    left: 0,
    top: halfHeight,
    width: halfWidth,
    height: halfHeight,
  });

  const bottomRight = image.clone().extract({
    left: halfWidth,
    top: halfHeight,
    width: halfWidth,
    height: halfHeight,
  });

  // Convert all quadrants to buffers
  const quadrants = await Promise.all([
    topLeft.toBuffer(),
    topRight.toBuffer(),
    bottomLeft.toBuffer(),
    bottomRight.toBuffer(),
  ]);

  return quadrants;
}
