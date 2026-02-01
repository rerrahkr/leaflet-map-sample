import * as Leaflet from "leaflet";
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

type MarkerData = {
  latLng: Leaflet.LatLng;
  title: string;
  description: string;
};

const markerDataList: MarkerData[] = [
  {
    latLng: Leaflet.latLng(35.681236, 139.767125),
    title: "東京駅",
    description: "JRと東京メトロの駅",
  },
  {
    latLng: Leaflet.latLng(35.689957, 139.700507),
    title: "新宿駅",
    description: "JR、小田急、京王、都営地下鉄の駅",
  },
];

function useMap() {
  const mapRef = useRef<Leaflet.Map | null>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);

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

  const handleSave = useEffectEvent(
    (latLng: Leaflet.LatLng, title: string, description: string) => {
      console.log(`title ${title}, description: ${description}}`);
      markerDataList.push({ latLng, title, description });
    }
  );

  useEffect(() => {
    const container = mapElementRef.current;
    if (!container || mapRef.current) {
      return;
    }

    (async () => {
      const L = await loadLeaflet();

      if (mapRef.current) {
        return;
      }

      // Initialize the map
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

      // Initialize marker layer
      const markerLayer = L.featureGroup();

      function addMarker(ev: Leaflet.ContextMenuItemClickEvent) {
        if (useMapStore.getState().isEditing) {
          console.log(
            "Could not create new marker because other marker is editing"
          );
          return;
        }

        const marker = L.marker(ev.latlng).addTo(markerLayer);
        mountMarkerPopup(marker, {
          onSave: (title, description) =>
            handleSave(ev.latlng, title, description),
        });
      }

      // Add existing markers
      for (const markerData of markerDataList) {
        const marker = L.marker(markerData.latLng).addTo(markerLayer);
        mountMarkerPopup(marker, {
          defaultTitle: markerData.title,
          defaultDescription: markerData.description,
        });
      }

      markerLayer.addTo(map);
    })();

    return () => {
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

  return <div ref={mapElementRef} className={className} style={style}></div>;
}
