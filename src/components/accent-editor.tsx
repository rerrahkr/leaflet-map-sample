"use client";

import type React from "react";
import type { MoraPitch } from "@/lib/mora";
import { cn } from "@/lib/utils";

type AccentEditorProps = {
  moras: string[];
  pitches: MoraPitch[];
  onPitchChange: (index: number, pitch: MoraPitch) => void;
};

export function AccentEditor({
  moras,
  pitches,
  onPitchChange,
}: AccentEditorProps): React.JSX.Element {
  function togglePitch(index: number) {
    const newPitch: MoraPitch = pitches[index] === "H" ? "L" : "H";
    onPitchChange(index, newPitch);
  }

  if (moras.length === 0) {
    return (
      <div className="text-muted-foreground text-sm py-4 text-center">
        読みを入力するとアクセントを設定できます
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-muted-foreground mb-1">
        各モーラをクリックして高低を切り替えてください
      </div>
      <div className="flex flex-wrap gap-1">
        {moras.map((mora, index) => {
          const pitch = pitches[index] || "L";
          const isHigh = pitch === "H";
          const nextPitch =
            index < moras.length - 1 ? pitches[index + 1] : undefined;

          return (
            <button
              key={`${moras.slice(0, index + 1).join("")}`}
              type="button"
              onClick={() => togglePitch(index)}
              className={cn(
                "relative flex flex-col items-center justify-center min-w-10",
                "h-16 px-2 rounded-md transition-all duration-200",
                "border-2 cursor-pointer select-none",
                isHigh
                  ? "bg-pitch-high-bg border-pitch-high text-pitch-high"
                  : "bg-pitch-low-bg border-pitch-low text-pitch-low",
                "hover:scale-105 active:scale-95"
              )}
            >
              {/* High / Low label */}
              <span
                className={cn(
                  "text-[10px] font-bold",
                  isHigh ? "mb-auto mt-1" : "mt-auto mb-1"
                )}
              >
                {isHigh ? "高" : "低"}
              </span>

              {/* Mora text */}
              <span className="text-lg font-medium absolute top-1/2 -translate-y-1/2">
                {mora}
              </span>

              {/* Pitch connection line */}
              {index < moras.length - 1 && (
                <div
                  className={cn(
                    "absolute right-0 translate-x-1/2 w-2 h-0.5 z-10",
                    // H-H
                    isHigh && nextPitch === "H" && "top-3 bg-pitch-high",
                    // H-L
                    isHigh &&
                      nextPitch === "L" &&
                      "top-1/2 bg-gradient-to-r from-pitch-high to-pitch-low rotate-45 origin-left",
                    // L-L
                    !isHigh && nextPitch === "L" && "bottom-3 bg-pitch-low",
                    // L-H
                    !isHigh &&
                      nextPitch === "H" &&
                      "top-1/2 bg-gradient-to-r from-pitch-low to-pitch-high -rotate-45 origin-left"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
