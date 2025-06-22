"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/lib/settings-context";
import {
  ASPECT_RATIOS,
  CHAOS_RANGE,
  QUALITY_OPTIONS,
  VERSION_OPTIONS,
} from "@/types";
import { Sparkles } from "lucide-react";
import { Label } from "./ui/label";
import { usePathname } from "next/navigation";

export function GeneralSettings() {
  const {
    imageSettings,
    updateImageSettings,
    bulkSettings,
    updateBulkSettings,
  } = useSettings();
  const pathname = usePathname();

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>AI Enhancement</Label>
          <Switch
            checked={imageSettings.enhanceWithAI}
            onCheckedChange={(checked) => {
              updateImageSettings({ enhanceWithAI: checked });
              if (checked) {
                updateImageSettings({ parameters: {} });
              }
            }}
          />
        </div>

        {imageSettings.enhanceWithAI && (
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-blue-600">
                  AI Enhancement Active
                </h3>
                <p className="text-xs text-blue-600/80">
                  When AI enhancement is enabled, all image parameters (aspect
                  ratio, quality, version, etc.) will be automatically optimized
                  by AI based on your prompt. This ensures the best possible
                  results for your specific image request.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {!imageSettings.enhanceWithAI && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Aspect Ratio</Label>
            <Select
              value={imageSettings.parameters.ar}
              onValueChange={(value) =>
                updateImageSettings({
                  parameters: { ...imageSettings.parameters, ar: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ratio" />
              </SelectTrigger>
              <SelectContent>
                {ASPECT_RATIOS.map((ratio) => (
                  <SelectItem key={ratio.value} value={ratio.value}>
                    {ratio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quality</Label>
            <Select
              value={imageSettings.parameters.q}
              onValueChange={(value) =>
                updateImageSettings({
                  parameters: { ...imageSettings.parameters, q: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                {QUALITY_OPTIONS.map((quality) => (
                  <SelectItem key={quality.value} value={quality.value}>
                    {quality.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Version</Label>
            <Select
              value={imageSettings.parameters.v}
              onValueChange={(value) =>
                updateImageSettings({
                  parameters: { ...imageSettings.parameters, v: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {VERSION_OPTIONS.map((version) => (
                  <SelectItem key={version.value} value={version.value}>
                    {version.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Seed</Label>
            <Input
              type="number"
              placeholder="Enter seed"
              value={imageSettings.parameters.seed || ""}
              onChange={(e) =>
                updateImageSettings({
                  parameters: {
                    ...imageSettings.parameters,
                    seed: Number(e.target.value),
                  },
                })
              }
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label>Chaos ({imageSettings.parameters.chaos || 0})</Label>
            <Slider
              value={[imageSettings.parameters.chaos || 0]}
              onValueChange={([value]) =>
                updateImageSettings({
                  parameters: { ...imageSettings.parameters, chaos: value },
                })
              }
              min={CHAOS_RANGE.min}
              max={CHAOS_RANGE.max}
              step={CHAOS_RANGE.step}
            />
          </div>

          <div className="flex items-center justify-between col-span-1">
            <Label>Tile</Label>
            <Switch
              checked={imageSettings.parameters.tile || false}
              onCheckedChange={(checked) =>
                updateImageSettings({
                  parameters: {
                    ...imageSettings.parameters,
                    tile: checked,
                  },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between col-span-1">
            <Label>Uplight</Label>
            <Switch
              checked={imageSettings.parameters.uplight || false}
              onCheckedChange={(checked) =>
                updateImageSettings({
                  parameters: {
                    ...imageSettings.parameters,
                    uplight: checked,
                  },
                })
              }
            />
          </div>
        </div>
      )}

      <div className="space-y-4 pt-4 mt-4 border-t">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Download Settings
        </h3>
        <div className="space-y-2">
          <Label>Size Multiplier ({imageSettings.multiplier}x)</Label>
          <Slider
            value={[imageSettings.multiplier]}
            onValueChange={([value]) =>
              updateImageSettings({ multiplier: value })
            }
            min={1}
            max={5}
            step={0.5}
          />
          <p className="text-xs text-muted-foreground pt-1">
            Increase the output size of upscaled images. Applied on the server
            before final upload.
          </p>
        </div>
      </div>

      {pathname === "/bulk" && (
        <div className="space-y-4 pt-4 mt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Page</Label>
              <Input
                type="number"
                min={1}
                value={bulkSettings.page}
                onChange={(e) =>
                  updateBulkSettings({ page: Number(e.target.value) })
                }
                className="bg-background/50 backdrop-blur-sm transition-colors focus:bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Set the starting page for scraping titles.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Max Pages</Label>
              <Input
                type="number"
                min={1}
                value={bulkSettings.maxPages}
                onChange={(e) =>
                  updateBulkSettings({ maxPages: Number(e.target.value) })
                }
                className="bg-background/50 backdrop-blur-sm transition-colors focus:bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Set the maximum number of pages to scrape.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
