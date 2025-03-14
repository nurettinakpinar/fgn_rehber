import { createBrowserRouter } from "react-router";
import App from "../App";
import HomePage from "../features/HomePage";
import LoginPage from "../features/account/LoginPage";
import NotFound from "../features/errors/NotFound";
import ServerError from "../features/errors/ServerError";
import AdminPage from "../features/admin/AdminPage";
import AuthGuard from "./AuthGuard";

export const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <App />,
            children:
                [

                    {
                        element: <AuthGuard />, children: [
                            { path: "admin", element: <AdminPage /> },
                        ]
                    },
                    { path: "/", element: <HomePage /> },
                    { path: "login", element: <LoginPage /> },
                    { path: "server-error", element: <ServerError /> },
                    { path: "not-found", element: <NotFound /> },
                    { path: "*", element: <NotFound /> },
                ]
        }

    ]
)