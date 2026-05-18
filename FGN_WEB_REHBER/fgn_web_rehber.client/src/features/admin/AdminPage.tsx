import { Box,Button,CircularProgress,Divider,Grid2,Paper,Stack,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,
    Tabs,Tab,Dialog, DialogTitle,DialogContent, DialogActions,TextField,FormControl,InputLabel,MenuItem,Select,Typography} from "@mui/material";
import { useEffect, useState } from "react";
import { Check, Close, Edit } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
    adminSelector,
    fetchEmployees,
    yeniCalisanTalepOnayla,
    yeniCalisanTalepReddet,
    calisanGuncelle,
} from "../../redux/AdminSlice";
import formatPhoneNumber from "../../utils/formatter";
import requests from "../../api/requests";
import { PhoneInput } from "../customComponents/PhoneInput";
import { IEmployee } from "../../models/IEmployee";
import { BirimTakimAdmin } from "./BirimTakimAdmin";


type TalepDurum = "BEKLEMEDE" | "RED" | "ONAY";
type EmployeeRow = IEmployee & { TalepDurum?: TalepDurum };

type IBirimTakimItem = { id: number; aciklama: string };

function AdminPage() {
    const { status, isLoaded } = useAppSelector((state) => state.admin);
    const dispatch = useAppDispatch();

    // Selector çıktısını tipliyoruz
    const employees = useAppSelector(adminSelector.selectAll) as EmployeeRow[];

    const [tab, setTab] = useState(0); // 0: Bekleyen, 1: Reddedilen, 2: Tümü
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editEmployee, setEditEmployee] = useState<EmployeeRow | null>(null);
    const [birimler, setBirimler] = useState<IBirimTakimItem[]>([]);
    const [takimlar, setTakimlar] = useState<IBirimTakimItem[]>([]);

    useEffect(() => {
        if (!isLoaded) {
            dispatch(fetchEmployees());
        }
    }, [isLoaded, dispatch]);

    const handleEditOpen = async (employee: EmployeeRow) => {
        try {
            const response = await requests.Rehber.BilgileriGetir();
            setBirimler(response?.birimler ?? []);
            setTakimlar(response?.takimlar ?? []);
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
        if (!editEmployee) return; // null guard

        const [ad, ...soyadArr] = editEmployee.AdSoyad.trim().split(" ");
        const soyad = soyadArr.join(" ");

        dispatch(
            calisanGuncelle({
                id: editEmployee.Id,
                updated: {
                    Ad: ad,
                    Soyad: soyad,
                    BirimId: Number(editEmployee.Birim),  // güvenli olsun
                    TakimId: Number(editEmployee.Takim),
                    DahiliNo: editEmployee.DahiliNo,
                    IsCepTelNo: editEmployee.IsCepTelNo,
                },
            })
        );

        handleEditClose();
    };

    const filteredEmployees: EmployeeRow[] = employees.filter((emp) => {
        if (tab === 0) return emp.TalepDurum === "BEKLEMEDE";
        if (tab === 1) return emp.TalepDurum === "RED";
        return true;
    });

    const renderButtons = (item: EmployeeRow) => {
        const durum = item.TalepDurum;

        if (tab === 0) {
            // Onay Bekleyenler
            return (
                <>
                    <Button
                        onClick={() =>
                            dispatch(yeniCalisanTalepOnayla({ CalisanId: item.Id }))
                        }
                        variant="outlined"
                        color="success"
                        sx={{ mr: 1 }}
                    >
                        <Check />
                    </Button>
                    <Button
                        onClick={() =>
                            dispatch(yeniCalisanTalepReddet({ CalisanId: item.Id }))
                        }
                        variant="outlined"
                        color="error"
                        sx={{ mr: 1 }}
                    >
                        <Close />
                    </Button>
                    <Button
                        onClick={() => handleEditOpen(item)}
                        variant="outlined"
                        color="info"
                    >
                        <Edit />
                    </Button>
                </>
            );
        }

        if (tab === 1) {
            // Reddedilenler
            return (
                <>
                    <Button
                        onClick={() =>
                            dispatch(yeniCalisanTalepOnayla({ CalisanId: item.Id }))
                        }
                        variant="outlined"
                        color="success"
                        sx={{ mr: 1 }}
                    >
                        <Check />
                    </Button>
                    <Button
                        onClick={() => handleEditOpen(item)}
                        variant="outlined"
                        color="info"
                    >
                        <Edit />
                    </Button>
                </>
            );
        }

        if (tab === 2) {
            if (durum === "ONAY") {
                return (
                    <>
                        <Button
                            onClick={() =>
                                dispatch(yeniCalisanTalepReddet({ CalisanId: item.Id }))
                            }
                            variant="outlined"
                            color="error"
                            sx={{ mr: 1 }}
                        >
                            <Close />
                        </Button>
                        <Button
                            onClick={() => handleEditOpen(item)}
                            variant="outlined"
                            color="info"
                        >
                            <Edit />
                        </Button>
                    </>
                );
            }

            return (
                <Button
                    onClick={() => handleEditOpen(item)}
                    variant="outlined"
                    color="info"
                >
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
                <Tab label="Birim/Takım Güncelleme" />
            </Tabs>
            {tab === 3 ? (
                <BirimTakimAdmin />
            ) : (
                <>
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
                                            <TableCell>
                                                {formatPhoneNumber(item.IsCepTelNo)}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box>{renderButtons(item)}</Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </>
            )}


            {editEmployee && (
                <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ pb: 1 }}>
                        <Typography variant="h6" fontWeight={700}>Çalışan Düzenle</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {editEmployee.AdSoyad}
                        </Typography>
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <TextField
                                    label="Ad"
                                    fullWidth
                                    value={editEmployee.AdSoyad.split(" ")[0]}
                                    onChange={(e) =>
                                        setEditEmployee((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    AdSoyad: `${e.target.value} ${prev.AdSoyad.split(" ").slice(1).join(" ")}`,
                                                }
                                                : prev
                                        )
                                    }
                                />
                                <TextField
                                    label="Soyad"
                                    fullWidth
                                    value={editEmployee.AdSoyad.split(" ").slice(1).join(" ")}
                                    onChange={(e) =>
                                        setEditEmployee((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    AdSoyad: `${prev.AdSoyad.split(" ")[0]} ${e.target.value}`,
                                                }
                                                : prev
                                        )
                                    }
                                />
                            </Stack>

                            <FormControl fullWidth size="small">
                                <InputLabel>Birim</InputLabel>
                                <Select
                                    name="Birim"
                                    label="Birim"
                                    value={String(editEmployee.Birim)}
                                    onChange={(e) =>
                                        setEditEmployee((prev) =>
                                            prev ? { ...prev, Birim: String(e.target.value) } : prev
                                        )
                                    }
                                >
                                    {birimler.map((b) => (
                                        <MenuItem key={b.id} value={String(b.id)}>
                                            {b.aciklama}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth size="small">
                                <InputLabel>Takım</InputLabel>
                                <Select
                                    name="Takim"
                                    label="Takım"
                                    value={String(editEmployee.Takim)}
                                    onChange={(e) =>
                                        setEditEmployee((prev) =>
                                            prev ? { ...prev, Takim: String(e.target.value) } : prev
                                        )
                                    }
                                >
                                    {takimlar.map((t) => (
                                        <MenuItem key={t.id} value={String(t.id)}>
                                            {t.aciklama}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Grid2 container spacing={2}>
                                <Grid2 size={{ xs: 12, sm: 8 }}>
                                    <PhoneInput
                                        value={editEmployee.IsCepTelNo}
                                        onChange={(phone) =>
                                            setEditEmployee((prev) =>
                                                prev ? { ...prev, IsCepTelNo: phone } : prev
                                            )
                                        }
                                        fullWidth
                                    />
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        label="Dahili No"
                                        fullWidth
                                        value={editEmployee.DahiliNo}
                                        onChange={(e) =>
                                            setEditEmployee((prev) =>
                                                prev ? { ...prev, DahiliNo: e.target.value } : prev
                                            )
                                        }
                                    />
                                </Grid2>
                            </Grid2>
                        </Stack>
                    </DialogContent>
                    <Divider />
                    <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                        <Button onClick={handleEditClose} variant="outlined" color="inherit">
                            İptal
                        </Button>
                        <Button onClick={handleEditSave} variant="contained" color="primary">
                            Kaydet
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
}

export default AdminPage;
