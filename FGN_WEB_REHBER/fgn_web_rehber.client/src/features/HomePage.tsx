import { CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import requests from "../api/requests"; // 📌 requests ile API çağıracağız
import formatPhoneNumber from "../utils/formatter";

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
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

function HomePage() {
    const [searchTerm, setSearchTerm] = useState("");   // Arama terimini saklamak için state
    const [employees, setEmployees] = useState([]);     // Çalışan listesini saklamak için state
    const [loading, setLoading] = useState(false);      // Yüklenme durumunu takip et

    // 📌 API'den veriyi çekme fonksiyonu (Arama desteği ile)
    async function fetchEmployees(search: string, takimEnum?: number) {
        setLoading(true);
        try {
            const response = await requests.Rehber.list(search, takimEnum);
            setEmployees(response);
        } catch (error) {
            console.error("Çalışanlar alınırken hata oluştu:", error);
        }
        setLoading(false);
    }

    // İlk sayfa yüklendiğinde tüm çalışanları getir
    useEffect(() => {
        fetchEmployees("");
    }, []);

    // nKullanıcı arama yaptıkça API çağrısı yap
    function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        setSearchTerm(value);
        fetchEmployees(value); // API'den güncellenmiş listeyi çek
    }
    function toTitleCase(str: string) {
        return str
            .toLocaleLowerCase('tr-TR')
            .split(' ')
            .map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
            .join(' ');
    }

    return (
        <>
            <Stack spacing={2} sx={{ mb: 2 }}>
                {/* Arama Çubuğu */}
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
                    <Table sx={{ minWidth: 850 }} aria-label="simple table">
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
                            {employees.map((item, index) => (
                                <StyledTableRow key={index}>
                                    <StyledTableCell component="th" align="left">{toTitleCase(item.AdSoyad)}</StyledTableCell>
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
