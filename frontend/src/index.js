import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// import "./index.css";
import Loading from "./components/SpecialComponents/Loading";

const Root = () => {
  const [isReady, setIsReady] = useState(false);
  const [isBatterySavingOn, setIsBatterySavingOn] = useState(true); // New state

  if (!isReady) {
    return (
      <Loading
        isBatterySavingOn={isBatterySavingOn}
        setIsBatterySavingOn={setIsBatterySavingOn}
        onComplete={() => setIsReady(true)}
      />
    );
  }

  return (
    <App
      isBatterySavingOn={isBatterySavingOn}
      setIsBatterySavingOn={setIsBatterySavingOn}
    />
  );
};

// Strict Mode for testing purposes during development
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
