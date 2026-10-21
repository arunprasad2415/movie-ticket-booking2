import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { TicketContext } from "../context/ticket";

const useBookMovie = () => {
  const { setTicketRecipt } = useContext(TicketContext);
  const navigate = useNavigate();

  return (movie) => {
    if (!localStorage.getItem("token")) {
      return navigate("/login", { state: { from: `/movie/${movie._id}` } });
    }
    setTicketRecipt(movie);
    navigate("/seat-selection", { state: { movie } });
  };
};

export default useBookMovie;
