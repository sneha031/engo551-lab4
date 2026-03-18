document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("status");
  const startEl = document.getElementById("startDate");
  const endEl = document.getElementById("endDate");
  const btn = document.getElementById("searchBtn");

  const setStatus = (msg) => (statusEl.textContent = msg || "");

  const map = L.map("map").setView([51.0447, -114.0719], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const cluster = L.markerClusterGroup().addTo(map);

  const icon = L.divIcon({
    className: "permit-marker",
    html: '<div class="permit-dot"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  let oms = null;
  const resetOMS = () => {
    oms = typeof OverlappingMarkerSpiderfier === "function"
      ? new OverlappingMarkerSpiderfier(map, { keepSpiderfied: true, nearbyDistance: 20 })
      : null;
  };

  const popupHtml = (p) => `
    <div>
      <b>Issued Date:</b> ${p.issueddate ?? "N/A"}<br>
      <b>Work Class Group:</b> ${p.workclassgroup ?? "N/A"}<br>
      <b>Contractor Name:</b> ${p.contractorname ?? "N/A"}<br>
      <b>Community Name:</b> ${p.communityname ?? "N/A"}<br>
      <b>Original Address:</b> ${(p.originaladdress ?? p.locationaddresses) ?? "N/A"}
    </div>
  `;

  const plot = (geojson) => {
    cluster.clearLayers();
    resetOMS();

    const layer = L.geoJSON(geojson, {
      pointToLayer: (_, latlng) => L.marker(latlng, { icon }),
      onEachFeature: (f, m) => {
        m.bindPopup(popupHtml(f.properties || {}));
        if (oms) oms.addMarker(m);
      },
    });

    cluster.addLayer(layer);

    const b = layer.getBounds();
    if (b.isValid()) map.fitBounds(b, { padding: [30, 30] });
  };

  btn.addEventListener("click", async () => {
    const start = startEl.value;
    const end = endEl.value;

    if (!start || !end) return setStatus("Pick both dates.");
    if (start > end) return setStatus("Start must be before end.");

    setStatus("Searching...");

    try {
      const res = await fetch(`/api/permits?start=${start}&end=${end}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) return setStatus(data.error || "Search failed.");
      setStatus(`Found ${data.features?.length || 0} permits.`);
      plot(data);
    } catch {
      setStatus("Request failed.");
    }
  });

  setStatus("Ready.");
});