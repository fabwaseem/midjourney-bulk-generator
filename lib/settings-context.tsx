"use client";

import { type GeneratedImage } from "@/types";
import React, { createContext, useContext, useEffect, useState } from "react";

interface DiscordConfig {
  serverId: string;
  channelId: string;
  token: string;
  openaiApiKey: string;
}

interface ImageGenerationSettings {
  enhanceWithAI: boolean;
  parameters: {
    ar?: string;
    q?: string;
    v?: string;
    seed?: number;
    chaos?: number;
    tile?: boolean;
    uplight?: boolean;
  };
  multiplier: number;
}

interface BulkSettings {
  page: number;
  maxPages: number;
}

interface SettingsContextType {
  discordConfig: DiscordConfig;
  setDiscordConfig: (config: DiscordConfig) => void;
  updateDiscordConfig: (updates: Partial<DiscordConfig>) => void;
  imageSettings: ImageGenerationSettings;
  setImageSettings: (settings: ImageGenerationSettings) => void;
  updateImageSettings: (updates: Partial<ImageGenerationSettings>) => void;
  resetImageSettings: () => void;
  resetDiscordConfig: () => void;
  isDiscordSettingsOpen: boolean;
  setIsDiscordSettingsOpen: (isOpen: boolean) => void;
  bulkSettings: BulkSettings;
  updateBulkSettings: (updates: Partial<BulkSettings>) => void;
  resetBulkSettings: () => void;
  images: GeneratedImage[];
  upscaling: { [key: string]: boolean };
  addImages: (newImages: GeneratedImage[]) => void;
  removeImage: (image: GeneratedImage) => void;
  clearImages: () => void;
  setUpscalingState: (imageKey: string, isUpscaling: boolean) => void;
  updateImage: (image: GeneratedImage, newUrl: string) => void;
}

const defaultDiscordConfig: DiscordConfig = {
  serverId: "",
  channelId: "",
  token: "",
  openaiApiKey: "",
};

const defaultImageSettings: ImageGenerationSettings = {
  enhanceWithAI: true,
  parameters: {},
  multiplier: 3,
};

const defaultBulkSettings: BulkSettings = {
  page: 1,
  maxPages: 1,
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [discordConfig, setDiscordConfigState] =
    useState<DiscordConfig>(defaultDiscordConfig);
  const [imageSettings, setImageSettingsState] =
    useState<ImageGenerationSettings>(defaultImageSettings);
  const [bulkSettings, setBulkSettingsState] =
    useState<BulkSettings>(defaultBulkSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDiscordSettingsOpen, setIsDiscordSettingsOpen] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [upscaling, setUpscaling] = useState<{ [key: string]: boolean }>({});

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedDiscordConfig = localStorage.getItem("discordConfig");
      const savedImageSettings = localStorage.getItem("imageSettings");
      const savedBulkSettings = localStorage.getItem("bulkSettings");

      if (savedDiscordConfig) {
        setDiscordConfigState(JSON.parse(savedDiscordConfig));
      }

      if (savedImageSettings) {
        setImageSettingsState(JSON.parse(savedImageSettings));
      }

      if (savedBulkSettings) {
        setBulkSettingsState(JSON.parse(savedBulkSettings));
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save discord config to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("discordConfig", JSON.stringify(discordConfig));
      } catch (error) {
        console.error("Failed to save discord config to localStorage:", error);
      }
    }
  }, [discordConfig, isLoaded]);

  // Save image settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("imageSettings", JSON.stringify(imageSettings));
      } catch (error) {
        console.error("Failed to save image settings to localStorage:", error);
      }
    }
  }, [imageSettings, isLoaded]);

  // Save bulk settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("bulkSettings", JSON.stringify(bulkSettings));
      } catch (error) {
        console.error("Failed to save bulk settings to localStorage:", error);
      }
    }
  }, [bulkSettings, isLoaded]);

  const setDiscordConfig = (config: DiscordConfig) => {
    setDiscordConfigState(config);
  };

  const setImageSettings = (settings: ImageGenerationSettings) => {
    setImageSettingsState(settings);
  };

  const updateDiscordConfig = (updates: Partial<DiscordConfig>) => {
    setDiscordConfigState((prev) => ({ ...prev, ...updates }));
  };

  const updateImageSettings = (updates: Partial<ImageGenerationSettings>) => {
    setImageSettingsState((prev) => ({ ...prev, ...updates }));
  };

  const updateBulkSettings = (updates: Partial<BulkSettings>) => {
    setBulkSettingsState((prev) => ({ ...prev, ...updates }));
  };

  const resetImageSettings = () => {
    setImageSettingsState(defaultImageSettings);
  };

  const resetDiscordConfig = () => {
    setDiscordConfigState(defaultDiscordConfig);
  };

  const resetBulkSettings = () => {
    setBulkSettingsState(defaultBulkSettings);
  };

  const addImages = (newImages: GeneratedImage[]) => {
    setImages((prevImages) => [...newImages, ...prevImages]);
  };

  const removeImage = (image: GeneratedImage) => {
    setImages((prevImages) =>
      prevImages.filter(
        (img) => !(img.msgId === image.msgId && img.index === image.index)
      )
    );
  };

  const clearImages = () => {
    setImages([]);
  };

  const setUpscalingState = (imageKey: string, isUpscaling: boolean) => {
    setUpscaling((prev) => ({ ...prev, [imageKey]: isUpscaling }));
  };

  const updateImage = (image: GeneratedImage, newUrl: string) => {
    setImages((prevImages) =>
      prevImages.map((i) =>
        i.msgId === image.msgId ? { ...i, url: newUrl } : i
      )
    );
  };

  const value: SettingsContextType = {
    discordConfig,
    setDiscordConfig,
    updateDiscordConfig,
    imageSettings,
    setImageSettings,
    updateImageSettings,
    resetImageSettings,
    resetDiscordConfig,
    isDiscordSettingsOpen,
    setIsDiscordSettingsOpen,
    bulkSettings,
    updateBulkSettings,
    resetBulkSettings,
    images,
    upscaling,
    addImages,
    removeImage,
    clearImages,
    setUpscalingState,
    updateImage,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
