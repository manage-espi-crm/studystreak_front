import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";
import logger from "./helpers/logger";

// Report uncaught errors and unhandled promise rejections, except browser noise:
// "Script error." is the browser's message for errors in scripts from other domains (details hidden),
// e.g. Razorpay checkout, Google Tag Manager, YouTube player
const isBrowserNoise = (message) =>
  /^Script error\.?$/.test(String(message || ""));
window.addEventListener("error", (event) => {
  if (!isBrowserNoise(event.message)) logger.report(event.error || event.message);
});
window.addEventListener("unhandledrejection", (event) => logger.report(event.reason));

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
