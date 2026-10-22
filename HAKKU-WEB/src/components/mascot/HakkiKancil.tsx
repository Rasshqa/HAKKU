"use client";

import React from "react";
import { HakkiDuoInteractive } from "./HakkiDuoInteractive";

export type HakkiMood = "welcoming" | "listening" | "analyzing" | "celebrating" | "empathetic" | "encouraging";

export interface HakkiKancilProps {
  mood?: HakkiMood;
  size?: "sm" | "md" | "lg";
  customMessage?: string;
  interactive?: boolean;
  className?: string;
  showSpeechBubble?: boolean;
  bubblePosition?: "top" | "right" | "left";
}

/**
 * HakkiKancil — 2D Cartoon Duolingo-style mascot for HAKKU.
 * Backed by pure SVG vector rendering (HakkiDuoInteractive) to prevent
 * any eye/PNG overlap artifacts while retaining interactive eye-tracking and animations.
 */
export function HakkiKancil({
  mood = "welcoming",
  size = "md",
  customMessage,
  className = "",
  showSpeechBubble = true,
}: HakkiKancilProps) {
  return (
    <HakkiDuoInteractive
      mood={mood}
      size={size}
      customMessage={customMessage}
      className={className}
      showSpeechBubble={showSpeechBubble}
    />
  );
}
