import { LockOutlined, PersonOutline } from "@mui/icons-material";
import {
    Avatar,
    Box,
    Button,
    Container,
    InputAdornment,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { FieldValues, useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { loginUser } from "../../redux/AccountSlice";

export default function LoginPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { user } = useAppSelector((state) => state.account);
    const location = useLocation();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm({
        defaultValues: { username: "", password: "" },
    });

    async function submitForm(data: FieldValues) {
        await dispatch(loginUser(data));
        navigate(location.state?.from || "/admin");
    }

    if (user) return <Navigate to="/admin" />;

    return (
        <Box
            sx={{
                minHeight: "calc(100vh - 64px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
                px: 2,
            }}
        >
            <Container maxWidth="xs">
                <Paper elevation={3} sx={{ overflow: "hidden" }}>
                    {/* Üst banner — AppBar ile aynı renk */}
                    <Box
                        sx={{
                            bgcolor: "#111111",
                            py: 4,
                            px: 3,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 52,
                                height: 52,
                                bgcolor: "rgba(255,255,255,0.12)",
                                border: "1.5px solid rgba(255,255,255,0.3)",
                            }}
                        >
                            <LockOutlined sx={{ fontSize: 26, color: "white" }} />
                        </Avatar>
                        <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
                            Yönetici Girişi
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                            Devam etmek için giriş yapın
                        </Typography>
                    </Box>

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate sx={{ p: 3 }}>
                        <TextField
                            {...register("username", {
                                required: { value: true, message: "Kullanıcı adını giriniz" },
                            })}
                            label="Kullanıcı Adı"
                            fullWidth
                            autoFocus
                            sx={{ mb: 2 }}
                            error={!!errors.username}
                            helperText={errors.username?.message}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutline fontSize="small" color="action" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <TextField
                            {...register("password", {
                                required: { value: true, message: "Parolanızı giriniz" },
                                minLength: { value: 6, message: "Parola en az 6 karakter olmalı" },
                                maxLength: 24,
                            })}
                            label="Parola"
                            type="password"
                            fullWidth
                            sx={{ mb: 3 }}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined fontSize="small" color="action" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <Button
                            loading={isSubmitting}
                            disabled={!isValid}
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            sx={{ py: 1.2 }}
                        >
                            Giriş Yap
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
