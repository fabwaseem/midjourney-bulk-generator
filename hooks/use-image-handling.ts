"use client";

import toast from "react-hot-toast";
import { upscaleImage } from "@/lib/api-client";
import { useSettings } from "@/lib/settings-context";
import { type GeneratedImage } from "@/types";

export function useImageHandling() {
  const {
    discordConfig,
    images,
    upscaling,
    addImages,
    removeImage,
    setUpscalingState,
    updateImage,
    imageSettings,
  } = useSettings();

  const handleUpscale = async (image: GeneratedImage) => {
    const imageKey = `${image.msgId}-${image.index}`;
    setUpscalingState(imageKey, true);
    const loadingToast = toast.loading("Upscaling image...");

    try {
      const response = await upscaleImage({
        msgId: image.msgId,
        hash: image.hash,
        flags: image.flags,
        index: image.index,
        serverId: discordConfig.serverId,
        channelId: discordConfig.channelId,
        token: discordConfig.token,
      });

      updateImage(image, response.image.url);
      toast.success("Image upscaled successfully!", { id: loadingToast });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upscale image",
        { id: loadingToast }
      );
    } finally {
      setUpscalingState(imageKey, false);
    }
  };

  return { images, upscaling, addImages, removeImage, handleUpscale };
}
