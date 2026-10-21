import React from "react";
import Icon from "../../components/Icon";

const Notice = ({ notice, onDismiss }) =>
  notice && (
    <div className={`staff-notice ${notice.type}`} key={notice.at} role={notice.type === "error" ? "alert" : "status"}>
      <Icon name={notice.type === "error" ? "alert" : "check"} />
      <span>{notice.text}</span>
      <button onClick={onDismiss} aria-label="Dismiss">✕</button>
    </div>
  );

export default Notice;
