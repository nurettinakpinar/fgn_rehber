import {
    CircularProgress,
    FormControl,
    Grid2,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    TableSortLabel,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import requests from "../api/requests";
import formatPhoneNumber from "../utils/formatter";
import { IEmployee } from "../models/IEmployee";

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
    "&:nth-of-type(odd)": { backgroundColor: theme.palette.action.hover },
    "&:last-child td, &:last-child th": { border: 0 },
}));

type Order = "asc" | "desc";
type OrderBy = keyof Pick<IEmployee, "AdSoyad" | "Birim" | "Takim" | "DahiliNo" | "IsCepTelNo">;

type TakimItem = { id: number; aciklama: string };

const ALL_TEAMS = 0;

function HomePage() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [order, setOrder] = useState<Order>("asc");
    const [orderBy, setOrderBy] = useState<OrderBy>("AdSoyad");
    const [takimlar, setTakimlar] = useState<TakimItem[]>([]);
    const [selectedTakim, setSelectedTakim] = useState<number>(ALL_TEAMS);

    async function fetchEmployees(search: string, takimId?: number) {
        setLoading(true);
        try {
            const response: IEmployee[] = await requests.Rehber.list(
                search,
                takimId && takimId !== ALL_TEAMS ? takimId : undefined
            );
            setEmployees(response ?? []);
        } catch (error) {
            console.error("Çalışanlar alınırken hata oluştu:", error);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchEmployees("");
        requests.Rehber.BilgileriGetir()
            .then((res) => setTakimlar(res?.takimlar ?? []))
            .catch(() => setTakimlar([]));
    }, []);

    function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        setSearchTerm(value);
        fetchEmployees(value, selectedTakim);
    }

    function handleTakimChange(event: SelectChangeEvent<number>) {
        const value = Number(event.target.value);
        setSelectedTakim(value);
        fetchEmployees(searchTerm, value);
    }

    function toTitleCase(str: string) {
        return (str ?? "")
            .toLocaleLowerCase("tr-TR")
            .split(" ")
            .filter(Boolean)
            .map((word) => word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1))
            .join(" ");
    }

    function normalize(value: unknown) {
        if (value === null || value === undefined) return "";
        return String(value);
    }

    function descendingComparator(a: IEmployee, b: IEmployee, orderByKey: OrderBy) {
        return normalize(b[orderByKey]).localeCompare(normalize(a[orderByKey]), "tr-TR", { sensitivity: "base" });
    }

    function getComparator(order: Order, orderByKey: OrderBy) {
        return order === "desc"
            ? (a: IEmployee, b: IEmployee) => descendingComparator(a, b, orderByKey)
            : (a: IEmployee, b: IEmployee) => -descendingComparator(a, b, orderByKey);
    }

    function stableSort(array: IEmployee[], comparator: (a: IEmployee, b: IEmployee) => number) {
        return array
            .map((el, index) => [el, index] as const)
            .sort((a, b) => {
                const res = comparator(a[0], b[0]);
                return res !== 0 ? res : a[1] - b[1];
            })
            .map((el) => el[0]);
    }

    function handleRequestSort(property: OrderBy) {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
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

    return (
        <>
            <Grid2 container spacing={2} sx={{ mb: 2 }}>
                <Grid2 size={{ xs: 12, sm: 8 }}>
                    <TextField
                        label="Çalışan Ara"
                        fullWidth
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="takim-filter-label">Takım</InputLabel>
                        <Select
                            labelId="takim-filter-label"
                            value={selectedTakim}
                            label="Takım"
                            onChange={handleTakimChange}
                        >
                            <MenuItem value={ALL_TEAMS}>Tüm Takımlar</MenuItem>
                            {takimlar.map((t) => (
                                <MenuItem key={t.id} value={t.id}>
                                    {t.aciklama}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid2>
            </Grid2>

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 850 }} aria-label="rehber tablo">
                        <TableHead>
                            <TableRow>
                                {headCells.map((headCell) => (
                                    <StyledTableCell
                                        key={headCell.id}
                                        sortDirection={orderBy === headCell.id ? order : false}
                                    >
                                        <TableSortLabel
                                            active={orderBy === headCell.id}
                                            direction={orderBy === headCell.id ? order : "asc"}
                                            onClick={() => handleRequestSort(headCell.id)}
                                            sx={{
                                                color: "inherit",
                                                "&.Mui-active": { color: "inherit" },
                                                "&:hover": { color: "inherit" },
                                                "& .MuiTableSortLabel-icon": { color: "inherit !important" },
                                            }}
                                        >
                                            {headCell.label}
                                        </TableSortLabel>
                                    </StyledTableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {sortedEmployees.map((item: IEmployee, index: number) => (
                                <StyledTableRow key={(item as any).Id ?? index}>
                                    <StyledTableCell component="th">
                                        {toTitleCase(item.AdSoyad)}
                                    </StyledTableCell>
                                    <StyledTableCell>{item.Birim}</StyledTableCell>
                                    <StyledTableCell>{item.Takim}</StyledTableCell>
                                    <StyledTableCell>{item.DahiliNo}</StyledTableCell>
                                    <StyledTableCell>{formatPhoneNumber(item.IsCepTelNo)}</StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </>
    );
}

export default HomePage;
