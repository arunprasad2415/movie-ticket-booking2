import { useState } from "react";
import { TicketContext } from "./ticket";

function TicketProvider({ children }) {
  const [ticketRecipt, setTicketRecipt] = useState([]);

  return (
    <TicketContext.Provider value={{ ticketRecipt, setTicketRecipt }}>
      {children}
    </TicketContext.Provider>
  );
}

export default TicketProvider;
