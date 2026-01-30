import {
    Box,
    Stack,
    TextField,
    Button,
    Switch,
    Card,
    CardHeader,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Chip,
    Typography,
    IconButton,
    Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useMemo, useState } from "react";
import requests from "../../api/requests";

type Item = { id: number; aciklama: string; active: boolean };

export function BirimTakimAdmin() {
    const [birimler, setBirimler] = useState<Item[]>([]);
    const [takimlar, setTakimlar] = useState<Item[]>([]);
    const [newBirim, setNewBirim] = useState("");
    const [newTakim, setNewTakim] = useState("");

    // edit state: id -> yeni aciklama
    const [editBirim, setEditBirim] = useState<Record<number, string>>({});
    const [editTakim, setEditTakim] = useState<Record<number, string>>({});

    const loadData = async () => {
        const b = await requests.Admin.getBirimler();
        const t = await requests.Admin.getTakimlar();
        setBirimler(b);
        setTakimlar(t);
    };

    useEffect(() => {
        loadData();
    }, []);

    const birimStats = useMemo(() => {
        const active = birimler.filter(x => x.active).length;
        return { active, passive: birimler.length - active, total: birimler.length };
    }, [birimler]);

    const takimStats = useMemo(() => {
        const active = takimlar.filter(x => x.active).length;
        return { active, passive: takimlar.length - active, total: takimlar.length };
    }, [takimlar]);

    const addBirim = async () => {
        const value = newBirim.trim();
        if (!value) return;
        await requests.Admin.birimEkle(value);
        setNewBirim("");
        loadData();
    };

    const addTakim = async () => {
        const value = newTakim.trim();
        if (!value) return;
        await requests.Admin.takimEkle(value);
        setNewTakim("");
        loadData();
    };

    // ---- BIRIM ----
    const startEditBirim = (id: number, current: string) =>
        setEditBirim(prev => ({ ...prev, [id]: current }));

    const cancelEditBirim = (id: number) =>
        setEditBirim(prev => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });

    const saveBirim = async (id: number) => {
        const value = (editBirim[id] ?? "").trim();
        if (!value) return;
        // ✅ doğru fonksiyon adı
        await requests.Admin.birimAciklamaGuncelle(id, value);
        cancelEditBirim(id);
        loadData();
    };

    const toggleBirimActive = async (id: number, active: boolean) => {
        await requests.Admin.birimActiveGuncelle(id, active);
        loadData();
    };

    // ---- TAKIM ----
    const startEditTakim = (id: number, current: string) =>
        setEditTakim(prev => ({ ...prev, [id]: current }));

    const cancelEditTakim = (id: number) =>
        setEditTakim(prev => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });

    const saveTakim = async (id: number) => {
        const value = (editTakim[id] ?? "").trim();
        if (!value) return;
        // ✅ doğru fonksiyon adı
        await requests.Admin.takimAciklamaGuncelle(id, value);
        cancelEditTakim(id);
        loadData();
    };

    const toggleTakimActive = async (id: number, active: boolean) => {
        await requests.Admin.takimActiveGuncelle(id, active);
        loadData();
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                Birim & Takım Yönetimi
            </Typography>

            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                Buradan birim/takım ekleyebilir, isimlerini güncelleyebilir ve aktif/pasif durumlarını değiştirebilirsin.
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
                {/* ----------- BIRIMLER CARD ----------- */}
                <Card sx={{ flex: 1 }}>
                    <CardHeader
                        title="Birimler"
                        subheader={
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                                <Chip size="small" label={`Toplam: ${birimStats.total}`} />
                                <Chip size="small" label={`Aktif: ${birimStats.active}`} />
                                <Chip size="small" label={`Pasif: ${birimStats.passive}`} variant="outlined" />
                            </Stack>
                        }
                    />
                    <CardContent>
                        <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Yeni Birim"
                                value={newBirim}
                                onChange={(e) => setNewBirim(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") addBirim();
                                }}
                            />
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={addBirim}
                                disabled={!newBirim.trim()}
                            >
                                Ekle
                            </Button>
                        </Stack>

                        <Divider sx={{ mb: 1 }} />

                        <List dense>
                            {birimler.map((b) => {
                                const isEditing = editBirim[b.id] !== undefined;

                                return (
                                    <ListItem
                                        key={b.id}
                                        sx={{
                                            borderRadius: 1,
                                            mb: 0.5,
                                            bgcolor: "background.paper",
                                            opacity: b.active ? 1 : 0.65,
                                        }}
                                    >
                                        <Switch
                                            checked={b.active}
                                            onChange={(_, checked) => toggleBirimActive(b.id, checked)}
                                        />

                                        {isEditing ? (
                                            <TextField
                                                size="small"
                                                value={editBirim[b.id]}
                                                onChange={(e) =>
                                                    setEditBirim((prev) => ({ ...prev, [b.id]: e.target.value }))
                                                }
                                                sx={{ flex: 1, mr: 1 }}
                                            />
                                        ) : (
                                            <ListItemText
                                                primary={
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Typography sx={{ fontWeight: 600 }}>{b.aciklama}</Typography>
                                                        {!b.active && <Chip size="small" label="Pasif" variant="outlined" />}
                                                    </Stack>
                                                }
                                            />
                                        )}

                                        <ListItemSecondaryAction>
                                            {isEditing ? (
                                                <Stack direction="row" spacing={0.5}>
                                                    <Tooltip title="Kaydet">
                                                        <span>
                                                            <IconButton onClick={() => saveBirim(b.id)} disabled={!editBirim[b.id]?.trim()}>
                                                                <SaveIcon />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title="İptal">
                                                        <IconButton onClick={() => cancelEditBirim(b.id)}>
                                                            <CloseIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            ) : (
                                                <Tooltip title="Düzenle">
                                                    <IconButton onClick={() => startEditBirim(b.id, b.aciklama)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </CardContent>
                </Card>

                {/* ----------- TAKIMLAR CARD ----------- */}
                <Card sx={{ flex: 1 }}>
                    <CardHeader
                        title="Takımlar"
                        subheader={
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                                <Chip size="small" label={`Toplam: ${takimStats.total}`} />
                                <Chip size="small" label={`Aktif: ${takimStats.active}`} />
                                <Chip size="small" label={`Pasif: ${takimStats.passive}`} variant="outlined" />
                            </Stack>
                        }
                    />
                    <CardContent>
                        <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Yeni Takım"
                                value={newTakim}
                                onChange={(e) => setNewTakim(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") addTakim();
                                }}
                            />
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={addTakim}
                                disabled={!newTakim.trim()}
                            >
                                Ekle
                            </Button>
                        </Stack>

                        <Divider sx={{ mb: 1 }} />

                        <List dense>
                            {takimlar.map((t) => {
                                const isEditing = editTakim[t.id] !== undefined;

                                return (
                                    <ListItem
                                        key={t.id}
                                        sx={{
                                            borderRadius: 1,
                                            mb: 0.5,
                                            bgcolor: "background.paper",
                                            opacity: t.active ? 1 : 0.65,
                                        }}
                                    >
                                        <Switch
                                            checked={t.active}
                                            onChange={(_, checked) => toggleTakimActive(t.id, checked)}
                                        />

                                        {isEditing ? (
                                            <TextField
                                                size="small"
                                                value={editTakim[t.id]}
                                                onChange={(e) =>
                                                    setEditTakim((prev) => ({ ...prev, [t.id]: e.target.value }))
                                                }
                                                sx={{ flex: 1, mr: 1 }}
                                            />
                                        ) : (
                                            <ListItemText
                                                primary={
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Typography sx={{ fontWeight: 600 }}>{t.aciklama}</Typography>
                                                        {!t.active && <Chip size="small" label="Pasif" variant="outlined" />}
                                                    </Stack>
                                                }
                                            />
                                        )}

                                        <ListItemSecondaryAction>
                                            {isEditing ? (
                                                <Stack direction="row" spacing={0.5}>
                                                    <Tooltip title="Kaydet">
                                                        <span>
                                                            <IconButton onClick={() => saveTakim(t.id)} disabled={!editTakim[t.id]?.trim()}>
                                                                <SaveIcon />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title="İptal">
                                                        <IconButton onClick={() => cancelEditTakim(t.id)}>
                                                            <CloseIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            ) : (
                                                <Tooltip title="Düzenle">
                                                    <IconButton onClick={() => startEditTakim(t.id, t.aciklama)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
}