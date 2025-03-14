import { CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { employeeSelector, fetchEmployees } from "../redux/employeeSlice";
import { useEffect } from "react";

function HomePage() {
    const { status, isLoaded } = useAppSelector(state => state.employee);
    const dispatch = useAppDispatch();

    const employees = useAppSelector(employeeSelector.selectAll)

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
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                    {employees.map((item) => (item.TalepDurum === "ONAY" &&
                                    <TableRow key={item.Id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" align="left">{item.Id}</TableCell>
                                        <TableCell component="th" align="left">{item.AdSoyad}</TableCell>
                                        <TableCell>{item.Birim}</TableCell>
                                        <TableCell align="center">{item.Takim}</TableCell>
                                        <TableCell align="center">{item.DahiliNo}</TableCell>
                                        <TableCell align="center">{item.IsCepTelNo}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )
            }
        </>
    );
}

export default HomePage;