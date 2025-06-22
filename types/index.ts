export interface MidjourneyParameters {
  ar?: string; // Aspect ratio
  v?: string; // Version
  q?: string; // Quality
  seed?: number; // Seed
  chaos?: number; // Chaos value
  tile?: boolean; // Tile mode
  uplight?: boolean; // Uplight mode
  sref?: string; // Style reference
  no?: string[]; // Elements to exclude
}

export interface ImageGenerationRequest {
  prompt: string;
  parameters?: MidjourneyParameters;
  enhanceWithAI?: boolean; // Whether to enhance the prompt using AI
  multiplier?: number; // Multiplier for the image size
  serverId: string; // Discord Server ID
  channelId: string; // Discord Channel ID
  token: string; // Discord Token
  openaiApiKey?: string; // OpenAI API Key for prompt enhancement
}

export interface ImageGenerationResponse {
  success: boolean;
  images: string[];
  error?: string;
  details?: string;
  enhancedPrompt?: string; // The AI-enhanced prompt if enhancement was requested
}

export interface GeneratedImage {
  url: string;
  msgId: string;
  hash: string;
  flags: number;
  index: number;
  content: string;
  filename: string;
}

export interface UpscaleRequest {
  msgId: string;
  hash: string;
  flags: number;
  index: number;
  serverId: string;
  channelId: string;
  token: string;
}

export interface UpscaleResponse {
  success: boolean;
  image: {
    url: string;
    content: string;
  };
}

// Parameter options for select components
export const ASPECT_RATIOS = [
  { value: "21:9", label: "Ultrawide (21:9)" },
  { value: "16:9", label: "Widescreen (16:9)" },
  { value: "3:2", label: "Classic (3:2)" },
  { value: "4:3", label: "Standard (4:3)" },
  { value: "1:1", label: "Square (1:1)" },
  { value: "3:4", label: "Portrait (3:4)" },
  { value: "2:3", label: "Classic Portrait (2:3)" },
  { value: "9:16", label: "Mobile Portrait (9:16)" },
  { value: "9:21", label: "Tall Portrait (9:21)" },
];

export const QUALITY_OPTIONS = [
  { value: "0.25", label: "Low Quality" },
  { value: "1", label: "Default" },
  { value: "2", label: "High Quality" },
];

export const VERSION_OPTIONS = [
  { value: "7", label: "Version 7" },
  { value: "6.1", label: "Version 6.1" },
  { value: "6", label: "Version 6" },
  { value: "5.2", label: "Version 5.2" },
  { value: "5.1", label: "Version 5.1" },
  { value: "5", label: "Version 5" },
];

export const CHAOS_RANGE = {
  min: 0,
  max: 100,
  step: 1,
  default: 0,
};

export const UPSCALE_OPTIONS = [
  { value: 1, label: "Variation 1" },
  { value: 2, label: "Variation 2" },
  { value: 3, label: "Variation 3" },
  { value: 4, label: "Variation 4" },
];
