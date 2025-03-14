import axios, { AxiosError, AxiosResponse } from "axios";
import { router } from "../Router/Routes";
import { toast } from "react-toastify";
import { store } from "../redux/store";

axios.defaults.baseURL = "https://localhost:7229/api/";
axios.defaults.withCredentials = true;

axios.interceptors.request.use(request => {
    const token = store.getState().account.user?.token;
    if (token) {
        request.headers["Authorization"] = `Bearer ${token}`;
    }
    return request;
});


axios.interceptors.response.use(
    response => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            const { data, status } = error.response as AxiosResponse;
            switch (status) {
                case 400:
                    if (data.errors) {
                        const modelErrors: string[] = [];

                        for (const key in data.errors) {
                            modelErrors.push(data.errors[key]);
                        }

                        throw modelErrors;
                    }
                    toast.error(data.title);
                    break;

                case 401:
                    toast.error(data.title);
                    break;

                case 404:
                    router.navigate("/not-found");
                    break;

                case 500:
                    router.navigate("/server-error", { state: { error: data, status: status } });
                    break;

                default:
                    toast.error("An unexpected error occurred");
                    break;
            }
        } else {
            console.error("Network error or no response received:", error);
            toast.error("Network error or server is unreachable");
        }

        return Promise.reject(error.response);
    }
);

const queries =
{
    get: (url: string) => axios.get(url).then((response: AxiosResponse) => response.data),
    post: (url: string, body: {}) => axios.post(url, body).then((response: AxiosResponse) => response.data),
    put: (url: string, body: {}) => axios.put(url, body).then((response: AxiosResponse) => response.data),
    delete: (url: string) => axios.delete(url).then((response: AxiosResponse) => response.data),
}

const Rehber = {
    list: () => queries.get("Rehber"),
    yeniTalepOlustur: (formData: any) => queries.post(`Rehber/talep-olustur`, formData),
    YeniCalisanTalepOnayla: (id: number) => queries.post(`Rehber/talep-onayla/${id}`, {}),
    YeniCalisanTalepReddet: (id: number) => queries.post(`Rehber/talep-reddet/${id}`, {}),
}

const Account = {
    login: (formData: any) => queries.post("account/login", formData),
    register: (formData: any) => queries.post("account/register", formData),
    getUser: () => queries.get("account/getuser"),
}

const requests = {
    Rehber,
    Account
}

export default requests