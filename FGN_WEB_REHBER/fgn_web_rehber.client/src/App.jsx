import React from "react";
import Navbar from "./navbar/Navbar.jsx";
import "./App.css";

function App() {

    const handleTalepClick = () => {
        console.log("Talep Butonuna tıklandı");
    };

    const handleAdminClick = () => {
        console.log("Admin Butonuna tıklandı");
    };


    return (
        <div>
            <Navbar onTalepClick={handleTalepClick} onAdminClick={handleAdminClick} />
            <div className="container mt-5">
                <h1>Welcome to the Homepage</h1>
            </div>
        </div>
    );
}

export default App;
