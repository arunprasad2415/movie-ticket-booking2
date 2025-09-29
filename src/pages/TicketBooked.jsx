import { useContext } from "react";
import { TicketContext } from "../context/TicketContext";
import { Navigate } from "react-router-dom";

function TicketBooked() {
  const { ticketRecipt } = useContext(TicketContext);

  if (!ticketRecipt) {
    return <Navigate to="/movies" replace />;
  }

  return (
    <div
      style={{
        marginTop: "100px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <div
        style={{
          border: "2px solid #ddd",
          borderRadius: "10px",
          padding: "20px 40px",
          backgroundColor: "#f9f9f9",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
          width: "400px",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "10px", color: "#333" }}>
          🎟 Ticket Confirmed
        </h2>
        <hr style={{ marginBottom: "15px" }} />

        <p>
          <strong>Movie:</strong> {ticketRecipt?.title}
        </p>
        <p>
          <strong>Duration:</strong> {ticketRecipt?.duration}
        </p>
        <p>
          <strong>Theatre:</strong> {ticketRecipt?.theatreName}
        </p>
        {ticketRecipt?.seats && (
          <p>
            <strong>Seats:</strong> {ticketRecipt.seats.join(", ")}
          </p>
        )}
        {ticketRecipt?.date && (
          <p>
            <strong>Date:</strong> {ticketRecipt.date}
          </p>
        )}
        {ticketRecipt?.time && (
          <p>
            <strong>Time:</strong> {ticketRecipt.time}
          </p>
        )}

        <hr style={{ margin: "15px 0" }} />
        <p style={{ fontWeight: "bold", color: "green" }}>
         Enjoy your movie!
        </p>
      </div>
    </div>
  );
}

export default TicketBooked;
