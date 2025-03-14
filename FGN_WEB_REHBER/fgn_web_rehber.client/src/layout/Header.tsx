import { AppBar, Box, Button, Menu, MenuItem, Stack, Toolbar, Typography } from "@mui/material";
import { Link, NavLink } from "react-router";
import { useState } from "react";
import { KeyboardArrowDown } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { logout } from "../redux/AccountSlice";

const authLinks = [
    {
        title: "Talep Oluştur", to: "/"
    },
]

const navStyles = {
    color: "inherit",
    textDecoration: "none",
    whiteSpace: "nowrap",
    "&:hover": {
        color: "#A35632"
    },
}

function Header() {
    const fgnLogo = "/fergani-light-logo.png";
    const { user } = useAppSelector(state => state.account);
    const dispatch = useAppDispatch();

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    function handleMenuClick(event: React.MouseEvent<HTMLButtonElement>) {
        setAnchorEl(event.currentTarget);
    }

    function handleClose() {
        setAnchorEl(null);
    }

    if (user === undefined) return null; // Sayfa tamamen kırılmasını önler
    return (
        <AppBar position="static" sx={{ mb: 4, background: "#000000" }}>

            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }} >
                <Box sx={{ display: "flex", alignItems: "center" }} >

                    <img
                        src={fgnLogo}
                        alt="logo"
                        className="me-2"
                        style={{ width: "150px", height: "50px", objectFit: "contain" }}
                    />
                    {/* Header Title */}
                    <Typography variant="h6" sx={{ mr: 2, cursor: "pointer", textDecoration: "none", color: "inherit" }} component={NavLink} to="/" >
                        Fergani Rehber
                    </Typography>

                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    {user && (
                        <>
                            <Button id="user-button" onClick={handleMenuClick} endIcon={<KeyboardArrowDown />} sx={navStyles}>{user.name}</Button>
                            <Menu
                                id="user-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                                <MenuItem component={Link} to="/admin" onClick={() => handleClose()}>Talepler</MenuItem>
                                <MenuItem onClick={() => {
                                    dispatch(logout());
                                    handleClose();
                                }}>Çıkış yap</MenuItem>
                            </Menu>
                        </>

                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;