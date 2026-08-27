'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export type HeatPoint = {
  sectorId: string;
  codigo: string;
  nombre: string;
  lat: number;
  lng: number;
  peso: number;
  intensidad: number;
  ofertas: number;
  comuneros: number;
  postulantes: number;
};

function intensityColor(i: number) {
  if (i >= 0.75) return '#b91c1c';
  if (i >= 0.5) return '#ea580c';
  if (i >= 0.25) return '#ca8a04';
  if (i > 0) return '#2563eb';
  return '#94a3b8';
}

function Recenter({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [lat, lng, zoom, map]);
  return null;
}

export default function HeatmapMap({
  puntos,
  centro,
  zoom = 9,
}: {
  puntos: HeatPoint[];
  centro: { lat: number; lng: number };
  zoom?: number;
}) {
  const visible = useMemo(() => puntos.filter((p) => p.lat && p.lng), [puntos]);

  return (
    <div className="h-[520px] w-full rounded-xl overflow-hidden border border-slate-200">
      <MapContainer
        center={[centro.lat, centro.lng]}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter lat={centro.lat} lng={centro.lng} zoom={zoom} />
        {visible.map((p) => {
          const radius = p.peso > 0 ? 12 + p.intensidad * 28 : 8;
          return (
            <CircleMarker
              key={p.sectorId}
              center={[p.lat, p.lng]}
              radius={radius}
              pathOptions={{
                color: intensityColor(p.intensidad),
                fillColor: intensityColor(p.intensidad),
                fillOpacity: p.peso > 0 ? 0.55 : 0.2,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm space-y-1">
                  <p className="font-bold text-slate-900">{p.nombre}</p>
                  <p className="text-slate-600">Código: {p.codigo}</p>
                  <p>Ofertas: <strong>{p.ofertas}</strong></p>
                  <p>Comuneros: <strong>{p.comuneros}</strong></p>
                  <p>Postulantes: <strong>{p.postulantes}</strong></p>
                  <p>Intensidad: <strong>{Math.round(p.intensidad * 100)}%</strong></p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
