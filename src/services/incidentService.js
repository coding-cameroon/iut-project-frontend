import { API_BASE_URL } from "./api";

const severityToPriority = {
  1: "LOW",
  2: "MEDIUM",
  3: "HIGH",
  4: "CRITICAL",
};

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function authedFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.error || `HTTP error! status: ${response.status}`,
    );
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response.json();
}

export const incidentService = {
  async getNearbyIncidents(latitude, longitude, radius = 10000) {
    const params = new URLSearchParams();
    if (latitude && longitude) {
      params.set("latitude", latitude);
      params.set("longitude", longitude);
      params.set("radius", radius);
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    return authedFetch(`/alerts${query}`);
  },

  async createIncident(payload) {
    const formData = new FormData();

    formData.append("title", payload.title);
    formData.append("description", payload.description || payload.title);
    formData.append("type", payload.type ?? "OTHER"); // must match AlertType.name in DB
    formData.append(
      "priority",
      severityToPriority[payload.severity] ?? "MEDIUM",
    );
    formData.append("latitude", payload.location.lat);
    formData.append("longitude", payload.location.lng);

    if (payload.location.city) formData.append("city", payload.location.city);
    if (payload.location.region)
      formData.append("address", payload.location.region);
    if (payload.location.country)
      formData.append("country", payload.location.country);
    if (payload.isAnonymous !== undefined)
      formData.append("isAnonymous", String(payload.isAnonymous));

    // Convert DataURL photos to Blobs for multer
    if (payload.photos?.length > 0) {
      payload.photos.forEach((dataUrl, i) => {
        const blob = dataUrlToBlob(dataUrl);
        formData.append("photos", blob, `photo-${i}.jpg`);
      });
    }

    // Note: audio is not handled by the backend yet — skipping it

    const data = await authedFetch("/alerts", {
      method: "POST",
      // No Content-Type header — browser sets multipart/form-data boundary automatically
      body: formData,
    });

    console.log("✅ Alert created:", data.alert);
    return data.alert;
  },

  async getIncidentById(id) {
    return authedFetch(`/alerts/${id}`);
  },
};
