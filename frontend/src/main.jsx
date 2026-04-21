import React from "react";
import ReactDOM from "react-dom/client";//import ReactDOM to render the app in the DOM
import App from "./App";
import "./index.css"; 
import AuthContext from "./context/authContext"; // path to your context
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthContext>
    <App />
  </AuthContext>
);
