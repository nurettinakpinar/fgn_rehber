import { Container, CssBaseline} from '@mui/material';
import Header from './layout/Header';
import { Outlet } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { useAppDispatch } from './redux/store';
import { useEffect, useState } from 'react';
import { getUser } from './redux/AccountSlice';

export default function App() {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(true);

    const initApp = async () => {
        await dispatch(getUser())
    }

    useEffect(() => {

        initApp().then(() => setLoading(false));

    }, []);

    return (
        <>
            <ToastContainer position="bottom-right" hideProgressBar theme="colored" />

            <CssBaseline />
            <Header />
            <Container>
                <Outlet />
            </Container>
        </>
    );

}
