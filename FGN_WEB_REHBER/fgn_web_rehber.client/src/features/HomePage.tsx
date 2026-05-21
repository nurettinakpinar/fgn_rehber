import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid2,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TextField,
    Typography,
} from "@mui/material";
import {
    Business,
    Close,
    Download,
    Groups,
    Phone,
    Dialpad,
} from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import requests from "../api/requests";
import { EmployeeAvatar } from "./customComponents/EmployeeAvatar";
import formatPhoneNumber from "../utils/formatter";
import { IEmployee } from "../models/IEmployee";
import { useAppSelector } from "../redux/store";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
        "& .MuiTableSortLabel-root": { color: theme.palette.common.white },
        "& .MuiTableSortLabel-root:hover": { color: theme.palette.common.white },
        "& .MuiTableSortLabel-root.Mui-active": { color: theme.palette.common.white },
        "& .MuiTableSortLabel-icon": { color: `${theme.palette.common.white} !important` },
    },
    [`&.${tableCellClasses.body}`]: { fontSize: 14 },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    cursor: "pointer",
    "&:nth-of-type(odd)": { backgroundColor: theme.palette.action.hover },
    "&:last-child td, &:last-child th": { border: 0 },
    "&:hover": { backgroundColor: theme.palette.action.selected },
}));

type Order = "asc" | "desc";
type OrderBy = keyof Pick<IEmployee, "AdSoyad" | "Birim" | "Takim" | "DahiliNo" | "IsCepTelNo">;
type FilterItem = { id: number; aciklama: string };

const ALL = 0;

function HomePage() {
    const { user } = useAppSelector((state) => state.account);
    const [searchTerm, setSearchTerm] = useState("");
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<Order>("asc");
    const [orderBy, setOrderBy] = useState<OrderBy>("AdSoyad");

    const [takimlar, setTakimlar] = useState<FilterItem[]>([]);
    const [birimler, setBirimler] = useState<FilterItem[]>([]);
    const [selectedTakim, setSelectedTakim] = useState<number>(ALL);
    const [selectedBirim, setSelectedBirim] = useState<number>(ALL);

    const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(null);

    async function fetchEmployees(search: string, takimId: number, birimId: number) {
        setLoading(true);
        try {
            const response: IEmployee[] = await requests.Rehber.list(
                search || undefined,
                takimId || undefined,
                birimId || undefined,
            );
            setEmployees(response ?? []);
        } catch {
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchEmployees("", ALL, ALL);
        requests.Rehber.BilgileriGetir()
            .then((res) => {
                setTakimlar(res?.takimlar ?? []);
                setBirimler(res?.birimler ?? []);
            })
            .catch(() => { });
    }, []);

    function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
        const v = e.target.value;
        setSearchTerm(v);
        fetchEmployees(v, selectedTakim, selectedBirim);
    }

    function handleTakimChange(e: SelectChangeEvent<number>) {
        const v = Number(e.target.value);
        setSelectedTakim(v);
        fetchEmployees(searchTerm, v, selectedBirim);
    }

    function handleBirimChange(e: SelectChangeEvent<number>) {
        const v = Number(e.target.value);
        setSelectedBirim(v);
        fetchEmployees(searchTerm, selectedTakim, v);
    }

    function toTitleCase(str: string) {
        return (str ?? "")
            .toLocaleLowerCase("tr-TR")
            .split(" ")
            .filter(Boolean)
            .map((w) => w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1))
            .join(" ");
    }

    function normalize(value: unknown) {
        return value === null || value === undefined ? "" : String(value);
    }

    function descendingComparator(a: IEmployee, b: IEmployee, key: OrderBy) {
        return normalize(b[key]).localeCompare(normalize(a[key]), "tr-TR", { sensitivity: "base" });
    }

    function getComparator(o: Order, key: OrderBy) {
        return o === "desc"
            ? (a: IEmployee, b: IEmployee) => descendingComparator(a, b, key)
            : (a: IEmployee, b: IEmployee) => -descendingComparator(a, b, key);
    }

    function stableSort(array: IEmployee[], cmp: (a: IEmployee, b: IEmployee) => number) {
        return array
            .map((el, i) => [el, i] as const)
            .sort((a, b) => cmp(a[0], b[0]) || a[1] - b[1])
            .map((el) => el[0]);
    }

    function handleRequestSort(property: OrderBy) {
        setOrder(orderBy === property && order === "asc" ? "desc" : "asc");
        setOrderBy(property);
    }

    function formatPhoneForCsv(raw: string): string {
        if (!raw || raw === "+90" || raw.replace(/\D/g, "").length < 7) return "-";
        if (raw.length !== 13 || !raw.startsWith("+90")) return raw;
        const d = raw.slice(3);
        return `+90 (${d.slice(0, 3)}) ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8)}`;
    }

    function handleExportCSV() {
        const header = ["Ad Soyad", "Birim", "Takım", "Dahili No", "İş Tel No"];
        const rows = sortedEmployees.map((e) => [
            toTitleCase(e.AdSoyad),
            e.Birim,
            e.Takim,
            e.DahiliNo || "-",
            formatPhoneForCsv(e.IsCepTelNo),
        ]);
        const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
        const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "fergani-rehber.csv";
        a.click();
        URL.revokeObjectURL(url);
    }

    const sortedEmployees = useMemo(
        () => stableSort(employees, getComparator(order, orderBy)),
        [employees, order, orderBy]
    );

    const headCells: { id: OrderBy; label: string }[] = [
        { id: "AdSoyad", label: "Ad Soyad" },
        { id: "Birim", label: "Birim" },
        { id: "Takim", label: "Takım" },
        { id: "DahiliNo", label: "Dahili No" },
        { id: "IsCepTelNo", label: "İş Tel No" },
    ];

    // const initials = (name: string) =>
    //     name.split(" ").filter(Boolean).slice(0, 2)
    //         .map((w) => w[0].toLocaleUpperCase("tr-TR")).join("");

    return (
        <>
            {/* Filtre satırı */}
            <Grid2 container spacing={2} sx={{ mb: 2 }} alignItems="center">
                <Grid2 size={{ xs: 12, sm: 6 }}>
                    <TextField label="Çalışan Ara" fullWidth value={searchTerm} onChange={handleSearch} />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 3 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Takım</InputLabel>
                        <Select value={selectedTakim} label="Takım" onChange={handleTakimChange}>
                            <MenuItem value={ALL}>Tüm Takımlar</MenuItem>
                            {takimlar.map((t) => <MenuItem key={t.id} value={t.id}>{t.aciklama}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 3 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Birim</InputLabel>
                        <Select value={selectedBirim} label="Birim" onChange={handleBirimChange}>
                            <MenuItem value={ALL}>Tüm Birimler</MenuItem>
                            {birimler.map((b) => <MenuItem key={b.id} value={b.id}>{b.aciklama}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid2>
            </Grid2>

            {/* CSV butonu — sadece giriş yapmış kullanıcılar */}
            {user && sortedEmployees.length > 0 && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                    <Button variant="outlined" size="small" startIcon={<Download />} onClick={handleExportCSV}>
                        CSV İndir
                    </Button>
                </Box>
            )}

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 850 }} aria-label="rehber tablo">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell sx={{ width: 48 }} />
                                {headCells.map((h) => (
                                    <StyledTableCell key={h.id} sortDirection={orderBy === h.id ? order : false}>
                                        <TableSortLabel
                                            active={orderBy === h.id}
                                            direction={orderBy === h.id ? order : "asc"}
                                            onClick={() => handleRequestSort(h.id)}
                                            sx={{
                                                color: "inherit",
                                                "&.Mui-active": { color: "inherit" },
                                                "&:hover": { color: "inherit" },
                                                "& .MuiTableSortLabel-icon": { color: "inherit !important" },
                                            }}
                                        >
                                            {h.label}
                                        </TableSortLabel>
                                    </StyledTableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedEmployees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: "text.secondary" }}>
                                        Arama kriterlerine uygun çalışan bulunamadı.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedEmployees.map((item, index) => (
                                    <StyledTableRow
                                        key={(item as any).Id ?? index}
                                        onClick={() => setSelectedEmployee(item)}
                                    >
                                        <StyledTableCell component="th"><EmployeeAvatar
                                            fotoUrl={item.FotoUrl}
                                            name={item.AdSoyad}
                                            size={36}
                                        /></StyledTableCell>
                                        <StyledTableCell component="th">{toTitleCase(item.AdSoyad)}</StyledTableCell>
                                        <StyledTableCell>{item.Birim}</StyledTableCell>
                                        <StyledTableCell>{item.Takim}</StyledTableCell>
                                        <StyledTableCell>{item.DahiliNo || "-"}</StyledTableCell>
                                        <StyledTableCell>{formatPhoneNumber(item.IsCepTelNo)}</StyledTableCell>
                                    </StyledTableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Çalışan Detay Kartı */}
            <Dialog
                open={!!selectedEmployee}
                onClose={() => setSelectedEmployee(null)}
                maxWidth="xs"
                fullWidth
            >
                {selectedEmployee && (
                    <>
                        <DialogTitle sx={{ pb: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Typography variant="h6" fontWeight={700}>Çalışan Detayı</Typography>
                                <IconButton size="small" onClick={() => setSelectedEmployee(null)}>
                                    <Close fontSize="small" />
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        <Divider />
                        <DialogContent>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 2, gap: 1 }}>
                                <EmployeeAvatar
                                    fotoUrl={selectedEmployee.FotoUrl}
                                    name={selectedEmployee.AdSoyad}
                                    size={128}
                                />
                                <Typography variant="h6" fontWeight={700}>
                                    {toTitleCase(selectedEmployee.AdSoyad)}
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={1.5}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                    <Business fontSize="small" color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Birim</Typography>
                                        <Typography variant="body2" fontWeight={600}>{selectedEmployee.Birim}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                    <Groups fontSize="small" color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Takım</Typography>
                                        <Typography variant="body2" fontWeight={600}>{selectedEmployee.Takim}</Typography>
                                    </Box>
                                </Box>
                                {selectedEmployee.DahiliNo && selectedEmployee.DahiliNo !== "-" && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Dialpad fontSize="small" color="action" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Dahili No</Typography>
                                            <Typography variant="body2" fontWeight={600}>{selectedEmployee.DahiliNo}</Typography>
                                        </Box>
                                    </Box>
                                )}
                                {selectedEmployee.IsCepTelNo && selectedEmployee.IsCepTelNo !== "-" && (
                                    <Box
                                        component="a"
                                        href={`tel:${selectedEmployee.IsCepTelNo}`}
                                        sx={{ display: "flex", alignItems: "center", gap: 1.5, textDecoration: "none", color: "inherit" }}
                                    >
                                        <Phone fontSize="small" color="action" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">İş Telefonu</Typography>
                                            <Typography variant="body2" fontWeight={600} sx={{ color: "primary.main" }}>
                                                {formatPhoneNumber(selectedEmployee.IsCepTelNo)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Stack>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </>
    );
}

export default HomePage;
