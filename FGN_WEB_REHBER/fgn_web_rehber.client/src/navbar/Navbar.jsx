import React from "react";
import logo from "../assets/Fergani.jpg";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaClipboardList, FaUserShield } from "react-icons/fa";

const Navbar = ({ onTalepClick, onAdminClick}) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 w-100 fixed-top">
            <div className="container-fluid d-flex align-items-center justify-content-between">
                {/* Left: Logo & Title */}
                <a className="navbar-brand d-flex align-items-center" href="/">
                    <img
                        src={logo}
                        alt="logo"
                        className="me-2"
                        style={{ width: "150px", height: "50px", objectFit: "contain" }}
                    />
                    <span className="fs-5 text-white">Fergani Rehber</span>
                </a>

                {/* Center: Bigger Search Box */}
                <div className="flex-grow-1 mx-3">
                    <form className="d-flex justify-content-center">
                        <input
                            className="form-control w-50" 
                            type="search"
                            placeholder="İsim Telefon No Takım Birim Araması"
                            aria-label="Search"
                        />
                    </form>
                </div>

                {/* Right: Buttons */}
                <div className="d-flex">
                    <button className="btn btn-dark d-flex flex-column align-items-center mx-2"
                        onClick={onTalepClick} >
                        <FaClipboardList size={24} />
                        <span className="mt-1">Talep</span>
                    </button>
                    <button className="btn btn-dark d-flex flex-column align-items-center"
                        onClick={onAdminClick}>
                        <FaUserShield size={24} />
                        <span className="mt-1">Admin Panel</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
