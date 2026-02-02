import {
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Stack,
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

        // ✅ sort label renklerini sabitle
        "& .MuiTableSortLabel-root": {
            color: theme.palette.common.white,
        },
        "& .MuiTableSortLabel-root:hover": {
            color: theme.palette.common.white,
        },
        "& .MuiTableSortLabel-root.Mui-active": {
            color: theme.palette.common.white,
        },
        "& .MuiTableSortLabel-icon": {
            color: `${theme.palette.common.white} !important`,
        },
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
    },
    "&:last-child td, &:last-child th": {
        border: 0,
    },
}));

type Order = "asc" | "desc";
type OrderBy = keyof Pick<
    IEmployee,
    "AdSoyad" | "Birim" | "Takim" | "DahiliNo" | "IsCepTelNo"
>;

function HomePage() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [order, setOrder] = useState<Order>("asc");
    const [orderBy, setOrderBy] = useState<OrderBy>("AdSoyad");

    async function fetchEmployees(search: string, takimEnum?: number) {
        setLoading(true);
        try {
            const response: IEmployee[] = await requests.Rehber.list(search, takimEnum);
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
    }, []);

    function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        setSearchTerm(value);
        fetchEmployees(value);
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
        const aVal = normalize(a[orderByKey]);
        const bVal = normalize(b[orderByKey]);

        const cmp = bVal.localeCompare(aVal, "tr-TR", { sensitivity: "base" });
        return cmp;
    }

    function getComparator(order: Order, orderByKey: OrderBy) {
        return order === "desc"
            ? (a: IEmployee, b: IEmployee) => descendingComparator(a, b, orderByKey)
            : (a: IEmployee, b: IEmployee) => -descendingComparator(a, b, orderByKey);
    }

    function stableSort(array: IEmployee[], comparator: (a: IEmployee, b: IEmployee) => number) {
        const stabilized = array.map((el, index) => [el, index] as const);
        stabilized.sort((a, b) => {
            const orderRes = comparator(a[0], b[0]);
            if (orderRes !== 0) return orderRes;
            return a[1] - b[1];
        });
        return stabilized.map((el) => el[0]);
    }

    function handleRequestSort(property: OrderBy) {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    }

    const sortedEmployees = useMemo(() => {
        return stableSort(employees, getComparator(order, orderBy));
    }, [employees, order, orderBy]);

    const headCells: { id: OrderBy; label: string; align?: "left" | "right" | "center" }[] = [
        { id: "AdSoyad", label: "Ad Soyad", align: "left" },
        { id: "Birim", label: "Birim", align: "left" },
        { id: "Takim", label: "Takım", align: "left" },
        { id: "DahiliNo", label: "Dahili No", align: "left" },
        { id: "IsCepTelNo", label: "İş Tel No", align: "left" },
    ];

    return (
        <>
            <Stack spacing={2} sx={{ mb: 2 }}>
                <TextField
                    label="Çalışan Ara"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </Stack>

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
                                        align={headCell.align ?? "left"}
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
                                    <StyledTableCell component="th" align="left">
                                        {toTitleCase(item.AdSoyad)}
                                    </StyledTableCell>
                                    <StyledTableCell>{item.Birim}</StyledTableCell>
                                    <StyledTableCell align="left">{item.Takim}</StyledTableCell>
                                    <StyledTableCell align="left">{item.DahiliNo}</StyledTableCell>
                                    <StyledTableCell align="left">{formatPhoneNumber(item.IsCepTelNo)}</StyledTableCell>
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
