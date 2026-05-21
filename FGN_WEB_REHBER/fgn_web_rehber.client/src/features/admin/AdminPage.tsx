import {
    Avatar, Box, Button, CircularProgress, Divider, FormControl, Grid2, InputLabel,
    MenuItem, Paper, Select, Stack, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Check, Close, Delete, Edit, PhotoCamera } from "@mui/icons-material";
import { EmployeeAvatar } from "../customComponents/EmployeeAvatar";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
    adminSelector, fetchEmployees, yeniCalisanTalepOnayla,
    yeniCalisanTalepReddet, calisanGuncelle, calisanSil, calisanFotoUrlGuncelle,
} from "../../redux/AdminSlice";
import formatPhoneNumber from "../../utils/formatter";
import requests from "../../api/requests";
import { PhoneInput } from "../customComponents/PhoneInput";
import { IEmployee } from "../../models/IEmployee";
import { BirimTakimAdmin } from "./BirimTakimAdmin";
import KullaniciYonetimi from "./KullaniciYonetimi";
import SilmeLoglari from "./SilmeLoglari";

type TalepDurum = "BEKLEMEDE" | "RED" | "ONAY";
type EmployeeRow = IEmployee & { TalepDurum?: TalepDurum };
type IBirimTakimItem = { id: number; aciklama: string };

const ALL = 0;

function AdminPage() {
    const { status, isLoaded } = useAppSelector((state) => state.admin);
    const dispatch = useAppDispatch();
    const employees = useAppSelector(adminSelector.selectAll) as EmployeeRow[];

    const [tab, setTab] = useState(0);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editEmployee, setEditEmployee] = useState<EmployeeRow | null>(null);
    const [birimler, setBirimler] = useState<IBirimTakimItem[]>([]);
    const [takimlar, setTakimlar] = useState<IBirimTakimItem[]>([]);

    // A2: arama
    const [adminSearch, setAdminSearch] = useState("");
    // B1: birim/takım filtresi
    const [adminBirimFilter, setAdminBirimFilter] = useState<number>(ALL);
    const [adminTakimFilter, setAdminTakimFilter] = useState<number>(ALL);
    // A3: silme onay dialogu
    const [deleteTarget, setDeleteTarget] = useState<EmployeeRow | null>(null);

    // Fotoğraf yönetimi
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const fotoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isLoaded) dispatch(fetchEmployees());
        // B1: sayfa yüklenince birim/takım listesini çek
        requests.Admin.getBirimler()
            .then((res) => setBirimler(res ?? []))
            .catch(() => { });
        requests.Admin.getTakimlar()
            .then((res) => setTakimlar(res ?? []))
            .catch(() => { });
    }, [isLoaded, dispatch]);

    const handleEditOpen = (employee: EmployeeRow) => {
        setEditEmployee(employee);
        setFotoFile(null);
        setFotoPreview(null);
        if (fotoInputRef.current) fotoInputRef.current.value = "";
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setEditDialogOpen(false);
        setEditEmployee(null);
        setFotoFile(null);
        setFotoPreview(null);
        if (fotoInputRef.current) fotoInputRef.current.value = "";
    };

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
            alert("Sadece JPG ve PNG formatları desteklenmektedir.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            alert("Dosya boyutu en fazla 2 MB olabilir.");
            return;
        }
        setFotoFile(file);
        setFotoPreview(URL.createObjectURL(file));
    };

    const handleFotoYukle = async () => {
        if (!fotoFile || !editEmployee) return;
        try {
            const res = await requests.Admin.calisanFotoYukle(editEmployee.Id, fotoFile);
            dispatch(calisanFotoUrlGuncelle({ id: editEmployee.Id, fotoUrl: res.FotoUrl }));
            setEditEmployee((prev) => prev ? { ...prev, FotoUrl: res.FotoUrl } : prev);
            setFotoFile(null);
            setFotoPreview(null);
            if (fotoInputRef.current) fotoInputRef.current.value = "";
        } catch {
            alert("Fotoğraf yüklenirken bir hata oluştu.");
        }
    };

    const handleFotoSil = async () => {
        if (!editEmployee) return;
        try {
            await requests.Admin.calisanFotoSil(editEmployee.Id);
            dispatch(calisanFotoUrlGuncelle({ id: editEmployee.Id, fotoUrl: null }));
            setEditEmployee((prev) => prev ? { ...prev, FotoUrl: undefined } : prev);
        } catch {
            alert("Fotoğraf silinirken bir hata oluştu.");
        }
    };

    const handleEditSave = () => {
        if (!editEmployee) return;
        const [ad, ...soyadArr] = editEmployee.AdSoyad.trim().split(" ");
        dispatch(calisanGuncelle({
            id: editEmployee.Id,
            updated: {
                Ad: ad,
                Soyad: soyadArr.join(" "),
                BirimId: Number(editEmployee.BirimId),
                TakimId: Number(editEmployee.TakimId),
                DahiliNo: editEmployee.DahiliNo,
                IsCepTelNo: editEmployee.IsCepTelNo,
            },
        }));
        handleEditClose();
    };

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;
        dispatch(calisanSil(deleteTarget.Id));
        setDeleteTarget(null);
    };

    // Filtre + arama zinciri
    const filteredEmployees: EmployeeRow[] = employees.filter((emp) => {
        if (tab === 0 && emp.TalepDurum !== "BEKLEMEDE") return false;
        if (tab === 1 && emp.TalepDurum !== "RED") return false;

        if (adminSearch && !emp.AdSoyad.toLocaleLowerCase("tr-TR").includes(adminSearch.toLocaleLowerCase("tr-TR")))
            return false;
        if (adminBirimFilter !== ALL && Number((emp as any).BirimId) !== adminBirimFilter) return false;
        if (adminTakimFilter !== ALL && Number((emp as any).TakimId) !== adminTakimFilter) return false;

        return true;
    });

    const renderButtons = (item: EmployeeRow) => {
        const deleteBtn = (
            <Button variant="outlined" color="error" sx={{ ml: 1 }} onClick={() => setDeleteTarget(item)}>
                <Delete />
            </Button>
        );

        if (tab === 0) return (
            <>
                <Button variant="outlined" color="success" sx={{ mr: 1 }} onClick={() => dispatch(yeniCalisanTalepOnayla({ CalisanId: item.Id }))}>
                    <Check />
                </Button>
                <Button variant="outlined" color="error" sx={{ mr: 1 }} onClick={() => dispatch(yeniCalisanTalepReddet({ CalisanId: item.Id }))}>
                    <Close />
                </Button>
                <Button variant="outlined" color="info" onClick={() => handleEditOpen(item)}>
                    <Edit />
                </Button>
                {deleteBtn}
            </>
        );

        if (tab === 1) return (
            <>
                <Button variant="outlined" color="success" sx={{ mr: 1 }} onClick={() => dispatch(yeniCalisanTalepOnayla({ CalisanId: item.Id }))}>
                    <Check />
                </Button>
                <Button variant="outlined" color="info" onClick={() => handleEditOpen(item)}>
                    <Edit />
                </Button>
                {deleteBtn}
            </>
        );

        if (tab === 2) return (
            <>
                {item.TalepDurum === "ONAY" && (
                    <Button variant="outlined" color="error" sx={{ mr: 1 }} onClick={() => dispatch(yeniCalisanTalepReddet({ CalisanId: item.Id }))}>
                        <Close />
                    </Button>
                )}
                <Button variant="outlined" color="info" onClick={() => handleEditOpen(item)}>
                    <Edit />
                </Button>
                {deleteBtn}
            </>
        );

        return null;
    };

    return (
        <>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
                <Tab label="Onay Bekleyenler" />
                <Tab label="Reddedilenler" />
                <Tab label="Tümü" />
                <Tab label="Birim/Takım Güncelleme" />
                <Tab label="Kullanıcı Yönetimi" />
                <Tab label="Silme Logları" />
            </Tabs>

            {tab === 3 ? (
                <BirimTakimAdmin />
            ) : tab === 4 ? (
                <KullaniciYonetimi />
            ) : tab === 5 ? (
                <SilmeLoglari />
            ) : (
                <>
                    {/* A2 + B1: arama ve filtreler */}
                    <Grid2 container spacing={2} sx={{ mt: 2, mb: 2 }}>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Çalışan Ara"
                                fullWidth
                                value={adminSearch}
                                onChange={(e) => setAdminSearch(e.target.value)}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Birim</InputLabel>
                                <Select
                                    label="Birim"
                                    value={String(adminBirimFilter)}
                                    onChange={(e) => setAdminBirimFilter(Number(e.target.value))}
                                >
                                    <MenuItem value={String(ALL)}>Tümü</MenuItem>
                                    {birimler.map((b) => (
                                        <MenuItem key={b.id} value={String(b.id)}>
                                            {b.aciklama}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Takım</InputLabel>
                                <Select
                                    label="Takım"
                                    value={String(adminTakimFilter)}
                                    onChange={(e) => setAdminTakimFilter(Number(e.target.value))}
                                >
                                    <MenuItem value={String(ALL)}>Tümü</MenuItem>
                                    {takimlar.map((t) => (
                                        <MenuItem key={t.id} value={String(t.id)}>
                                            {t.aciklama}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid2>
                    </Grid2>

                    {status === "loading" ? (
                        <CircularProgress />
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: 48 }} />
                                        <TableCell>Ad Soyad</TableCell>
                                        <TableCell>Birim</TableCell>
                                        <TableCell>Takım</TableCell>
                                        <TableCell>Dahili No</TableCell>
                                        <TableCell>İş Tel No</TableCell>
                                        <TableCell align="center">İşlem</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredEmployees.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 5, color: "text.secondary" }}>
                                                Kayıt bulunamadı.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredEmployees.map((item, index) => (
                                            <TableRow key={(item as any).Id ?? index}>
                                                <TableCell sx={{ py: 0.5 }}>
                                                    <EmployeeAvatar fotoUrl={item.FotoUrl} name={item.AdSoyad} size={36} />
                                                </TableCell>
                                                <TableCell>{item.AdSoyad}</TableCell>
                                                <TableCell>{item.Birim}</TableCell>
                                                <TableCell>{item.Takim}</TableCell>
                                                <TableCell>{item.DahiliNo || "-"}</TableCell>
                                                <TableCell>{formatPhoneNumber(item.IsCepTelNo)}</TableCell>
                                                <TableCell align="center">
                                                    <Box>{renderButtons(item)}</Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </>
            )}

            {/* Düzenleme Dialogu */}
            {editEmployee && (
                <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ pb: 1 }}>
                        <Typography variant="h6" fontWeight={700}>Çalışan Düzenle</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{editEmployee.AdSoyad}</Typography>
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            {/* Fotoğraf yönetimi */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                {fotoPreview ? (
                                    <Avatar
                                        sx={{ width: 72, height: 72, bgcolor: "#111111", cursor: "pointer" }}
                                        onClick={() => fotoInputRef.current?.click()}
                                    >
                                        <img src={fotoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </Avatar>
                                ) : (
                                    <EmployeeAvatar
                                        fotoUrl={editEmployee.FotoUrl}
                                        name={editEmployee.AdSoyad}
                                        size={72}
                                        onClick={() => fotoInputRef.current?.click()}
                                    >
                                        <PhotoCamera />
                                    </EmployeeAvatar>
                                )}
                                <Box>
                                    <input
                                        ref={fotoInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        style={{ display: "none" }}
                                        onChange={handleFotoChange}
                                    />
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        <Button size="small" variant="outlined" onClick={() => fotoInputRef.current?.click()}>
                                            {fotoFile ? "Tekrar Seç" : editEmployee.FotoUrl ? "Değiştir" : "Fotoğraf Seç"}
                                        </Button>
                                        {fotoFile && (
                                            <Button size="small" variant="contained" color="primary" onClick={handleFotoYukle}>
                                                Yükle
                                            </Button>
                                        )}
                                        {editEmployee.FotoUrl && !fotoFile && (
                                            <Button size="small" variant="outlined" color="error" onClick={handleFotoSil}>
                                                Fotoğrafı Sil
                                            </Button>
                                        )}
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                                        JPG veya PNG · Max 2 MB
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider />
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <TextField
                                    label="Ad" fullWidth
                                    value={editEmployee.AdSoyad.split(" ")[0]}
                                    onChange={(e) => setEditEmployee((prev) => prev ? { ...prev, AdSoyad: `${e.target.value} ${prev.AdSoyad.split(" ").slice(1).join(" ")}` } : prev)}
                                />
                                <TextField
                                    label="Soyad" fullWidth
                                    value={editEmployee.AdSoyad.split(" ").slice(1).join(" ")}
                                    onChange={(e) => setEditEmployee((prev) => prev ? { ...prev, AdSoyad: `${prev.AdSoyad.split(" ")[0]} ${e.target.value}` } : prev)}
                                />
                            </Stack>
                            <FormControl fullWidth size="small">
                                <InputLabel>Birim</InputLabel>
                                <Select name="Birim" label="Birim" value={String(editEmployee.BirimId ?? "")}
                                    onChange={(e) => {
                                        const selectedId = Number(e.target.value);
                                        const selectedBirim = birimler.find((b) => b.id === selectedId);
                                        setEditEmployee((prev) => prev ? { ...prev, BirimId: selectedId, Birim: selectedBirim?.aciklama ?? prev.Birim } : prev);
                                    }}>
                                    {birimler.map((b) => <MenuItem key={b.id} value={String(b.id)}>{b.aciklama}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel>Takım</InputLabel>
                                <Select name="Takim" label="Takım" value={String(editEmployee.TakimId ?? "")}
                                    onChange={(e) => {
                                        const selectedId = Number(e.target.value);
                                        const selectedTakim = takimlar.find((t) => t.id === selectedId);
                                        setEditEmployee((prev) => prev ? { ...prev, TakimId: selectedId, Takim: selectedTakim?.aciklama ?? prev.Takim } : prev);
                                    }}>
                                    {takimlar.map((t) => <MenuItem key={t.id} value={String(t.id)}>{t.aciklama}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <Grid2 container spacing={2}>
                                <Grid2 size={{ xs: 12, sm: 8 }}>
                                    <PhoneInput value={editEmployee.IsCepTelNo} fullWidth
                                        onChange={(phone) => setEditEmployee((prev) => prev ? { ...prev, IsCepTelNo: phone } : prev)} />
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 4 }}>
                                    <TextField label="Dahili No" fullWidth value={editEmployee.DahiliNo}
                                        onChange={(e) => setEditEmployee((prev) => prev ? { ...prev, DahiliNo: e.target.value } : prev)} />
                                </Grid2>
                            </Grid2>
                        </Stack>
                    </DialogContent>
                    <Divider />
                    <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                        <Button onClick={handleEditClose} variant="outlined" color="inherit">İptal</Button>
                        <Button onClick={handleEditSave} variant="contained">Kaydet</Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Silme Onay Dialogu */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    <Typography variant="h6" fontWeight={700}>Çalışanı Sil</Typography>
                </DialogTitle>
                <Divider />
                <DialogContent>
                    <Typography>
                        <strong>{deleteTarget?.AdSoyad}</strong> adlı çalışan kalıcı olarak silinecek. Emin misiniz?
                    </Typography>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button onClick={() => setDeleteTarget(null)} variant="outlined" color="inherit">İptal</Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error">Sil</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default AdminPage;
