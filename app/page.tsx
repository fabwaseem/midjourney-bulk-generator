"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { generateImage } from "@/lib/api-client";
import { useSettings } from "@/lib/settings-context";
import { Sparkles } from "lucide-react";
import { type ImageGenerationRequest, type GeneratedImage } from "@/types";
import { ImageGallery } from "@/components/image-gallery";
import { useImageHandling } from "@/hooks/use-image-handling";

export default function Home() {
  const { discordConfig, imageSettings, setIsDiscordSettingsOpen } =
    useSettings();
  const { images, upscaling, addImages, handleUpscale, removeImage } =
    useImageHandling();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (
      !discordConfig.serverId ||
      !discordConfig.channelId ||
      !discordConfig.token
    ) {
      toast.error("Please set your Discord settings");
      setIsDiscordSettingsOpen(true);
      return;
    }

    if (imageSettings.enhanceWithAI && !discordConfig.openaiApiKey) {
      toast.error("Please set your OpenAI API key in the Discord settings");
      setIsDiscordSettingsOpen(true);
      return;
    }

    const loadingToast = toast.loading(
      imageSettings.enhanceWithAI
        ? "Enhancing prompt and generating images..."
        : "Generating images..."
    );
    setLoading(true);

    try {
      const request: ImageGenerationRequest = {
        prompt,
        parameters: imageSettings.enhanceWithAI
          ? undefined
          : imageSettings.parameters,
        enhanceWithAI: imageSettings.enhanceWithAI,
        multiplier: imageSettings.multiplier,
        serverId: discordConfig.serverId,
        channelId: discordConfig.channelId,
        token: discordConfig.token,
        openaiApiKey: discordConfig.openaiApiKey,
      };

      const response = await generateImage(request);
      addImages(response.images);
      if (response.enhancedPrompt) {
        setEnhancedPrompt(response.enhancedPrompt);
      }
      toast.success("Images generated successfully!", {
        id: loadingToast,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate images",
        {
          id: loadingToast,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = (image: GeneratedImage) => {
    removeImage(image);
    toast.success("Image deleted successfully");
  };

  return (
    <>
      <div className="w-full ">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter a prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-background/50 backdrop-blur-sm transition-colors focus:bg-background"
              />
            </div>
            <Button
              type="submit"
              className="px-8 button-glow"
              disabled={loading}
            >
              {loading ? (
                "Generating..."
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>

          {enhancedPrompt && (
            <div className="p-4 bg-accent/30 backdrop-blur-sm rounded-xl border border-accent">
              <p className="text-sm font-medium mb-1">Enhanced Prompt:</p>
              <p className="text-sm text-muted-foreground">{enhancedPrompt}</p>
            </div>
          )}
        </form>
      </div>

      <ImageGallery
        images={images}
        upscaling={upscaling}
        onUpscale={handleUpscale}
        onDelete={handleDeleteImage}
      />
    </>
  );
}
