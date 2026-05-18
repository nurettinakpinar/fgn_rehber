import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#111111",
            light: "#3a3a3a",
            dark: "#000000",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#A35632",
            light: "#d6834f",
            dark: "#6f2c08",
            contrastText: "#ffffff",
        },
        background: {
            default: "#f5f5f5",
            paper: "#ffffff",
        },
        text: {
            primary: "#111111",
            secondary: "#555555",
        },
    },
    typography: {
        fontFamily: "Roboto, sans-serif",
        h5: { fontWeight: 700 },
        h6: { fontWeight: 600 },
        button: { textTransform: "none", fontWeight: 600 },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    paddingLeft: 20,
                    paddingRight: 20,
                },
                containedPrimary: {
                    backgroundColor: "#111111",
                    "&:hover": { backgroundColor: "#333333" },
                },
                outlinedPrimary: {
                    borderColor: "#111111",
                    color: "#111111",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { borderRadius: 12 },
                elevation3: {
                    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: "small",
                variant: "outlined",
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 6 },
                colorPrimary: {
                    backgroundColor: "#111111",
                    color: "#ffffff",
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                switchBase: {
                    "&.Mui-checked": {
                        color: "#111111",
                        "& + .MuiSwitch-track": { backgroundColor: "#555555" },
                    },
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: { backgroundColor: "#111111" },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    "&.Mui-selected": { color: "#111111", fontWeight: 700 },
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    "& .MuiTableCell-head": {
                        backgroundColor: "#111111",
                        color: "#ffffff",
                        fontWeight: 700,
                    },
                },
            },
        },
    },
});

export default theme;
