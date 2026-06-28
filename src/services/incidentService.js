import api from "./api";

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

export const incidentApi = {
  // Ajoutez les paramètres à la fonction
  getNearby: (latitude, longitude, radius = 10000) => {
    const params = {};
    if (latitude && longitude) {
      Object.assign(params, { latitude, longitude, radius });
    }

    // Décommentez cette ligne et passez l'objet 'params'
    // Axios enverra ceci sous forme de query string : ?latitude=X&longitude=Y&radius=Z
    // return api.get("/alerts", { params });

    return api.get("/alerts");
  },

  getById: (id) => api.get(`/alerts/${id}`),

  getByUserId: (id) => api.get(`/alerts/user/${id}`),

  create: (payload) => {
    const formData = new FormData();

    formData.append("title", payload.title);
    formData.append("description", payload.description || payload.title);
    formData.append("type", payload.type ?? "OTHER");
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

    if (payload.photos?.length > 0) {
      payload.photos.forEach((dataUrl, i) => {
        const blob = dataUrlToBlob(dataUrl);
        formData.append("photos", blob, `photo-${i}.jpg`);
      });
    }

    // Pass FormData directly — axios skips Content-Type so the browser
    // sets the multipart boundary correctly, just like the old fetch version
    return api.post("/alerts", formData, {
      headers: { "Content-Type": "application/json" },
    });
  },
};
