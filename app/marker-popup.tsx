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
import { useMapStore } from "./stores";

type MarkerPopupFixedContentProps = {
  title: string;
  description: string;
};

function MarkerPopupFixedContent({
  title,
  description,
}: MarkerPopupFixedContentProps): React.JSX.Element {
  return (
    <>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="my-0 text-sm text-gray-600">{description}</p>
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
