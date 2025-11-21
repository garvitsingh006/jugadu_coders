import { useState, useEffect } from 'react';
import { api } from '../api/api';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      // Try browser geolocation first
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setLoading(false);
          },
          async (err) => {
            // Fallback to IP-based geolocation
            await getIPLocation();
          }
        );
      } else {
        await getIPLocation();
      }
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const getIPLocation = async () => {
    try {
      const response = await api.get('/geo/ip');
      setLocation({
        lat: response.data.location.lat,
        lng: response.data.location.lng
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { location, loading, error };
};
