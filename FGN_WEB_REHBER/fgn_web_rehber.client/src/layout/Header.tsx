import {
    AppBar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid2,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Toolbar,
    Typography,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
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

    const [formData, setFormData] = useState({
        Ad: "",
        Soyad: "",
        BirimId: 0,
        TakimId: 0,
        DahiliNo: "",
        IsCepTelNo: "",
    });

    const [birimler, setBirimler] = useState<{ id: number; aciklama: string }[]>([]);
    const [takimlar, setTakimlar] = useState<{ id: number; aciklama: string }[]>([]);

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
                setBirimler(response.birimler ?? []);
                setTakimlar(response.takimlar ?? []);
            }

            setFormData((prev) => ({
                ...prev,
                BirimId: birimler[0]?.id ?? 0,
                TakimId: takimlar[0]?.id ?? 0,
            }));
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
            [name]: Number(value),
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
        <AppBar position="static" sx={{ mb: 4, background: "#111111" }}>
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

            {/* Talep Oluşturma Dialogu */}
            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                        Çalışan Talebi Oluştur
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Lütfen aşağıdaki bilgileri eksiksiz doldurun
                    </Typography>
                </DialogTitle>
                <Divider />
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <TextField
                                name="Ad"
                                label="Ad"
                                fullWidth
                                onChange={handleInputChange}
                            />
                            <TextField
                                name="Soyad"
                                label="Soyad"
                                fullWidth
                                onChange={handleInputChange}
                            />
                        </Stack>

                        <FormControl fullWidth size="small">
                            <InputLabel id="birim-label">Birim</InputLabel>
                            <Select
                                labelId="birim-label"
                                name="BirimId"
                                value={formData.BirimId}
                                onChange={handleSelectChange}
                                label="Birim"
                            >
                                {birimler.map((birim) => (
                                    <MenuItem key={birim.id} value={birim.id}>
                                        {birim.aciklama}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <InputLabel id="takim-label">Takım</InputLabel>
                            <Select
                                labelId="takim-label"
                                name="TakimId"
                                value={formData.TakimId}
                                onChange={handleSelectChange}
                                label="Takım"
                            >
                                {takimlar.map((takim) => (
                                    <MenuItem key={takim.id} value={takim.id}>
                                        {takim.aciklama}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Grid2 container spacing={2}>
                            <Grid2 size={{ xs: 12, sm: 8 }}>
                                <PhoneInput
                                    value={formData.IsCepTelNo}
                                    onChange={(val) =>
                                        setFormData((prev) => ({ ...prev, IsCepTelNo: val }))
                                    }
                                    fullWidth
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    name="DahiliNo"
                                    label="Dahili No"
                                    fullWidth
                                    onChange={handleInputChange}
                                />
                            </Grid2>
                        </Grid2>
                    </Stack>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button onClick={handleDialogClose} variant="outlined" color="inherit">
                        İptal
                    </Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Gönder
                    </Button>
                </DialogActions>
            </Dialog>
        </AppBar>
    );
}

export default Header;
