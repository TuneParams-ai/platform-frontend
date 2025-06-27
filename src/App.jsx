import React from "react";
import Landing from "./pages/Landing";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./styles/root.css";

function App() {
  const user = {
    name: "Abhinay",
    role: "student",
    logout: () => console.log("Logging out..."),
  };

  return (
    <>
      <Navbar user={user} />
      <Landing />
      <Footer />
    </>
  );
}

export default App;