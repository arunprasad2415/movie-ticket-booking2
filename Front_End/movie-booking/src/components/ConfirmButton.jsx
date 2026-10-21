import React, { useEffect, useState } from "react";

const ConfirmButton = ({ children, confirmLabel = "Confirm", onConfirm, disabled, title, className = "" }) => {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!armed || busy) return;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed, busy]);

  if (!armed) {
    return (
      <button type="button" className={`row-btn danger ${className}`} onClick={() => setArmed(true)} disabled={disabled} title={title}>
        {children}
      </button>
    );
  }

  const run = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      setArmed(false);
    }
  };

  return (
    <span className="confirm-pair">
      <button type="button" className="row-btn danger solid" onClick={run} disabled={busy}>
        {busy ? <span className="spinner small" /> : confirmLabel}
      </button>
      <button type="button" className="row-btn" onClick={() => setArmed(false)} disabled={busy}>
        Keep
      </button>
    </span>
  );
};

export default ConfirmButton;
