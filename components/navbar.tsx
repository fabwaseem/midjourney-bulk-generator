"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { Settings, Sparkles, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GeneralSettings } from "./general-settings";
import { DiscordSettings } from "./discord-settings";
import { SettingsSheet } from "./settings-sheet";
import { useSettings } from "@/lib/settings-context";
import toast from "react-hot-toast";

export function Navbar() {
  const pathname = usePathname();
  const {
    resetImageSettings,
    resetDiscordConfig,
    isDiscordSettingsOpen,
    setIsDiscordSettingsOpen,
    resetBulkSettings,
  } = useSettings();

  const handleResetImageSettings = () => {
    resetImageSettings();
    resetBulkSettings();
    toast.success("Generation settings reset to defaults");
  };

  const handleResetDiscordConfig = () => {
    resetDiscordConfig();
    toast.success("Discord settings reset to defaults");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Sparkles className="h-6 w-6" />
            <span className="font-bold">Midjourney Bulk Generator</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Generator
            </Link>
            <Link
              href="/bulk"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/bulk" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Bulk Generator
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <SettingsSheet
            trigger={
              <Button variant="ghost" size="icon">
                <Settings2 className="h-4 w-4" />
                <span className="sr-only">Toggle settings</span>
              </Button>
            }
            title="Generation Settings"
            description="Manage parameters for image generation."
            onReset={handleResetImageSettings}
            resetButtonText="Reset Generation Settings"
          >
            <GeneralSettings />
          </SettingsSheet>

          <SettingsSheet
            trigger={
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>
            }
            title="Discord Configuration"
            description="Manage your Discord and OpenAI credentials."
            onReset={handleResetDiscordConfig}
            resetButtonText="Reset Discord Settings"
            open={isDiscordSettingsOpen}
            onOpenChange={setIsDiscordSettingsOpen}
          >
            <DiscordSettings />
          </SettingsSheet>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
