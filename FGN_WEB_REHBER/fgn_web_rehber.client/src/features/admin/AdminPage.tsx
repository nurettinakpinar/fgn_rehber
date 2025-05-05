import {
    Box, Button, CircularProgress, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Tabs, Tab,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Grid2
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { useEffect, useState } from "react";
import { Check, Close, Edit } from "@mui/icons-material";
import {
    adminSelector,
    fetchEmployees,
    yeniCalisanTalepOnayla,
    yeniCalisanTalepReddet,
    calisanGuncelle
} from "../../redux/AdminSlice";
import formatPhoneNumber from "../../utils/formatter";
import requests from "../../api/requests";
import { PhoneInput } from "../customComponents/PhoneInput";

function AdminPage() {
    const { status, isLoaded } = useAppSelector(state => state.admin);
    const dispatch = useAppDispatch();
    const employees = useAppSelector(adminSelector.selectAll);

    const [tab, setTab] = useState(0); // 0: Bekleyen, 1: Reddedilen, 2: Tümü
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);
    const [birimler, setBirimler] = useState<{ id: number; aciklama: string }[]>([]);
    const [takimlar, setTakimlar] = useState<{ id: number; aciklama: string }[]>([]);

    useEffect(() => {
        if (!isLoaded) {
            dispatch(fetchEmployees());
        }
    }, [isLoaded]);

    const handleEditOpen = async (employee) => {
        try {
            const response = await requests.Rehber.BilgileriGetir();
            setBirimler(response.birim ?? []);
            setTakimlar(response.takim ?? []);
        } catch (error) {
            console.error("Birim/takım bilgileri getirilemedi:", error);
        }

        setEditEmployee(employee);
        setEditDialogOpen(true);
    };


    const handleEditClose = () => {
        setEditDialogOpen(false);
        setEditEmployee(null);
    };

    const handleEditSave = () => {
        const [ad, ...soyadArr] = editEmployee.AdSoyad.trim().split(" ");
        const soyad = soyadArr.join(" ");

        dispatch(calisanGuncelle({
            id: editEmployee.Id,
            updated: {
                Ad: ad,
                Soyad: soyad,
                Birim: editEmployee.Birim,
                Takim: editEmployee.Takim,
                DahiliNo: editEmployee.DahiliNo,
                IsCepTelNo: editEmployee.IsCepTelNo,
            }
        }));

        handleEditClose();
    };

    const filteredEmployees = employees.filter(emp => {
        if (tab === 0) return emp.TalepDurum === "BEKLEMEDE";
        if (tab === 1) return emp.TalepDurum === "RED";
        return true;
    });

    const renderButtons = (item: any) => {
        const durum = item.TalepDurum;

        if (tab === 0) {
            // Onay Bekleyenler
            return (
                <>
                    <Button onClick={() => dispatch(yeniCalisanTalepOnayla({ CalisanId: item.Id }))}
                        variant="outlined" color="success" sx={{ mr: 1 }}>
                        <Check />
                    </Button>
                    <Button onClick={() => dispatch(yeniCalisanTalepReddet({ CalisanId: item.Id }))}
                        variant="outlined" color="error" sx={{ mr: 1 }}>
                        <Close />
                    </Button>
                    <Button onClick={() => handleEditOpen(item)}
                        variant="outlined" color="info">
                        <Edit />
                    </Button>
                </>
            );
        }

        if (tab === 1) {
            // Reddedilenler
            return (
                <>
                    <Button onClick={() => dispatch(yeniCalisanTalepOnayla({ CalisanId: item.Id }))}
                        variant="outlined" color="success" sx={{ mr: 1 }}>
                        <Check />
                    </Button>
                    <Button onClick={() => handleEditOpen(item)}
                        variant="outlined" color="info">
                        <Edit />
                    </Button>
                </>
            );
        }

        if (tab === 2) {
            if (durum === "ONAY") {
                return (
                    <>
                        <Button onClick={() => dispatch(yeniCalisanTalepReddet({ CalisanId: item.Id }))}
                            variant="outlined" color="error" sx={{ mr: 1 }}>
                            <Close />
                        </Button>
                        <Button onClick={() => handleEditOpen(item)}
                            variant="outlined" color="info">
                            <Edit />
                        </Button>
                    </>
                );
            }

            return (
                <Button onClick={() => handleEditOpen(item)}
                    variant="outlined" color="info">
                    <Edit />
                </Button>
            );
        }

        return null;
    };

    return (
        <>
            <Tabs value={tab} onChange={(_, newVal) => setTab(newVal)} centered>
                <Tab label="Onay Bekleyenler" />
                <Tab label="Reddedilenler" />
                <Tab label="Tümü" />
            </Tabs>

            {status === "loading" ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Ad Soyad</TableCell>
                                <TableCell>Birim</TableCell>
                                <TableCell>Takım</TableCell>
                                <TableCell>Dahili No</TableCell>
                                <TableCell>İş Tel No</TableCell>
                                <TableCell align="center">İşlem</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredEmployees.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.AdSoyad}</TableCell>
                                    <TableCell>{item.Birim}</TableCell>
                                    <TableCell>{item.Takim}</TableCell>
                                    <TableCell>{item.DahiliNo}</TableCell>
                                    <TableCell>{formatPhoneNumber(item.IsCepTelNo)}</TableCell>
                                    <TableCell align="center">
                                        <Box>
                                            {renderButtons(item)}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {editEmployee && (
                <Dialog open={editDialogOpen} onClose={handleEditClose}>
                    <DialogTitle>Çalışan Düzenle</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Ad"
                            fullWidth
                            value={editEmployee.AdSoyad.split(" ")[0]}
                            onChange={(e) => {
                                const soyad = editEmployee.AdSoyad.split(" ").slice(1).join(" ");
                                setEditEmployee({ ...editEmployee, AdSoyad: `${e.target.value} ${soyad}` });
                            }}
                            sx={{ mt: 2 }}
                        />
                        <TextField
                            label="Soyad"
                            fullWidth
                            value={editEmployee.AdSoyad.split(" ").slice(1).join(" ")}
                            onChange={(e) => {
                                const ad = editEmployee.AdSoyad.split(" ")[0];
                                setEditEmployee({ ...editEmployee, AdSoyad: `${ad} ${e.target.value}` });
                            }}
                            sx={{ mt: 2 }}
                        />
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Birim</InputLabel>
                            <Select
                                name="Birim"
                                value={editEmployee.Birim}
                                onChange={(e) =>
                                    setEditEmployee({ ...editEmployee, Birim: Number(e.target.value) })
                                }
                            >
                                {birimler.map((b) => (
                                    <MenuItem key={b.id} value={b.id}>
                                        {b.aciklama}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Takım</InputLabel>
                            <Select
                                name="Takim"
                                value={editEmployee.Takim}
                                onChange={(e) =>
                                    setEditEmployee({ ...editEmployee, Takim: Number(e.target.value) })
                                }
                            >
                                {takimlar.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>
                                        {t.aciklama}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Grid2 container spacing={2}>
                            <Grid2 sx={{ xs: 6 }}>
                                <PhoneInput
                                    value={editEmployee.IsCepTelNo}
                                    onChange={(phone) =>
                                        setEditEmployee({ ...editEmployee, IsCepTelNo: phone })
                                    }
                                    sx={{ mt: 2 }}
                                />
                            </Grid2>

                            <Grid2 sx={{ xs: 6 }}>
                                <TextField
                                    label="Dahili No"
                                    fullWidth
                                    value={editEmployee.DahiliNo}
                                    onChange={e =>
                                        setEditEmployee({ ...editEmployee, DahiliNo: e.target.value })
                                    }
                                    sx={{ mt: 2 }}
                                />
                            </Grid2>

                        </Grid2>


                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleEditClose}>İptal</Button>
                        <Button onClick={handleEditSave} color="primary">
                            Kaydet
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
}

export default AdminPage;
