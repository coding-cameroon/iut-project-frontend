import { useState, useEffect } from "react";

const FALLBACK = { lat: 4.0511, lng: 9.7679 }; // Douala, not Paris

async function fetchFromIPInfo() {
  const token = import.meta.env.VITE_IPINFO_TOKEN || "bb201b21f9cf11";
  const res = await fetch(`https://api.ipinfo.io/lookup/me?token=${token}`);
  if (!res.ok) throw new Error(`IPInfo error: ${res.status}`);
  const data = await res.json();

  if (data.geo?.latitude && data.geo?.longitude) {
    return {
      lat: data.geo.latitude,
      lng: data.geo.longitude,
      city: data.geo.city,
      region: data.geo.region,
      country: data.geo.country,
    };
  }
  if (data.loc) {
    const [lat, lng] = data.loc.split(",").map(Number);
    return {
      lat,
      lng,
      city: data.city,
      region: data.region,
      country: data.country,
    };
  }
  return FALLBACK;
}

export function useGeoLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const resolve = (loc) => {
      if (!cancelled) {
        setLocation(loc);
        setLoading(false);
      }
    };
    const reject = (msg) => {
      if (!cancelled) {
        setError(msg);
        setLocation(FALLBACK);
        setLoading(false);
      }
    };

    if (!navigator.geolocation) {
      fetchFromIPInfo()
        .then(resolve)
        .catch(() => resolve(FALLBACK));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      () =>
        fetchFromIPInfo()
          .then(resolve)
          .catch(() => resolve(FALLBACK)),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return { location, loading, error };
}
