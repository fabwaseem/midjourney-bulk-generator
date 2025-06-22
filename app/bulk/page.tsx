"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateImage } from "@/lib/api-client";
import { useSettings } from "@/lib/settings-context";
import { type ImageGenerationRequest, type GeneratedImage } from "@/types";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ImageGallery } from "@/components/image-gallery";
import { useImageHandling } from "@/hooks/use-image-handling";

export default function Home() {
  const {
    discordConfig,
    imageSettings,
    setIsDiscordSettingsOpen,
    bulkSettings,
  } = useSettings();
  const { images, upscaling, addImages, handleUpscale, removeImage } =
    useImageHandling();

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>();
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [titles, setTitles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDeleteImage = (image: GeneratedImage) => {
    removeImage(image);
    toast.success("Image deleted successfully");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a keyword or URL");
      return;
    }

    const loadingToast = toast.loading("Fetching titles...");
    setLoading(true);
    let allTitles: string[] = [];
    let currentPage = bulkSettings.page;
    let hasMorePages = true;

    try {
      while (hasMorePages && currentPage <= bulkSettings.maxPages) {
        const response = await fetch("/api/titles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: query.trim(),
            page: currentPage,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch titles");
        }

        const data = await response.json();
        if (data.error) {
          if (data.error === "Images not found on this page") {
            hasMorePages = false;
            break;
          }
          throw new Error(data.error);
        }

        allTitles = [...allTitles, ...data.titles];
        currentPage++;
      }

      if (allTitles.length === 0) {
        throw new Error("No titles found");
      }

      allTitles = allTitles.sort(() => Math.random() - 0.5);

      setTitles(allTitles);

      toast.success(`Fetched ${allTitles.length} titles successfully!`, {
        id: loadingToast,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch titles",
        {
          id: loadingToast,
        }
      );
    } finally {
      setLoading(false);
      // Start generating images
      setCurrentTitleIndex(0);
      setIsGenerating(true);
    }
  };

  const generateNextImage = async () => {
    if (currentTitleIndex >= titles.length) {
      setIsGenerating(false);
      return;
    }

    if (
      !discordConfig.serverId ||
      !discordConfig.channelId ||
      !discordConfig.token
    ) {
      toast.error("Please set your Discord settings");
      setIsDiscordSettingsOpen(true);
      setIsGenerating(false);
      return;
    }

    if (imageSettings.enhanceWithAI && !discordConfig.openaiApiKey) {
      toast.error("Please set your OpenAI API key in the Discord settings");
      setIsDiscordSettingsOpen(true);
      setIsGenerating(false);
      return;
    }

    try {
      const request: ImageGenerationRequest = {
        prompt: titles[currentTitleIndex],
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
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate image"
      );
      setIsGenerating(false);
    } finally {
      setCurrentTitleIndex((prev) => prev + 1);
    }
  };

  // Effect to handle auto-generation
  useEffect(() => {
    if (isGenerating && titles.length > 0) {
      generateNextImage();
    }
  }, [isGenerating, currentTitleIndex, titles]);

  return (
    <>
      <div className="w-full ">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter a keyword or Adobe Stock URL..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-background/50 backdrop-blur-sm transition-colors focus:bg-background"
              />
            </div>
            <Button
              type="submit"
              className="px-8 button-glow"
              disabled={loading || isGenerating}
            >
              {loading ? (
                "Fetching..."
              ) : isGenerating ? (
                "Generating..."
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </Button>
            {isGenerating && (
              <Button
                onClick={() => setIsGenerating(false)}
                variant="destructive"
                className="px-8"
              >
                Stop
              </Button>
            )}
          </div>

          {/* Progress indicator */}
          {titles.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Processing title {currentTitleIndex + 1} of {titles.length}
            </div>
          )}

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
