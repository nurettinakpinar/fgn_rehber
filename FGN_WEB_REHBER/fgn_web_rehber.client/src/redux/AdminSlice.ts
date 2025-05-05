import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { IEmployee } from "../models/IEmployee";
import requests from "../api/requests";
import { RootState } from "./store";

const adminAdapter = createEntityAdapter<IEmployee>({
    selectId: (employee: IEmployee) => employee.Id,
});

const initialState = adminAdapter.getInitialState({
    status: "idle",
    isLoaded: false
});

export const fetchEmployees = createAsyncThunk<IEmployee[]>(
    "admin/fetchEmployees",
    async (_, thunkAPI) => {
        try {
            return await requests.Admin.list();
        }
        catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.data })
        }
    }
)

export const yeniCalisanTalepOnayla = createAsyncThunk<IEmployee[], { CalisanId: number }>(
    "admin/yeniCalisanTalepOnayla",
    async ({ CalisanId }) => {
        try {
            return await requests.Admin.YeniCalisanTalepOnayla(CalisanId);
        }
        catch (error: any) {
            console.log(error);
        }
    }
)

export const yeniCalisanTalepReddet = createAsyncThunk<IEmployee[], { CalisanId: number }>(
    "admin/yeniCalisanTalepReddet",
    async ({ CalisanId }) => {
        try {
            return await requests.Admin.YeniCalisanTalepReddet(CalisanId);
        }
        catch (error: any) {
            console.log(error);
        }
    }
)

export const calisanGuncelle = createAsyncThunk<IEmployee[], { id: number, updated: any }>(
    "admin/calisanGuncelle",
    async ({ id, updated }, thunkAPI) => {
        try {
            return await requests.Admin.CalisanGuncelle(id, updated);
        }
        catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.data });
        }
    }
);


export const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(fetchEmployees.pending, (state) => {
            state.status = "pendingFetchItems";
        });

        builder.addCase(fetchEmployees.fulfilled, (state, action) => {
            adminAdapter.setAll(state, action.payload);
            state.status = "idle";
            state.isLoaded = true;
        });

        builder.addCase(fetchEmployees.rejected, (state) => {
            state.isLoaded = false;
            state.status = "idle";
        });

        builder.addCase(yeniCalisanTalepOnayla.pending, (state, action) => {
            state.status = "pendingYeniCalisanTalepOnayla" + action.meta.arg.CalisanId;
        });
        builder.addCase(yeniCalisanTalepOnayla.fulfilled, (state, action) => {
            adminAdapter.setAll(state, action.payload);
            state.status = "idle";
        });
        builder.addCase(yeniCalisanTalepOnayla.rejected, (state) => {
            state.status = "idle";
        });

        builder.addCase(yeniCalisanTalepReddet.pending, (state, action) => {
            state.status = "pendingYeniCalisanTalepReddet" + action.meta.arg.CalisanId;
        });
        builder.addCase(yeniCalisanTalepReddet.fulfilled, (state, action) => {
            adminAdapter.setAll(state, action.payload);
            state.status = "idle";
        });
        builder.addCase(yeniCalisanTalepReddet.rejected, (state) => {
            state.status = "idle";
        });
        builder.addCase(calisanGuncelle.pending, (state, action) => {
            state.status = "pendingCalisanGuncelle" + action.meta.arg.id;
        });
        builder.addCase(calisanGuncelle.fulfilled, (state, action) => {
            adminAdapter.setAll(state, action.payload);
            state.status = "idle";
        });
        builder.addCase(calisanGuncelle.rejected, (state) => {
            state.status = "idle";
        });
    }
});

export const adminSelector = adminAdapter.getSelectors((state: RootState) => state.admin);