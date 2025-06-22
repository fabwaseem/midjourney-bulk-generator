import type {
  ImageGenerationRequest,
  MidjourneyParameters,
  UpscaleRequest,
  UpscaleResponse,
  GeneratedImage,
} from "@/types";

export function buildPrompt(
  basePrompt: string,
  parameters: MidjourneyParameters
): string {
  const parts = [basePrompt];

  if (parameters.ar) parts.push(`--ar ${parameters.ar}`);
  if (parameters.q) parts.push(`--q ${parameters.q}`);
  if (parameters.v) parts.push(`--v ${parameters.v}`);
  if (parameters.seed) parts.push(`--seed ${parameters.seed}`);
  if (parameters.chaos) parts.push(`--chaos ${parameters.chaos}`);
  if (parameters.tile) parts.push("--tile");
  if (parameters.uplight) parts.push("--uplight");

  return parts.join(" ");
}

export async function generateImage(request: ImageGenerationRequest): Promise<{
  success: boolean;
  images: GeneratedImage[];
  enhancedPrompt?: string;
}> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || "Failed to generate image");
  }

  return response.json();
}

export async function upscaleImage(
  request: UpscaleRequest
): Promise<UpscaleResponse> {
  const response = await fetch("/api/upscale", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || "Failed to upscale image");
  }

  return response.json();
}
