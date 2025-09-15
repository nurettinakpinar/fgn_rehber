import { CircularProgress, Paper, Table, TableBody, TableCell,TableContainer,TableHead,TableRow,TextField,Stack,} from "@mui/material";
import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import requests from "../api/requests";
import formatPhoneNumber from "../utils/formatter";
import { IEmployee } from "../models/IEmployee"; // <-- TIPI İÇE AKTAR

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
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

function HomePage() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [employees, setEmployees] = useState<IEmployee[]>([]); // <-- TIPI BELIRT
    const [loading, setLoading] = useState<boolean>(false);

    // API'den veriyi çekme (Arama desteği ile)
    async function fetchEmployees(search: string, takimEnum?: number) {
        setLoading(true);
        try {
            const response: IEmployee[] = await requests.Rehber.list(search, takimEnum);
            setEmployees(response ?? []);
        } catch (error) {
            console.error("Çalışanlar alınırken hata oluştu:", error);
            setEmployees([]); // güvenli fallback
        } finally {
            setLoading(false);
        }
    }

    // İlk yüklemede tüm çalışanları getir
    useEffect(() => {
        fetchEmployees("");
    }, []);

    // Kullanıcı arama yaptıkça API çağrısı yap
    function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        setSearchTerm(value);
        fetchEmployees(value);
    }

    function toTitleCase(str: string) {
        return str
            .toLocaleLowerCase("tr-TR")
            .split(" ")
            .filter(Boolean)
            .map((word) => word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1))
            .join(" ");
    }

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
                                <StyledTableCell>Ad Soyad</StyledTableCell>
                                <StyledTableCell>Birim</StyledTableCell>
                                <StyledTableCell align="left">Takım</StyledTableCell>
                                <StyledTableCell align="left">Dahili No</StyledTableCell>
                                <StyledTableCell align="left">İş Tel No</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {employees.map((item: IEmployee, index: number) => (
                                <StyledTableRow key={index}>
                                    <StyledTableCell component="th" align="left">
                                        {toTitleCase(item.AdSoyad)}
                                    </StyledTableCell>
                                    <StyledTableCell>{item.Birim}</StyledTableCell>
                                    <StyledTableCell align="left">{item.Takim}</StyledTableCell>
                                    <StyledTableCell align="left">{item.DahiliNo}</StyledTableCell>
                                    <StyledTableCell align="left">
                                        {formatPhoneNumber(item.IsCepTelNo)}
                                    </StyledTableCell>
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