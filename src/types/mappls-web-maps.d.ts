/**
 * Ambient type declarations for `mappls-web-maps` (v3.x).
 * The package ships no bundled TypeScript types, so we declare the subset
 * of the public API that WeatherGPT uses.
 */

declare module 'mappls-web-maps' {
  /** Options passed to `mappls.initialize()` */
  export interface MapplsLoadOptions {
    map?: boolean;
    layer?: 'raster' | 'vector';
    version?: string;
    libraries?: string[];
    plugins?: string[];
    auth?: string;
  }

  /** Properties for the Map constructor */
  export interface MapProperties {
    center?: [number, number];
    zoom?: number;
    zoomControl?: boolean;
    location?: boolean;
    [key: string]: unknown;
  }

  /** Mappls map instance */
  export interface MapplsMap {
    on(event: string, handler: () => void): void;
    setCenter(position: { lat: number; lng: number }): void;
    flyTo(options: { center: [number, number]; zoom?: number; speed?: number }): void;
    getZoom(): number;
    remove(): void;
    [key: string]: unknown;
  }

  /** Options for the Map factory */
  export interface MapplsMapOptions {
    id: string;
    properties?: MapProperties;
  }

  /** Popup options for markers */
  export interface MarkerPopupOptions {
    openPopup?: boolean;
    autoClose?: boolean;
    maxWidth?: number;
  }

  /** Options for creating a Marker */
  export interface MarkerOptions {
    map: MapplsMap;
    position: { lat: number; lng: number };
    icon?: string;
    width?: number;
    height?: number;
    popupHtml?: string;
    popupOptions?: MarkerPopupOptions;
    fitbounds?: boolean;
    offset?: [number, number];
  }

  /** Mappls marker instance */
  export interface MapplsMarker {
    setPosition(position: { lat: number; lng: number }): void;
    setPopup(html: string, options?: MarkerPopupOptions): void;
    remove(): void;
    addListener(event: string, handler: () => void): void;
    [key: string]: unknown;
  }

  /** The main mappls class */
  export class mappls {
    initialize(
      token: string,
      options: MapplsLoadOptions,
      callback: () => void
    ): void;

    Map(options: MapplsMapOptions): MapplsMap;

    Marker(options: MarkerOptions): MapplsMarker;
  }

  /** Plugins class (not used by WeatherGPT currently) */
  export class mappls_plugin {
    [key: string]: unknown;
  }
}
