import {
    AppBar,
    Avatar,
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
import { useRef, useState } from "react";
import { KeyboardArrowDown, PersonAddOutlined, PhotoCamera } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { logout } from "../redux/AccountSlice";
import requests from "../api/requests";
import { toast } from "react-toastify";
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

const initialFormData = {
    Ad: "",
    Soyad: "",
    BirimId: 0,
    TakimId: 0,
    DahiliNo: "",
    IsCepTelNo: "",
};

function Header() {
    const fgnLogo = "/fergani-light-logo.png";
    const { user } = useAppSelector((state) => state.account);
    const dispatch = useAppDispatch();

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    const [formData, setFormData] = useState(initialFormData);

    const [birimler, setBirimler] = useState<{ id: number; aciklama: string }[]>([]);
    const [takimlar, setTakimlar] = useState<{ id: number; aciklama: string }[]>([]);

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const fotoInputRef = useRef<HTMLInputElement>(null);

    // Şifre değiştirme
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        CurrentPassword: "",
        NewPassword: "",
        NewPasswordConfirm: "",
    });
    const [passwordError, setPasswordError] = useState("");

    function handleMenuClick(event: React.MouseEvent<HTMLButtonElement>) {
        setAnchorEl(event.currentTarget);
    }

    function handleClose() {
        setAnchorEl(null);
    }

    async function handleDialogOpen() {
        try {
            const response = await requests.Rehber.TalepBilgileriGetir();

            const gelenBirimler = response?.birimler ?? [];
            const gelenTakimlar = response?.takimlar ?? [];

            setBirimler(gelenBirimler);
            setTakimlar(gelenTakimlar);

            setFormData((prev) => ({
                ...prev,
                BirimId: gelenBirimler[0]?.id ?? 0,
                TakimId: gelenTakimlar[0]?.id ?? 0,
            }));
        } catch (error) {
            console.error("Bilgileri getirirken hata oluştu:", error);
            setBirimler([]);
            setTakimlar([]);
        }

        setOpenDialog(true);
    }

    async function handleAdminDialogOpen() {
        try {
            const b = await requests.Admin.getBirimler();
            const t = await requests.Admin.getTakimlar();

            const gelenBirimler = b ?? [];
            const gelenTakimlar = t ?? [];

            setBirimler(gelenBirimler);
            setTakimlar(gelenTakimlar);

            setFormData((prev) => ({
                ...prev,
                BirimId: gelenBirimler[0]?.id ?? 0,
                TakimId: gelenTakimlar[0]?.id ?? 0,
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
        setFotoFile(null);
        setFotoPreview(null);
        if (fotoInputRef.current) fotoInputRef.current.value = "";
    }

    function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
            toast.error("Sadece JPG ve PNG formatları desteklenmektedir.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Dosya boyutu en fazla 2 MB olabilir.");
            return;
        }
        setFotoFile(file);
        setFotoPreview(URL.createObjectURL(file));
    }

    function handleFotoKaldir() {
        setFotoFile(null);
        setFotoPreview(null);
        if (fotoInputRef.current) fotoInputRef.current.value = "";
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
            setFormSubmitted(true);
            if (!formData.Ad || !formData.Soyad || !formData.BirimId || !formData.TakimId) {
                toast.error("Lütfen zorunlu alanları doldurun.");
                return;
            }

            const fd = new FormData();
            fd.append("Ad", formData.Ad);
            fd.append("Soyad", formData.Soyad);
            fd.append("BirimId", String(formData.BirimId));
            fd.append("TakimId", String(formData.TakimId));
            if (formData.DahiliNo) fd.append("DahiliNo", formData.DahiliNo);
            if (formData.IsCepTelNo) fd.append("IsCepTelNo", formData.IsCepTelNo);
            if (fotoFile) fd.append("foto", fotoFile);

            await requests.Rehber.yeniTalepOlustur(fd);
            setOpenDialog(false);
            toast.success("Talebiniz alındı. BT ekibi tarafından incelendikten sonra rehbere eklenecektir.");
            setFormData(initialFormData);
            setFotoFile(null);
            setFotoPreview(null);
            setFormSubmitted(false);
        } catch (error) {
            console.error("Hata:", error);
            toast.error("Talep oluşturulurken bir hata oluştu.");
        }
    }

    function handlePasswordDialogOpen() {
        setPasswordForm({ CurrentPassword: "", NewPassword: "", NewPasswordConfirm: "" });
        setPasswordError("");
        setOpenPasswordDialog(true);
        handleClose();
    }

    function handlePasswordDialogClose() {
        setOpenPasswordDialog(false);
    }

    async function handlePasswordSubmit() {
        if (passwordForm.NewPassword !== passwordForm.NewPasswordConfirm) {
            setPasswordError("Yeni şifreler eşleşmiyor.");
            return;
        }
        setPasswordError("");
        try {
            await requests.Account.changePassword({
                CurrentPassword: passwordForm.CurrentPassword,
                NewPassword: passwordForm.NewPassword,
            });
            setOpenPasswordDialog(false);
            toast.success("Şifreniz başarıyla değiştirildi.");
        } catch (error) {
            console.error("Hata:", error);
            toast.error("Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.");
        }
    }

    if (user === undefined) return null;

    return (
        <AppBar position="static" sx={{ mb: 4, background: "#111111", borderRadius: "0 0 12px 12px" }}>
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
                            <Stack direction="row">
                                {authLinks.map((link) => (
                                    <Button key={link.to} onClick={handleAdminDialogOpen}>
                                        <PersonAddOutlined sx={{ color: "white" }} />
                                    </Button>
                                ))}
                                
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
                                    <MenuItem onClick={handlePasswordDialogOpen}>
                                        Şifre Değiştir
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
                            </Stack>
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
                        Lütfen aşağıdaki bilgileri eksiksiz doldurun.
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
                                required
                                error={formSubmitted && !formData.Ad}
                                helperText={formSubmitted && !formData.Ad ? "Ad alanı zorunludur." : ""}
                            />
                            <TextField
                                name="Soyad"
                                label="Soyad"
                                fullWidth
                                onChange={handleInputChange}
                                required
                                error={formSubmitted && !formData.Soyad}
                                helperText={formSubmitted && !formData.Soyad ? "Soyad alanı zorunludur." : ""}
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
                                required
                                error={formSubmitted && !formData.BirimId}
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
                                required
                                error={formSubmitted && !formData.TakimId}
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
                        <Divider />
                        {/* Vesikalık Fotoğraf */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar
                                src={fotoPreview ?? undefined}
                                sx={{ width: 64, height: 64, bgcolor: "#111111", fontSize: 22, cursor: "pointer" }}
                                onClick={() => fotoInputRef.current?.click()}
                            >
                                {!fotoPreview && <PhotoCamera />}
                            </Avatar>
                            <Box>
                                <input
                                    ref={fotoInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png"
                                    style={{ display: "none" }}
                                    onChange={handleFotoChange}
                                />
                                <Button size="small" variant="outlined" onClick={() => fotoInputRef.current?.click()}>
                                    {fotoFile ? "Tekrar Seç" : "Fotoğraf Seç"}
                                </Button>
                                {fotoFile && (
                                    <Button size="small" color="error" sx={{ ml: 1 }} onClick={handleFotoKaldir}>
                                        Kaldır
                                    </Button>
                                )}
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Opsiyonel · JPG veya PNG · Max 2 MB
                                </Typography>
                            </Box>
                        </Box>
                        <Divider>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Not: Eğer cep telefonu veya dahili yoksa bu alanlar boş bırakılabilir.
                            </Typography>
                        </Divider>
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

            {/* Şifre Değiştirme Dialogu */}
            <Dialog open={openPasswordDialog} onClose={handlePasswordDialogClose} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                        Şifre Değiştir
                    </Typography>
                </DialogTitle>
                <Divider />
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="Mevcut Şifre"
                            type="password"
                            fullWidth
                            value={passwordForm.CurrentPassword}
                            onChange={(e) =>
                                setPasswordForm((prev) => ({ ...prev, CurrentPassword: e.target.value }))
                            }
                        />
                        <TextField
                            label="Yeni Şifre"
                            type="password"
                            fullWidth
                            value={passwordForm.NewPassword}
                            onChange={(e) =>
                                setPasswordForm((prev) => ({ ...prev, NewPassword: e.target.value }))
                            }
                        />
                        <TextField
                            label="Yeni Şifre (Tekrar)"
                            type="password"
                            fullWidth
                            value={passwordForm.NewPasswordConfirm}
                            onChange={(e) =>
                                setPasswordForm((prev) => ({ ...prev, NewPasswordConfirm: e.target.value }))
                            }
                            error={!!passwordError}
                            helperText={passwordError}
                        />
                    </Stack>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button onClick={handlePasswordDialogClose} variant="outlined" color="inherit">
                        İptal
                    </Button>
                    <Button onClick={handlePasswordSubmit} variant="contained">
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>
        </AppBar>
    );
}

export default Header;
