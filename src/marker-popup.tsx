import type React from "react";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-contextmenu/dist/leaflet.contextmenu.min.css";
import type * as Leaflet from "leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import "leaflet/dist/leaflet.css";
import "leaflet-contextmenu/dist/leaflet.contextmenu.min.css";
import { createRoot } from "react-dom/client";
import { GoReport } from "react-icons/go";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import { cn } from "./lib/utils";
import { useMapStore } from "./stores";

const DELETE_REASONS = [
  "inappropriate",
  "spam",
  "duplicate",
  "incorrect",
] as const;

type DeleteReason = (typeof DELETE_REASONS)[number];

const DELETE_REASON_TEXT: Readonly<Record<DeleteReason, string>> = {
  inappropriate: "不適切な内容",
  spam: "スパム",
  duplicate: "重複",
  incorrect: "誤った情報",
};

type MarkerPopupFixedContentProps = {
  title: string;
  description: string;
};

function MarkerPopupFixedContent({
  title,
  description,
}: MarkerPopupFixedContentProps): React.JSX.Element {
  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
  const [deleteReason, setSelectedReason] = useState<DeleteReason | undefined>(
    undefined
  );

  function handleSubmit() {
    if (deleteReason === undefined) {
      return;
    }

    console.log(`Accept deletion request "${title}": ${deleteReason}`);

    toast.success(`「${title}」の削除依頼を受け付けました`, {
      description: `削除理由: ${DELETE_REASON_TEXT[deleteReason]}`,
    });
    setDialogIsOpen(false);
    setSelectedReason(undefined);
  }

  function handleCancel() {
    setDialogIsOpen(false);
    setSelectedReason(undefined);
  }

  return (
    <>
      <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
        <DialogContent className="z-[2000]">
          <DialogHeader>
            <DialogTitle>削除を依頼</DialogTitle>
            <DialogDescription>
              削除を依頼する理由を選択してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {DELETE_REASONS.map((reason) => (
              <label
                key={reason}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={deleteReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{DELETE_REASON_TEXT[reason]}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              キャンセル
            </Button>
            <Button onClick={handleSubmit} disabled={!deleteReason}>
              送信
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="my-0 text-sm text-gray-600">{description}</p>
      <button
        type="button"
        onClick={() => setDialogIsOpen(true)}
        className={cn(
          "mt-2 flex items-center gap-1 cursor-pointer",
          "text-gray-500 hover:text-red-400 transition-colors duration-300"
        )}
      >
        <GoReport />
        <span className="text-xs">削除を依頼する</span>
      </button>
    </>
  );
}

type MarkerPopupEditingContentProps = {
  defaultTitle?: string | undefined;
  defaultDescription?: string | undefined;
  onSave: (title: string, description: string) => void;
  onCancel: () => void;
};

function MarkerPopupEditingContent({
  defaultTitle,
  defaultDescription,
  onSave,
  onCancel,
}: MarkerPopupEditingContentProps): React.JSX.Element {
  const [title, setTitle] = useState<string>(defaultTitle ?? "");
  const [description, setDescription] = useState<string>(
    defaultDescription ?? ""
  );

  const canSave = (() => {
    const titleIsValid = title.trim().length > 0;

    return titleIsValid;
  })();

  return (
    <>
      <Input
        type="text"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="説明を入力"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
      />
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>
          キャンセル
        </Button>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSave(title, description);
          }}
          disabled={!canSave}
        >
          保存
        </Button>
      </div>
    </>
  );
}

type MarkerPopupProps = {
  defaultTitle?: string | undefined;
  defaultDescription?: string | undefined;
  onSave: (title: string, description: string) => void;
  onCancel: () => void;
};

export function MarkerPopup({
  defaultTitle,
  defaultDescription,
  onSave,
  onCancel,
}: MarkerPopupProps): React.JSX.Element {
  const [title, setTitle] = useState<string>(defaultTitle ?? "");
  const [description, setDescription] = useState<string>(
    defaultDescription ?? ""
  );

  const [hasSaved, setHasSaved] = useState<boolean>(false);

  return (
    <div className="w-full max-w-xs py-0 space-y-2">
      {hasSaved ? (
        <MarkerPopupFixedContent title={title} description={description} />
      ) : (
        <MarkerPopupEditingContent
          onSave={(newTitle, newDescription) => {
            setTitle(newTitle);
            setDescription(newDescription);
            setHasSaved(true);
            onSave(newTitle, newDescription);
          }}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}

export function mountMarkerPopup(
  marker: Leaflet.Marker,
  onSave: (title: string, description: string) => void
) {
  const popupElement = document.createElement("div");
  const popupRoot = createRoot(popupElement);

  function removeMarker() {
    marker.remove();

    useMapStore.getState().finishEditing();

    // Wait unmounting until the popup close animation is finished
    setTimeout(() => {
      popupRoot.unmount();
    }, 500);
  }

  popupRoot.render(
    <MarkerPopup
      onSave={(title, description) => {
        useMapStore.getState().finishEditing();
        onSave(title, description);
      }}
      onCancel={removeMarker}
    />
  );

  marker.bindPopup(popupElement, {
    className: "marker-popup",
    closeButton: false,
  });

  marker.on("popupclose", () => {
    if (useMapStore.getState().isEditing) {
      removeMarker();
    }
  });

  useMapStore.getState().startEditing();

  marker.openPopup();
}
