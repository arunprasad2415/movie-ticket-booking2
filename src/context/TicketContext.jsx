import { createContext, useState, useEffect } from "react";

export const TicketContext = createContext();

function TicketProvider({ children }) {
  const [ticketRecipt, setTicketRecipt] = useState([]); // default empty array

  useEffect(() => {
    console.log("ticketRecipt updated:", ticketRecipt);
  }, [ticketRecipt]);

  return (
    <TicketContext.Provider value={{ ticketRecipt, setTicketRecipt }}>
      {children}
    </TicketContext.Provider>
  );
}

export default TicketProvider;
