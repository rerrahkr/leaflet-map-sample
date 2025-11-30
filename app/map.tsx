"use client";

import type * as Leaflet from "leaflet";
import type React from "react";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

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
        // Dynamically import Leaflet and Leaflet.Draw
        const L = (await import("leaflet")).default;

        // Draw uses the global L variable, so we need to set it on `window`
        // biome-ignore lint/suspicious/noExplicitAny: no need to strictly type window.L
        (window as any).L = L;

        await import("leaflet-draw");

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

      const map = L.map(container).setView([35.681236, 139.767125], 15);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const editableLayers = L.featureGroup();
      editableLayers.addTo(map);

      const drawControl = new L.Control.Draw({
        position: "topleft",
        draw: {
          polyline: false,
          polygon: false,
          circle: false,
          rectangle: false,
          marker: {
            icon: new L.Icon.Default(),
          },
          circlemarker: false,
        },
        edit: {
          featureGroup: editableLayers,
          remove: true,
        },
      });
      map.addControl(drawControl);

      map.on(L.Draw.Event.CREATED, (ev: Leaflet.LeafletEvent) => {
        const drawEvent = ev as Leaflet.DrawEvents.Created;

        if (drawEvent.layerType === "marker") {
          drawEvent.layer.bindPopup("New marker");
        }

        editableLayers.addLayer(drawEvent.layer);
      });

      const marker = L.marker([35.681236, 139.767125]);
      marker.bindPopup("Tokyo Station");
      marker.addTo(editableLayers);
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
