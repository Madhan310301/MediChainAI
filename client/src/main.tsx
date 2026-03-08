import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { LanguageProvider } from "@/hooks/use-language";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId="449852823180-7a0pnu8a1jsfe8lue0gr09pesht4ah56.apps.googleusercontent.com">
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);