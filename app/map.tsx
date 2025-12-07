"use client";

import type * as Leaflet from "leaflet";
import type React from "react";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-contextmenu/dist/leaflet.contextmenu.min.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { createRoot } from "react-dom/client";
import { MarkerPopup } from "./marker-popup";
import { useMapStore } from "./stores";

// Complete type definitions not present in @types/leaflet-contextmenu
declare module "leaflet" {
  interface MapOptions {
    contextmenuWidth?: number | undefined;
  }
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

      function addMarker(ev: Leaflet.ContextMenuItemClickEvent) {
        if (useMapStore.getState().isEditing) {
          console.log(
            "Could not create new marker because other marker is editing"
          );
          return;
        }

        const marker = L.marker(ev.latlng).addTo(editableLayers);

        function handleSave(title: string, description: string) {
          console.log(`title ${title}, description: ${description}}`);

          useMapStore.getState().finishEditing();
        }

        mountMarkerPopup(marker, handleSave);
      }

      function mountMarkerPopup(
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
          <MarkerPopup onSave={onSave} onCancel={removeMarker} />
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

      const map = L.map(container, {
        contextmenu: true,
        contextmenuWidth: 140,
        contextmenuItems: [
          {
            text: "Add New Marker",
            callback: addMarker,
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
