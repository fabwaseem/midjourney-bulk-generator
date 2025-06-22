"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/settings-context";
import { type GeneratedImage } from "@/types";
import { saveAs } from "file-saver";
import { Image as ImageJS } from "image-js";
import JSZip from "jszip";
import {
  Download,
  Loader2,
  Package,
  Trash2,
  XCircle
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Masonry from "react-masonry-css";
import Lightbox from "yet-another-react-lightbox";

interface ImageGalleryProps {
  images: GeneratedImage[];
  upscaling: { [key: string]: boolean };
  onUpscale: (image: GeneratedImage) => void;
  onDelete?: (image: GeneratedImage) => void;
}

export function ImageGallery({
  images,
  upscaling,
  onDelete,
}: ImageGalleryProps) {
  const { clearImages, imageSettings } = useSettings();
  const [index, setIndex] = useState(-1);
  const [isZipping, setIsZipping] = useState(false);

  const breakpointColumns = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  const resizeBlob = async (blob: Blob): Promise<Blob> => {
    if (imageSettings.multiplier <= 1) return blob;

    const arrayBuffer = await blob.arrayBuffer();
    const image = await ImageJS.load(arrayBuffer);
    const resized = image.resize({
      factor: imageSettings.multiplier,
    });
    return resized.toBlob("image/png", 0.95);
  };

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const toastId = toast.loading("Downloading image...");
      const response = await fetch(image.url);
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      let blob = await response.blob();
      if (imageSettings.multiplier > 1) {
        toast.loading(`Resizing image (${imageSettings.multiplier}x)...`, {
          id: toastId,
        });
        blob = await resizeBlob(blob);
      }
      saveAs(blob, image.filename);
      toast.success("Image downloaded!", { id: toastId });
    } catch (error) {
      console.error("Failed to download image:", error);
      toast.error("Could not download image.");
    }
  };


  const handleDownloadAll = async () => {
    if (images.length === 0) return;
    setIsZipping(true);
    const toastId = toast.loading("Preparing zip file...");

    try {
      const zip = new JSZip();
      const folder = zip.folder("images");

      if (!folder) {
        throw new Error("Failed to create folder in zip");
      }

      const imageFetchPromises = images.map(async (image) => {
        try {
          const response = await fetch(image.url);
          if (!response.ok) return null;
          let blob = await response.blob();
          if (imageSettings.multiplier > 1) {
            blob = await resizeBlob(blob);
          }
          return { filename: image.filename, blob };
        } catch (error) {
          console.error(`Failed to fetch ${image.filename}:`, error);
          return null; // Skip failed downloads
        }
      });

      const results = await Promise.all(imageFetchPromises);
      let fileCount = 0;
      for (const result of results) {
        if (result) {
          folder.file(result.filename, result.blob);
          fileCount++;
        }
      }

      if (fileCount === 0) {
        throw new Error("No images could be downloaded.");
      }

      toast.loading(`Zipping ${fileCount} images...`, { id: toastId });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "midjourney-images.zip");

      toast.success("Images downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("Failed to download all images:", error);
      toast.error(
        error instanceof Error ? error.message : "Could not download images.",
        { id: toastId }
      );
    } finally {
      setIsZipping(false);
    }
  };

  const handleClearAll = () => {
    clearImages();
    toast.success("All images have been cleared.");
  };

  return (
    <div className="w-full mt-4">
      {images.length > 0 && (
        <div className="flex justify-end items-center gap-4 mb-4 px-4">
          <Button
            variant="outline"
            onClick={handleDownloadAll}
            disabled={isZipping}
          >
            {isZipping ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Package className="mr-2 h-4 w-4" />
            )}
            Download All ({images.length})
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all
                  {images.length} generated images from this session.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {images.length > 0 ? (
        <Masonry
          breakpointCols={breakpointColumns}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {images.map((image, i) => {
            const imageKey = `${image.msgId}-${image.index}`;
            const isUpscaling = upscaling[imageKey];

            return (
              <div
                key={imageKey}
                className="image-card group mb-4 cursor-pointer"
                style={{ animationDelay: `${Math.random() * 2}s` }}
                onClick={() => setIndex(i)}
              >
                <img
                  src={image.url}
                  alt={image.filename}
                  width={400}
                  height={400}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {isUpscaling && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                )}

                {/* Action buttons - top right */}
                <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 transform translate-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-black/20 border-white/20 text-white hover:bg-black/40 hover:text-white backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(image);
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 bg-red-500/20 border-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-red-300 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(image);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Upscale button - bottom right */}
                {/* <div className="absolute bottom-2 right-2 z-10 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 transform translate-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-black/20 border-white/20 text-white hover:bg-black/40 hover:text-white backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpscale(image);
                    }}
                    disabled={isUpscaling}
                  >
                    <ArrowUpToLine className="w-4 h-4" />
                  </Button>
                </div> */}
              </div>
            );
          })}
        </Masonry>
      ) : (
        <div className="text-center text-muted-foreground py-16 bg-card/30 backdrop-blur-sm rounded-xl border border-border/50">
          No images generated yet. Enter a prompt and click generate to start!
        </div>
      )}

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={images.map((img) => ({ src: img.url, title: img.filename }))}
      />
    </div>
  );
}
