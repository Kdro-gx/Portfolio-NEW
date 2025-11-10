import React from "react";
import "../../styles/ButtonStyles.css"; // Assuming your button styles are here

const DevMode = ({ onClick }) => {
  return (
    <button className="btn-styled" onClick={onClick}>
      Developer Mode
    </button>
  );
};

export default DevMode;
