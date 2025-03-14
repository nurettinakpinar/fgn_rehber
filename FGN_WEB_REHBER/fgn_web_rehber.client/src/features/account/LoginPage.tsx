import { LockOutlined } from "@mui/icons-material";
import { Avatar, Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import { FieldValues, useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { loginUser } from "../../redux/AccountSlice";


export default function LoginPage() {

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { user } = useAppSelector(state => state.account);
    const location = useLocation();

    const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm({
        defaultValues: {
            username: "",
            password: ""
        }
    });

    async function submitForm(data: FieldValues) {
        await dispatch(loginUser(data));
        navigate(location.state?.from || "/admin");
    }

    if (user) {
        return <Navigate to={"/admin"}></Navigate>
    }

    return (
        <Container maxWidth="xs">
            <Paper sx={{ mt: 8, padding: 2 }} elevation={3}>
                <Avatar sx={{ mx: "auto", color: "primary.main", textAlign: "center", mb: 1 }}>
                    <LockOutlined />
                </Avatar>

                <Typography component="h1" variant="h5" sx={{ textAlign: "center" }}>Giriş Yap</Typography>

                <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate sx={{ mt: 2 }}>
                    <TextField {...register("username", { required: { value: true, message: "Kullanıcı Adını Giriniz!" } })}
                        label="Kullanıcı Adı"
                        size="small"
                        fullWidth
                        autoFocus
                        sx={{ mb: 2 }}
                        error={!!errors.username}
                        helperText={errors.username?.message}></TextField>
                    <TextField {...register("password", { required: { value: true, message: "Parolanızı Giriniz!" }, minLength: { value: 6, message: "Parolanız 6 karakterden kısa olamaz!" }, maxLength: 24 })}
                        label="Parola"
                        type="password"
                        size="small"
                        fullWidth
                        autoFocus
                        sx={{ mb: 2 }}
                        error={!!errors.password}
                        helperText={errors.password?.message}></TextField>
                    <Button loading={isSubmitting}
                        disabled={!isValid}
                        type="submit"
                        variant="contained"
                        fullWidth sx={{ mt: 1 }} >Giriş Yap</Button>
                </Box>
            </Paper>
        </Container>
    );
}