import OpenAI from "openai";

/**
 * Removes specific Midjourney parameters from the prompt
 * @param prompt The input prompt
 * @returns Cleaned prompt without unwanted parameters
 */
function removeUnwantedParameters(prompt: string): string {
  // Array of regex patterns to match and remove
  const unwantedPatterns = [
    /\s+--v\s*\d+(\.\d+)?/g, // Matches --v 4, --v 5, --v 5.1, etc.
    /\s+--version\s*\d+(\.\d+)?/g, // Matches --version 4, --version 5, etc.
    /\s+--hd\b/g, // Matches --hd
    /\s+--quality\s*\d+/g, // Matches --quality followed by numbers
    /\s+--q\s*\d+/g, // Matches --q followed by numbers
  ];

  // Apply each pattern to remove unwanted parameters
  let cleanedPrompt = prompt;
  for (const pattern of unwantedPatterns) {
    cleanedPrompt = cleanedPrompt.replace(pattern, "");
  }

  // remove double quotes, remove dots, remove commas
  cleanedPrompt = cleanedPrompt.replace(/"/g, "");
  cleanedPrompt = cleanedPrompt.replace(/\./g, "");
  cleanedPrompt = cleanedPrompt.replace(/,/g, "");

  // Trim any extra whitespace
  return cleanedPrompt.trim();
}

export async function enhancePrompt(
  prompt: string,
  apiKey: string
): Promise<string> {
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional stock photography prompt expert for Midjourney. Your task is to enhance image prompts to create high-quality, commercially viable stock photos by:

1. Emphasizing photorealistic qualities and commercial appeal
2. Adding specific details about:
   - Lighting (natural, studio, dramatic, soft, etc.)
   - Composition (rule of thirds, leading lines, etc.)
   - Color palette and tone
   - Camera perspective and angle
   - Environment and setting details
3. Including technical photography terms like:
   - Depth of field
   - Focus points
   - Lighting setups (rembrandt, butterfly, etc.)
4. Adding style descriptors that appeal to stock photo buyers:
   - Clean backgrounds
   - Copy space
   - Professional setting
   - Modern aesthetic
5. Incorporating relevant Midjourney parameters like --ar for optimal stock photo ratios
6. DO NOT add:
   - Version parameters (--v 4, --v 5, etc.)
   - HD parameters
   - Niche artistic styles that wouldn't work for stock photos
7. DO NOT give a too long prompt, keep it short and concise maximum of 200 characters.
8. DO NOT add close up, we want to generate images that are not close ups.
9. Add the object should be in the center of the image. no cutting off the object.
10. DO NOT add very detailed things or objects like trees.
11. DO NOT add profanity or any other offensive words like sexy, hot, etc.

Focus on creating prompts that will generate professional, commercially viable images suitable for stock photo marketplaces.
Always maintain the original intent while making it more marketable and professional.
ALWAYS return ONLY the enhanced prompt, no explanations or other text.`,
        },
        {
          role: "user",
          content: `Enhance this image prompt for a professional stock photo: "${prompt}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const enhancedPrompt =
      response.choices[0].message.content?.trim() || prompt;
    // Clean the enhanced prompt before returning
    return removeUnwantedParameters(enhancedPrompt);
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    throw new Error("Failed to enhance prompt");
  }
}
