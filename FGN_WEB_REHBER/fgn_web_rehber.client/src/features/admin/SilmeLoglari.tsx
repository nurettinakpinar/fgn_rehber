import {
    Box,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import requests from "../../api/requests";

type SilmeLog = {
    id: number;
    silinenKullaniciAdi: string;
    silinenAd: string;
    silenKullaniciAdi: string;
    silenAd: string;
    islemZamani: string;
};

function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString("tr-TR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function SilmeLoglari() {
    const [logs, setLogs] = useState<SilmeLog[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        requests.Account.getDeleteLogs()
            .then((data) => setLogs(data ?? []))
            .catch(() => setLogs([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Admin Silme İşlemi Geçmişi
            </Typography>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Silinen Admin</TableCell>
                                <TableCell>Silinen Kullanıcı Adı</TableCell>
                                <TableCell>Silen Admin</TableCell>
                                <TableCell>Silen Kullanıcı Adı</TableCell>
                                <TableCell>İşlem Tarihi</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 5, color: "text.secondary" }}>
                                        Henüz silme işlemi gerçekleştirilmemiş.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>{log.silinenAd}</TableCell>
                                        <TableCell sx={{ color: "text.secondary" }}>{log.silinenKullaniciAdi}</TableCell>
                                        <TableCell>{log.silenAd}</TableCell>
                                        <TableCell sx={{ color: "text.secondary" }}>{log.silenKullaniciAdi}</TableCell>
                                        <TableCell>{formatDate(log.islemZamani)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}

export default SilmeLoglari;
