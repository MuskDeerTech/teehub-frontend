
declare module "react-leaflet" {
  import * as React from "react";
  import { Map as LeafletMap } from "leaflet";

  export interface MapContainerProps {
    center?: [number, number];
    zoom?: number;
    whenCreated?: (map: LeafletMap) => void;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }

  export interface TileLayerProps {
    url: string;
    attribution?: string;
  }

  export interface MarkerProps {
    position: [number, number];
  }

  export const MapContainer: React.FC<MapContainerProps>;
  export const TileLayer: React.FC<TileLayerProps>;
  export const Marker: React.FC<MarkerProps>;

  // 🧩 useMapEvents generic type fix
  export function useMapEvents<T = unknown>(
    handlers: Record<string, (e: T) => void>
  ): void;
}
