import React, { useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

const defaultIcon = {
  path: window.google?.maps?.SymbolPath?.CIRCLE,
  fillColor: '#0f766e',
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 2,
  scale: 10,
};

const MapComponent = ({ center, zoom, primaryMarker, markers = [], route }) => {
  const ref = useRef();
  const mapRef = useRef(null);
  const primaryMarkerRef = useRef(null);
  const markerPoolRef = useRef([]);
  const polylineRef = useRef(null);

  useEffect(() => {
    if (ref.current && !mapRef.current && window.google) {
      mapRef.current = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
    }
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current || !primaryMarker) return;
    if (!primaryMarkerRef.current) {
      primaryMarkerRef.current = new window.google.maps.Marker({
        map: mapRef.current,
        position: primaryMarker.position,
        title: primaryMarker.title,
        icon: {
          ...defaultIcon,
          fillColor: primaryMarker.color || '#0f766e',
        },
        label: primaryMarker.label,
        optimized: false,
      });
    } else {
      primaryMarkerRef.current.setPosition(primaryMarker.position);
      primaryMarkerRef.current.setTitle(primaryMarker.title);
    }
  }, [primaryMarker]);

  useEffect(() => {
    if (!mapRef.current) return;
    markerPoolRef.current.forEach(marker => marker.setMap(null));
    markerPoolRef.current = [];

    markers.forEach((marker) => {
      const markerInstance = new window.google.maps.Marker({
        position: marker.position,
        map: mapRef.current,
        title: marker.title,
        icon: {
          ...defaultIcon,
          fillColor: marker.color || '#2563eb',
        },
        label: marker.label,
      });
      markerPoolRef.current.push(markerInstance);
    });
  }, [markers]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (route?.length) {
      const path = route.map(point => ({ lat: point.lat, lng: point.lng }));
      if (!polylineRef.current) {
        polylineRef.current = new window.google.maps.Polyline({
          map: mapRef.current,
          path,
          strokeColor: '#0f766e',
          strokeOpacity: 0.8,
          strokeWeight: 5,
          clickable: false,
        });
      } else {
        polylineRef.current.setPath(path);
      }
    } else if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
  }, [route]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.panTo(center);
  }, [center]);

  return <div ref={ref} style={{ height: '500px', width: '100%', borderRadius: '32px', overflow: 'hidden' }} />;
};

const Map = ({ apiKey, center, zoom, primaryMarker, markers, route }) => {
  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return <div className="flex items-center justify-center h-full text-gray-700">Loading map...</div>;
      case Status.FAILURE:
        return <div className="flex items-center justify-center h-full text-red-500">Error loading map</div>;
      case Status.SUCCESS:
        return <MapComponent center={center} zoom={zoom} primaryMarker={primaryMarker} markers={markers} route={route} />;
      default:
        return null;
    }
  };

  return <Wrapper apiKey={apiKey} render={render} />;
};

export default Map;
