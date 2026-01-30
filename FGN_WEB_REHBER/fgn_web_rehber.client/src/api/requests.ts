import axios, { AxiosError, AxiosResponse } from "axios";
import { router } from "../Router/Routes";
import { toast } from "react-toastify";
import { store } from "../redux/store";

axios.defaults.baseURL = import.meta.env.PROD
    ? import.meta.env.VITE_API_URL   // .env.production dosyasından oku
    : "https://localhost:7229/api/";


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

const Admin = {
    list: () => queries.get("Admin"),
    CalisanGuncelle: (id: number, formData: any) => queries.put(`Admin/calisanGuncelle/${id}`, formData),
    YeniCalisanTalepOnayla: (id: number) => queries.post(`Admin/talep-onayla/${id}`, {}),
    YeniCalisanTalepReddet: (id: number) => queries.post(`Admin/talep-reddet/${id}`, {}),

    // --- Birim ---
    getBirimler: () => queries.get("Admin/birim"),
    birimEkle: (aciklama: string) => queries.post("Admin/birim", { aciklama }),
    birimAciklamaGuncelle: (id: number, aciklama: string) => queries.put(`Admin/birim/${id}/aciklama`, { aciklama }),
    birimActiveGuncelle: (id: number, active: boolean) => queries.put(`Admin/birim/${id}/active`, { active }),
    // --- Takim ---
    getTakimlar: () => queries.get("Admin/takim"),
    takimEkle: (aciklama: string) => queries.post("Admin/takim", { aciklama }),
    takimAciklamaGuncelle: (id: number, aciklama: string) => queries.put(`Admin/takim/${id}/aciklama`, { aciklama }),
    takimActiveGuncelle: (id: number, active: boolean) => queries.put(`Admin/takim/${id}/active`, { active }),
}

const Rehber = {
    list: (searchTerm?: string, takimEnum?: number) => {
        let queryParams = [];

        if (searchTerm) {
            queryParams.push(`searchTerm=${encodeURIComponent(searchTerm)}`);
        }

        if (takimEnum !== undefined) {
            queryParams.push(`takimId=${takimEnum}`);
        }

        const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
        return queries.get(`Rehber${queryString}`);
    },
    BilgileriGetir: () => queries.get(`Rehber/BilgileriGetir`),
    yeniTalepOlustur: (formData: any) => queries.post(`Rehber/talep-olustur`, formData),
}

const Account = {
    login: (formData: any) => queries.post("account/login", formData),
    register: (formData: any) => queries.post("account/register", formData),
    getUser: () => queries.get("account/getuser"),
}

const requests = {
    Rehber,
    Account,
    Admin
}

export default requests