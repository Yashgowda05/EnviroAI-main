import { useState } from "react";

function TripForm() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [tripDays, setTripDays] = useState(1);
  
  const [travelMode, setTravelMode] = useState("DRIVING");

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        marginBottom: "20px",
      }}
    >
      <h2>🌍 Plan Your Trip</h2>

      <input
        type="text"
        placeholder="📍 Source"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "15px",
        }}
      />

      <input
        type="text"
        placeholder="📌 Destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "15px",
        }}
      />

      <input
        type="date"
        value={travelDate}
        onChange={(e) => setTravelDate(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "15px",
        }}
      />

      <input
        type="number"
        placeholder="🗓 Number of Days"
        value={tripDays}
        onChange={(e) => setTripDays(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "15px",
        }}
      />

      

      <select
        value={travelMode}
        onChange={(e) => setTravelMode(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
        }}
      >
        <option value="DRIVING">🚗 Car</option>
        <option value="TWO_WHEELER">🏍 Bike</option>
        <option value="TRANSIT">🚌 Bus / Train</option>
        <option value="WALKING">🚶 Walking</option>
      </select>
    </div>
  );
}

export default TripForm;