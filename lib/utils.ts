import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Maximum number of retries for API calls
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to extract filename from Midjourney content
export function extractFilenameFromContent(content: string): string {
  // Extract text between ** markers
  const match = content.match(/\*\*(.*?)\*\*/);
  if (!match) return "";

  // Get the text and clean it
  const filename = match[1]
    .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .toLowerCase()
    .slice(0, 100); // Convert to lowercase

  return filename;
}

// Helper function to retry operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await delay(RETRY_DELAY);
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
}

// Type for Midjourney response
export interface MidjourneyResponse {
  id: string;
  flags: number;
  content: string;
  hash: string;
  progress: string;
  uri: string;
  proxy_url: string;
  options: any[];
  width: number;
  height: number;
}
