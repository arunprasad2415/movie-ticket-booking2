import React from "react";

const ROWS = 10;
const COLS = 5;
const AISLE_AFTER = 2;

const SeatGrid = ({ owners, highlight = [], onSeatClick }) => (
  <div className="seat-grid">
    <div className="seat-grid-screen">Screen</div>
    {[...Array(ROWS)].map((_, r) => {
      const row = String.fromCharCode(65 + r);
      return (
        <div className="seat-grid-row" key={row} style={{ "--r": r }}>
          <span className="seat-grid-label">{row}</span>
          {[...Array(COLS)].map((__, c) => {
            const seat = `${row}-${c + 1}`;
            const owner = owners[seat];
            const lit = highlight.includes(seat);
            return (
              <React.Fragment key={seat}>
                {c === AISLE_AFTER && <span className="seat-grid-aisle" />}
                <button
                  type="button"
                  className={`grid-seat ${owner ? "sold" : ""} ${lit ? "lit" : ""}`}
                  title={owner ? `${seat} · ${owner.user?.name || "Deleted user"} · ${owner.ticketId}` : `${seat} · free`}
                  onClick={owner && onSeatClick ? () => onSeatClick(owner) : undefined}
                  disabled={!owner || !onSeatClick}
                >
                  {c + 1}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      );
    })}
    <div className="seat-grid-legend">
      <span><i className="grid-seat" /> Free</span>
      <span><i className="grid-seat sold" /> Sold</span>
      {highlight.length > 0 && <span><i className="grid-seat sold lit" /> This booking</span>}
    </div>
  </div>
);

export default SeatGrid;
