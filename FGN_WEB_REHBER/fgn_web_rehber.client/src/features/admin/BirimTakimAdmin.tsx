import { Box, Stack, TextField, Button } from "@mui/material";
import { useState, useEffect } from "react";
import requests from "../../api/requests";

export function BirimTakimAdmin() {
    const [birimler, setBirimler] = useState<any[]>([]);
    const [takimlar, setTakimlar] = useState<any[]>([]);
    const [newBirim, setNewBirim] = useState("");
    const [newTakim, setNewTakim] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const b = await requests.Admin.getBirimler();
        const t = await requests.Admin.getTakimlar();
        setBirimler(b);
        setTakimlar(t);
    };

    const addBirim = async () => {
        await requests.Admin.birimEkle(newBirim);
        setNewBirim("");
        loadData();
    };

    const addTakim = async () => {
        await requests.Admin.takimEkle(newTakim);
        setNewTakim("");
        loadData();
    };

    return (
        <Box sx={{ p: 3 }}>
            <h3>Birimler</h3>
            <Stack direction="row" spacing={2}>
                <TextField
                    label="Yeni Birim"
                    value={newBirim}
                    onChange={(e) => setNewBirim(e.target.value)}
                />
                <Button variant="contained" onClick={addBirim}>
                    Ekle
                </Button>
            </Stack>

            <ul>
                {birimler.map(b => (
                    <li key={b.id}>{b.aciklama}</li>
                ))}
            </ul>

            <h3>Takımlar</h3>
            <Stack direction="row" spacing={2}>
                <TextField
                    label="Yeni Takım"
                    value={newTakim}
                    onChange={(e) => setNewTakim(e.target.value)}
                />
                <Button variant="contained" onClick={addTakim}>
                    Ekle
                </Button>
            </Stack>

            <ul>
                {takimlar.map(t => (
                    <li key={t.id}>{t.aciklama}</li>
                ))}
            </ul>
        </Box>
    );
}
