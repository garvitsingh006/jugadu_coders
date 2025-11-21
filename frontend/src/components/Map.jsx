import { useEffect, useRef } from 'react';

export default function Map({ center, markers = [], zoom = 12 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // This is a placeholder for map implementation
    // You would integrate Mapbox or Google Maps here
    console.log('Map center:', center);
    console.log('Map markers:', markers);
  }, [center, markers]);

  return (
    <div ref={mapRef} className="w-full h-96 bg-gray-200 rounded-lg">
      <div className="flex items-center justify-center h-full text-gray-500">
        Map View (Integrate Mapbox/Google Maps)
      </div>
    </div>
  );
}
