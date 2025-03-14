import { Box, Button, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { employeeSelector, fetchEmployees, yeniCalisanTalepOnayla, yeniCalisanTalepReddet } from "../../redux/employeeSlice";
import { useEffect } from "react";
import { Check, Close } from "@mui/icons-material";

function AdminPage() {
    const { status, isLoaded } = useAppSelector(state => state.employee);
    const dispatch = useAppDispatch();

    const employees = useAppSelector(employeeSelector.selectAll)
    const user = true;
    useEffect(() => {
        if (!isLoaded) {
            dispatch(fetchEmployees());
        }
    }, [isLoaded]);


    return (
        <>
            {
                status === "loading" ? (
                    <CircularProgress />
                ) : (
                    <TableContainer component={Paper} >
                        <Table sx={{ minWidth: 850 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>Ad Soyad</TableCell>
                                    <TableCell>Birim</TableCell>
                                    <TableCell align="center">Takım</TableCell>
                                    <TableCell align="center">Dahili No</TableCell>
                                    <TableCell align="center">İş Tel No</TableCell>
                                    <TableCell align="center"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {

                                    employees.map((item) => (
                                        item.TalepDurum === "BEKLEMEDE" &&
                                        < TableRow key={item.Id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell >{item.Id}</TableCell>
                                            <TableCell component="th" align="left">{item.AdSoyad}</TableCell>
                                            <TableCell>{item.Birim}</TableCell>
                                            <TableCell align="center">{item.Takim}</TableCell>
                                            <TableCell align="center">{item.DahiliNo}</TableCell>
                                            <TableCell align="center">{item.IsCepTelNo}</TableCell>
                                            <TableCell align="center">

                                                <Box>
                                                    <Button onClick={() => dispatch(yeniCalisanTalepOnayla({ CalisanId: item.Id }))}
                                                            loading={status === "pendingYeniCalisanTalepOnayla" + item.Id}
                                                            variant="outlined"
                                                            color="success" sx={{ mr: 2 }}>
                                                        <Check />
                                                    </Button>

                                                    <Button onClick={() => dispatch(yeniCalisanTalepReddet({ CalisanId: item.Id }))}
                                                            loading={status === "pendingYeniCalisanTalepOnayla" + item.Id}
                                                            variant="outlined" color="error" >
                                                        <Close />
                                                    </Button>
                                                </Box>

                                            </TableCell>
                                        </TableRow>
                                    ))}

                            </TableBody>
                        </Table>
                    </TableContainer >
                )
            }
        </>
    );
}

export default AdminPage;