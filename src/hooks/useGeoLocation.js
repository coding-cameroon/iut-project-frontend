import { useState, useEffect } from 'react';

export function useGeoLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // First try browser geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
              });
              setLoading(false);
            },
            async () => {
              // If browser geolocation fails, use ipinfo API
              await fetchFromIPInfo();
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
        } else {
          // No browser geolocation, use ipinfo API
          await fetchFromIPInfo();
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchFromIPInfo = async () => {
      try {
        const token = import.meta.env.VITE_IPINFO_TOKEN || 'bb201b21f9cf11';
        const response = await fetch(`https://api.ipinfo.io/lookup/me?token=${token}`);
        
        if (!response.ok) {
          throw new Error(`IPInfo API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.geo && data.geo.latitude && data.geo.longitude) {
          setLocation({
            lat: data.geo.latitude,
            lng: data.geo.longitude,
            city: data.geo.city,
            region: data.geo.region,
            country: data.geo.country
          });
        } else if (data.loc) {
          // Fallback to legacy format
          const [lat, lng] = data.loc.split(',').map(Number);
          setLocation({
            lat: lat,
            lng: lng,
            city: data.city,
            region: data.region,
            country: data.country
          });
        } else {
          setLocation({ lat: 48.8566, lng: 2.3522 }); // Paris
        }
        setLoading(false);
      } catch (err) {
        console.error('IP info error:', err);
        setLocation({ lat: 48.8566, lng: 2.3522 });
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return { location, loading, error };
}
