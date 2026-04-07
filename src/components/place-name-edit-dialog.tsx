"use client";

import { InfoIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AccentEditor } from "@/components/accent-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isHiraganaOnly, type Pitch, splitToMora } from "@/lib/mora";

interface PlaceNameEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: {
    spelling: string;
    reading: string;
    moras: string[];
    pitches: Pitch[];
  }) => void;
  existingEntry?: {
    spelling: string;
    reading: string;
  } | null;
}

export function PlaceNameEditDialog({
  open,
  onOpenChange,
  onSubmit,
  existingEntry,
}: PlaceNameEditDialogProps) {
  const [spelling, setSpelling] = useState("");
  const [reading, setReading] = useState("");
  const [moras, setMoras] = useState<string[]>([]);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [readingError, setReadingError] = useState<string | null>(null);

  // 読みが変更されたらモーラを再計算
  useEffect(() => {
    if (reading) {
      if (!isHiraganaOnly(reading)) {
        setReadingError("ひらがなのみで入力してください");
        setMoras([]);
        setPitches([]);
        return;
      }
      setReadingError(null);
      const newMoras = splitToMora(reading.trim());
      setMoras(newMoras);
      // 既存のピッチ配列を新しいモーラ数に合わせて調整
      setPitches((prev) => {
        const newPitches = [...prev];
        while (newPitches.length < newMoras.length) {
          newPitches.push("L");
        }
        return newPitches.slice(0, newMoras.length);
      });
    } else {
      setMoras([]);
      setPitches([]);
      setReadingError(null);
    }
  }, [reading]);

  const handlePitchChange = useCallback((index: number, pitch: Pitch) => {
    setPitches((prev) => {
      const newPitches = [...prev];
      newPitches[index] = pitch;
      return newPitches;
    });
  }, []);

  const handleSubmit = () => {
    if (!spelling.trim() || !reading.trim() || readingError) {
      return;
    }

    onSubmit?.({
      spelling: spelling.trim(),
      reading: reading.trim(),
      moras,
      pitches,
    });

    // フォームをリセット
    setSpelling("");
    setReading("");
    setMoras([]);
    setPitches([]);
    onOpenChange(false);
  };

  const isValid =
    spelling.trim() && reading.trim() && !readingError && moras.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>地名の発音を登録</DialogTitle>
          <DialogDescription>
            地名の綴りと読み、アクセントを設定してください
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* 地名の綴り */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="spelling">地名の綴り</Label>
            <Input
              id="spelling"
              placeholder="例: 新橋、東京"
              value={spelling}
              onChange={(e) => setSpelling(e.target.value)}
            />
          </div>

          {/* 地名の読み */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="reading">
              読み{" "}
              <span className="text-muted-foreground text-xs">
                （ひらがなのみ）
              </span>
            </Label>
            <Input
              id="reading"
              placeholder="例: しんばし、とうきょう"
              value={reading}
              onChange={(e) => setReading(e.target.value)}
              aria-invalid={!!readingError}
            />
            {readingError && (
              <p className="text-destructive text-xs">{readingError}</p>
            )}
          </div>

          {/* アクセント編集 */}
          <div className="flex flex-col gap-2">
            <Label>アクセント</Label>
            <div className="p-3 rounded-lg bg-secondary/50 border">
              <AccentEditor
                moras={moras}
                pitches={pitches}
                onPitchChange={handlePitchChange}
              />
            </div>
          </div>

          {/* 既存エントリーの通知 */}
          {existingEntry && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <InfoIcon className="size-4 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-primary">類似の登録があります</p>
                <p className="text-muted-foreground">
                  {existingEntry.spelling}（{existingEntry.reading}）
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            登録
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
