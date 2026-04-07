"use client";

import type { Pitch } from "@/lib/mora";
import { cn } from "@/lib/utils";

interface AccentEditorProps {
  moras: string[];
  pitches: Pitch[];
  onPitchChange: (index: number, pitch: Pitch) => void;
}

export function AccentEditor({
  moras,
  pitches,
  onPitchChange,
}: AccentEditorProps) {
  const togglePitch = (index: number) => {
    const newPitch: Pitch = pitches[index] === "H" ? "L" : "H";
    onPitchChange(index, newPitch);
  };

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
          const prevPitch = index > 0 ? pitches[index - 1] : null;
          const nextPitch =
            index < moras.length - 1 ? pitches[index + 1] : null;

          return (
            <button
              key={index}
              type="button"
              onClick={() => togglePitch(index)}
              className={cn(
                "relative flex flex-col items-center justify-center min-w-10 h-16 px-2 rounded-md transition-all duration-200",
                "border-2 cursor-pointer select-none",
                isHigh
                  ? "bg-pitch-high-bg border-pitch-high text-pitch-high"
                  : "bg-pitch-low-bg border-pitch-low text-pitch-low",
                "hover:scale-105 active:scale-95"
              )}
            >
              {/* 高低ラベル */}
              <span
                className={cn(
                  "text-[10px] font-bold",
                  isHigh ? "mb-auto mt-1" : "mt-auto mb-1"
                )}
              >
                {isHigh ? "高" : "低"}
              </span>

              {/* モーラテキスト */}
              <span className="text-lg font-medium absolute top-1/2 -translate-y-1/2">
                {mora}
              </span>

              {/* 接続線 */}
              {index < moras.length - 1 && (
                <div
                  className={cn(
                    "absolute right-0 translate-x-1/2 w-2 h-0.5 z-10",
                    // 現在と次のピッチに基づいて線の位置を決定
                    isHigh && nextPitch === "H" && "top-3 bg-pitch-high",
                    isHigh &&
                      nextPitch === "L" &&
                      "top-1/2 bg-gradient-to-r from-pitch-high to-pitch-low rotate-45 origin-left",
                    !isHigh && nextPitch === "L" && "bottom-3 bg-pitch-low",
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
