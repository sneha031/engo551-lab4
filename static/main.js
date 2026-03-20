document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("status");
  const startEl = document.getElementById("startDate");
  const endEl = document.getElementById("endDate");
  const btn = document.getElementById("searchBtn");

  const setStatus = (msg) => {
    statusEl.textContent = msg || "";
  };

  const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  });

  const map = L.map("map", {
    center: [51.0447, -114.0719],
    zoom: 11,
    layers: [osm]
  });

  let trafficStyle = null;

  if (MAPBOX_TOKEN && MAPBOX_STYLE) {
    trafficStyle = L.mapboxGL({
      accessToken: MAPBOX_TOKEN,
      style: MAPBOX_STYLE,
      interactive: false
    });
  }

  const cluster = L.markerClusterGroup();
  cluster.addTo(map);

  const icon = L.divIcon({
    className: "permit-marker",
    html: '<div class="permit-dot"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  let oms = null;

  const resetOMS = () => {
    if (typeof OverlappingMarkerSpiderfier === "function") {
      oms = new OverlappingMarkerSpiderfier(map, {
        keepSpiderfied: true,
        nearbyDistance: 20
      });
    } else {
      oms = null;
    }
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
      onEachFeature: (feature, marker) => {
        marker.bindPopup(popupHtml(feature.properties || {}));
        if (oms) {
          oms.addMarker(marker);
        }
      }
    });

    cluster.addLayer(layer);

    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  };

  const baseMaps = {
    "OpenStreetMap": osm
  };

  if (trafficStyle) {
    baseMaps["Traffic Incidents (Mapbox Style)"] = trafficStyle;
  }

  const overlays = {
    "Building Permits": cluster
  };

  L.control.layers(baseMaps, overlays, { collapsed: false }).addTo(map);

  if (!trafficStyle) {
    setStatus("Ready. Add MAPBOX_TOKEN and MAPBOX_STYLE env vars to enable the traffic incidents layer.");
  } else {
    setStatus("Ready.");
  }

  btn.addEventListener("click", async () => {
    const start = startEl.value;
    const end = endEl.value;

    if (!start || !end) {
      setStatus("Pick both dates.");
      return;
    }

    if (start > end) {
      setStatus("Start must be before end.");
      return;
    }

    setStatus("Searching...");

    try {
      const res = await fetch(`/api/permits?start=${start}&end=${end}`, {
        cache: "no-store"
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Search failed.");
        return;
      }

      setStatus(`Found ${data.features?.length || 0} permits.`);
      plot(data);

      if (!map.hasLayer(cluster)) {
        map.addLayer(cluster);
      }
    } catch (error) {
      setStatus("Request failed.");
      console.error(error);
    }
  });
});