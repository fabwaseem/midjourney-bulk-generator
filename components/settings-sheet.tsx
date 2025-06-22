"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { RotateCcw } from "lucide-react";

interface SettingsSheetProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  onReset: () => void;
  resetButtonText: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SettingsSheet({
  trigger,
  title,
  description,
  children,
  onReset,
  resetButtonText,
  open,
  onOpenChange,
}: SettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="flex flex-col p-0">
        <SheetHeader className="p-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 p-1">
          <div className="space-y-6 px-4">{children}</div>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button
            variant="outline"
            onClick={onReset}
            className="w-full flex items-center gap-2"
            type="button"
          >
            <RotateCcw className="h-3 w-3" />
            {resetButtonText}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
