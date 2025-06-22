"use client";

import { useSettings } from "@/lib/settings-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DiscordSettings() {
  const { discordConfig, updateDiscordConfig } = useSettings();

  const isConfigReady =
    discordConfig.token &&
    discordConfig.serverId &&
    discordConfig.channelId &&
    discordConfig.openaiApiKey;

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Discord Token</Label>
          <Input
            placeholder="Enter Discord Token"
            value={discordConfig.token}
            onChange={(e) => updateDiscordConfig({ token: e.target.value })}
            type="password"
          />
          <p className="text-xs text-muted-foreground">
            Your Discord bot token for authentication.
          </p>
        </div>
        <div className="space-y-2">
          <Label>OpenAI API Key</Label>
          <Input
            placeholder="Enter OpenAI API Key"
            value={discordConfig.openaiApiKey}
            onChange={(e) =>
              updateDiscordConfig({ openaiApiKey: e.target.value })
            }
            type="password"
          />
          <p className="text-xs text-muted-foreground">
            Your OpenAI API key for AI prompt enhancement.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Server ID</Label>
            <Input
              placeholder="Enter Discord Server ID"
              value={discordConfig.serverId}
              onChange={(e) =>
                updateDiscordConfig({ serverId: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Channel ID</Label>
            <Input
              placeholder="Enter Discord Channel ID"
              value={discordConfig.channelId}
              onChange={(e) =>
                updateDiscordConfig({ channelId: e.target.value })
              }
            />
          </div>
        </div>
        <div
          className={`flex items-center justify-between p-3 rounded-lg border ${
            isConfigReady
              ? "bg-green-500/10 border-green-500/20"
              : "bg-red-500/10 border-red-500/20"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConfigReady ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm font-medium">Configuration Status</span>
          </div>
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${
              isConfigReady
                ? "bg-green-500/20 text-green-600"
                : "bg-red-500/20 text-red-600"
            }`}
          >
            {isConfigReady ? "Ready" : "Incomplete"}
          </div>
        </div>
      </div>
    </>
  );
}
