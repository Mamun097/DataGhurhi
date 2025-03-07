import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import Navigate from "./navigate"; // Import the route declarations

function App() {
  return (
    <Router>
      <Navigate />
    </Router>
  );
}

export default App;
