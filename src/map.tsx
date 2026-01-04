"use client";

import type * as Leaflet from "leaflet";
import type React from "react";
import { useEffect, useEffectEvent, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-contextmenu/dist/leaflet.contextmenu.min.css";
import { mountMarkerPopup } from "./marker-popup";
import { useMapStore } from "./stores";

// Complete type definitions not present in @types/leaflet-contextmenu
declare module "leaflet" {
  interface MapOptions {
    contextmenuWidth?: number | undefined;
  }
}

async function loadLeaflet(): Promise<typeof Leaflet> {
  // Dynamically import Leaflet and plugin
  const L = (await import("leaflet")).default;

  // Plugin uses the global L variable, so we need to set it on `window`
  // biome-ignore lint/suspicious/noExplicitAny: no need to strictly type window.L
  (window as any).L = L;

  await import("leaflet-contextmenu");

  return L;
}

function useMap() {
  const mapRef = useRef<Leaflet.Map | null>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const initializingRef = useRef(false);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0) {
        return;
      }

      mapRef.current?.invalidateSize();
    });

    if (mapElementRef.current) {
      resizeObserver.observe(mapElementRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleSave = useEffectEvent((title: string, description: string) => {
    console.log(`title ${title}, description: ${description}}`);
  });

  useEffect(() => {
    const container = mapElementRef.current;
    if (!container) return;

    if (mapRef.current || initializingRef.current) return;

    initializingRef.current = true;

    (async () => {
      const L = await loadLeaflet();

      if (!initializingRef.current || mapRef.current) {
        return;
      }

      const editableLayers = L.featureGroup();

      function addMarker(ev: Leaflet.ContextMenuItemClickEvent) {
        if (useMapStore.getState().isEditing) {
          console.log(
            "Could not create new marker because other marker is editing"
          );
          return;
        }

        const marker = L.marker(ev.latlng).addTo(editableLayers);
        mountMarkerPopup(marker, handleSave);
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
      initializingRef.current = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return { mapElementRef };
}

type MapComponentProps = {
  className?: string;
  style?: React.CSSProperties;
};

export function MapComponent({
  className,
  style,
}: MapComponentProps): React.JSX.Element {
  const { mapElementRef } = useMap();

  return (
    <div id="map" ref={mapElementRef} className={className} style={style}></div>
  );
}
