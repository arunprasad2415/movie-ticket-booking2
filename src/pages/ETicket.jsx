import React, { useContext } from "react";
import { TicketContext } from "../context/TicketContext";
import "../styles/ETicket.css";

const ETicket = () => {
  const { ticketRecipt } = useContext(TicketContext);

  return (
    <div className="eticket-container">
      <h1>E-Ticket</h1>
      <div className="ticket-card">
        <h2>{ticketRecipt.movie.title}</h2>
        <p><strong>Theatre:</strong> {ticketRecipt.movie.theatreName}</p>
        <p><strong>Showtime:</strong> {new Date(ticketRecipt.movie.showtime).toLocaleString()}</p>
        <p><strong>Seats:</strong> {ticketRecipt.seats.join(", ")}</p>
        <p><strong>Total Paid:</strong> ₹{ticketRecipt.totalPrice}</p>
      </div>
    </div>
  );
};

export default ETicket;
