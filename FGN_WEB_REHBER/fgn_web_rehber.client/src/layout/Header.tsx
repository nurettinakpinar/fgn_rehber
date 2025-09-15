import {
    AppBar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Toolbar,
    Typography,
    FormControl,
    InputLabel,
    Select, Grid2,
    SelectChangeEvent
} from "@mui/material";
import { Link, NavLink } from "react-router";
import { useState } from "react";
import { KeyboardArrowDown, PersonAddOutlined } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { logout } from "../redux/AccountSlice";
import requests from "../api/requests";
import "react-international-phone/style.css";
import { PhoneInput } from "../features/customComponents/PhoneInput";

const authLinks = [{ title: "Talep Oluştur", to: "/" }];

const navStyles = {
    color: "inherit",
    textDecoration: "none",
    whiteSpace: "nowrap",
    "&:hover": {
        color: "#A35632",
    },
} as const;

function Header() {
    const fgnLogo = "/fergani-light-logo.png";
    const { user } = useAppSelector((state) => state.account);
    const dispatch = useAppDispatch();

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    // 📌 ENUM ID'leri burada tutuluyor!
    const [formData, setFormData] = useState({
        Ad: "",
        Soyad: "",
        Birim: 0, // ID olarak tutulacak
        Takim: 0, // ID olarak tutulacak
        DahiliNo: "",
        IsCepTelNo: "",
    });

    const [birimler, setBirimler] = useState<{ id: number; aciklama: string }[]>(
        []
    );
    const [takimlar, setTakimlar] = useState<{ id: number; aciklama: string }[]>(
        []
    );

    function handleMenuClick(event: React.MouseEvent<HTMLButtonElement>) {
        setAnchorEl(event.currentTarget);
    }

    function handleClose() {
        setAnchorEl(null);
    }

    async function handleDialogOpen() {
        try {
            const response = await requests.Rehber.BilgileriGetir();
            if (response) {
                setBirimler(response.birim ?? []);
                setTakimlar(response.takim ?? []);
            }
        } catch (error) {
            console.error("Bilgileri getirirken hata oluştu:", error);
            setBirimler([]);
            setTakimlar([]);
        }

        setOpenDialog(true);
    }

    function handleDialogClose() {
        setOpenDialog(false);
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setFormData((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }));
    }

    function handleSelectChange(event: SelectChangeEvent<number>) {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: Number(value), // 📌 Enum ID olarak saklanıyor!
        }));
    }

    async function handleSubmit() {
        try {
            await requests.Rehber.yeniTalepOlustur(formData);
            alert("Talep başarıyla oluşturuldu!");
            setOpenDialog(false);
        } catch (error) {
            console.error("Hata:", error);
        }
    }

    if (user === undefined) return null;

    return (
        <AppBar position="static" sx={{ mb: 4, background: "#000000" }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img
                        src={fgnLogo}
                        alt="logo"
                        style={{ width: "150px", height: "50px", objectFit: "contain" }}
                    />
                    <Typography
                        variant="h6"
                        sx={{
                            mr: 2,
                            cursor: "pointer",
                            textDecoration: "none",
                            color: "inherit",
                        }}
                        component={NavLink}
                        to="/"
                    >
                        Fergani Rehber
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    {user ? (
                        <>
                            <Button
                                id="user-button"
                                onClick={handleMenuClick}
                                endIcon={<KeyboardArrowDown />}
                                sx={navStyles}
                            >
                                {user.name}
                            </Button>
                            <Menu
                                id="user-menu"
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem component={Link} to="/admin" onClick={handleClose}>
                                    Talepler
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        dispatch(logout());
                                        handleClose();
                                    }}
                                >
                                    Çıkış yap
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Stack direction="row">
                            {authLinks.map((link) => (
                                <Button key={link.to} onClick={handleDialogOpen}>
                                    <PersonAddOutlined sx={{ color: "white" }} />
                                </Button>
                            ))}
                        </Stack>
                    )}
                </Box>
            </Toolbar>

            {/* 📌 Talep Oluşturma Dialogu */}
            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>Talep Oluştur</DialogTitle>
                <DialogContent>
                    <Grid2 container sx={{ spacing: 2, xl: 9, lg: 8, md: 7, sm: 6, xs: 12 }} >
                        <TextField name="Ad" label="Ad" fullWidth onChange={handleInputChange} />
                        <TextField name="Soyad" label="Soyad" fullWidth onChange={handleInputChange} />

                        {/* 📌 Birim Enum ID olarak gönderiliyor */}
                        <FormControl fullWidth>
                            <InputLabel>Birim</InputLabel>
                            <Select name="Birim" value={formData.Birim} onChange={handleSelectChange}>
                                {birimler.map((birim) => (
                                    <MenuItem key={birim.id} value={birim.id}>
                                        {birim.aciklama}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* 📌 Takım Enum ID olarak gönderiliyor */}
                        <FormControl fullWidth>
                            <InputLabel>Takım</InputLabel>
                            <Select name="Takim" value={formData.Takim} onChange={handleSelectChange}>
                                {takimlar.map((takim) => (
                                    <MenuItem key={takim.id} value={takim.id}>
                                        {takim.aciklama}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Grid2 container spacing={2}>
                            <Grid2 sx={{xs:12, sm:6}}>
                                <PhoneInput
                                    value={formData.IsCepTelNo}
                                    onChange={(val) =>
                                        setFormData((prev) => ({ ...prev, IsCepTelNo: val }))
                                    }
                                    sx={{ mt: 1 }}
                                />
                            </Grid2>

                            <Grid2 sx={{ xs: 12, sm: 6 }}>
                                <TextField
                                    name="DahiliNo"
                                    label="Dahili No"
                                    fullWidth
                                    onChange={handleInputChange}
                                />
                            </Grid2>
                        </Grid2>
                    </Grid2>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>İptal</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Gönder
                    </Button>
                </DialogActions>
            </Dialog>
        </AppBar>
    );
}

export default Header;
