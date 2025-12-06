"use client";

import type * as Leaflet from "leaflet";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-contextmenu/dist/leaflet.contextmenu.min.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { createRoot } from "react-dom/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Complete type definitions not present in @types/leaflet-contextmenu
declare module "leaflet" {
  interface MapOptions {
    contextmenuWidth?: number | undefined;
  }
}

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

function MarkerPopup({
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

type MapComponentProps = {
  className?: string;
  style?: React.CSSProperties;
};

export function MapComponent({
  className,
  style,
}: MapComponentProps): React.JSX.Element {
  const mapRef = useRef<Leaflet.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isEditingRef = useRef<boolean>(false);

  useEffect(() => {
    if (mapRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0) {
        return;
      }

      mapRef.current?.invalidateSize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    (async () => {
      const L = await (async () => {
        // Dynamically import Leaflet and plugin
        const L = (await import("leaflet")).default;

        // Plugin uses the global L variable, so we need to set it on `window`
        // biome-ignore lint/suspicious/noExplicitAny: no need to strictly type window.L
        (window as any).L = L;

        await import("leaflet-contextmenu");

        return L;
      })();

      // Fix default icon paths
      L.Icon.Default.mergeOptions({
        iconUrl: icon,
        iconRetinaUrl: iconRetina,
        shadowUrl: iconShadow,
      });

      const container = containerRef.current;
      if (!container) return;

      const editableLayers = L.featureGroup();

      function handleAddMarker(ev: Leaflet.ContextMenuItemClickEvent) {
        if (isEditingRef.current) {
          console.log(
            "Could not create new marker because other marker is editing"
          );
          return;
        }

        const marker = L.marker(ev.latlng).addTo(editableLayers);

        const popupElement = document.createElement("div");
        const popupRoot = createRoot(popupElement);

        function handleSave(title: string, description: string) {
          console.log(`title ${title}, description: ${description}}`);

          isEditingRef.current = false;
        }

        function removeMarker() {
          marker.remove();

          isEditingRef.current = false;

          // Wait unmounting until the popup close animation is finished
          setTimeout(() => {
            popupRoot.unmount();
          }, 500);
        }

        popupRoot.render(
          <MarkerPopup onSave={handleSave} onCancel={removeMarker} />
        );

        marker.bindPopup(popupElement, {
          className: "marker-popup",
          closeButton: false,
        });

        marker.on("popupclose", () => {
          if (isEditingRef.current) {
            removeMarker();
          }
        });

        isEditingRef.current = true;
        marker.openPopup();
      }

      const map = L.map(container, {
        contextmenu: true,
        contextmenuWidth: 140,
        contextmenuItems: [
          {
            text: "Add Marker",
            callback: handleAddMarker,
          },
        ],
      }).setView([35.681236, 139.767125], 15);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      editableLayers.addTo(map);
    })();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;

      resizeObserver.disconnect();
      containerRef.current = null;
    };
  }, []);

  return (
    <div id="map" ref={containerRef} className={className} style={style}></div>
  );
}
