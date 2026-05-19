import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { Delete, PersonAdd } from "@mui/icons-material";
import { useEffect, useState } from "react";
import requests from "../../api/requests";
import { toast } from "react-toastify";

type AdminUser = { id: string; name: string; userName: string };

function KullaniciYonetimi() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [form, setForm] = useState({ Name: "", UserName: "", Email: "", Password: "" });

    const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
    const [onayMetni, setOnayMetni] = useState("");

    async function loadUsers() {
        setLoading(true);
        try {
            const data = await requests.Account.getUsers();
            setUsers(data ?? []);
        } catch {
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadUsers(); }, []);

    function handleAddOpen() {
        setForm({ Name: "", UserName: "", Email: "", Password: "" });
        setAddDialogOpen(true);
    }

    async function handleAddSave() {
        try {
            await requests.Account.register(form);
            toast.success(`"${form.Name}" adlı admin başarıyla eklendi.`);
            setAddDialogOpen(false);
            loadUsers();
        } catch {
            toast.error("Admin eklenirken hata oluştu.");
        }
    }

    function handleDeleteOpen(user: AdminUser) {
        setDeleteTarget(user);
        setOnayMetni("");
    }

    async function handleDeleteConfirm() {
        if (!deleteTarget) return;
        try {
            await requests.Account.deleteUser(deleteTarget.id);
            toast.success(`"${deleteTarget.name}" adlı admin silindi.`);
            setDeleteTarget(null);
            loadUsers();
        } catch {
            toast.error("Silme işlemi başarısız oldu.");
        }
    }

    return (
        <>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, mb: 2 }}>
                <Button variant="contained" startIcon={<PersonAdd />} onClick={handleAddOpen}>
                    Yeni Admin Ekle
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Ad</TableCell>
                                <TableCell>Kullanıcı Adı</TableCell>
                                <TableCell align="center">İşlem</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 5, color: "text.secondary" }}>
                                        Kayıt bulunamadı.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell>{u.name}</TableCell>
                                        <TableCell>{u.userName}</TableCell>
                                        <TableCell align="center">
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={() => handleDeleteOpen(u)}
                                            >
                                                <Delete fontSize="small" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Yeni Admin Ekle Dialogu */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>Yeni Admin Ekle</Typography>
                </DialogTitle>
                <Divider />
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField label="Ad Soyad" fullWidth value={form.Name}
                            onChange={(e) => setForm((p) => ({ ...p, Name: e.target.value }))} />
                        <TextField label="Kullanıcı Adı" fullWidth value={form.UserName}
                            onChange={(e) => setForm((p) => ({ ...p, UserName: e.target.value }))} />
                        <TextField label="E-posta" type="email" fullWidth value={form.Email}
                            onChange={(e) => setForm((p) => ({ ...p, Email: e.target.value }))} />
                        <TextField label="Şifre" type="password" fullWidth value={form.Password}
                            onChange={(e) => setForm((p) => ({ ...p, Password: e.target.value }))} />
                    </Stack>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button onClick={() => setAddDialogOpen(false)} variant="outlined" color="inherit">İptal</Button>
                    <Button onClick={handleAddSave} variant="contained">Ekle</Button>
                </DialogActions>
            </Dialog>

            {/* Silme Onay Dialogu */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight={700} color="error">Admin Hesabı Sil</Typography>
                </DialogTitle>
                <Divider />
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Typography>
                            <strong>{deleteTarget?.name}</strong> ({deleteTarget?.userName}) adlı admin hesabı
                            kalıcı olarak silinecek ve bu işlem kayıt altına alınacaktır.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Onaylamak için aşağıya <strong>Onaylıyorum</strong> yazın:
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Onaylıyorum"
                            value={onayMetni}
                            onChange={(e) => setOnayMetni(e.target.value)}
                        />
                    </Stack>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button onClick={() => setDeleteTarget(null)} variant="outlined" color="inherit">İptal</Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        disabled={onayMetni !== "Onaylıyorum"}
                    >
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default KullaniciYonetimi;
