import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { IEmployee } from "../models/IEmployee";
import requests from "../api/requests";
import { RootState } from "./store";

const employeeAdapter = createEntityAdapter<IEmployee>({
    selectId: (employee: IEmployee) => employee.Id,
});

const initialState = employeeAdapter.getInitialState({
    status: "idle",
    isLoaded: false
});

export const fetchEmployees = createAsyncThunk<IEmployee[]>(
    "employee/fetchEmployees",
    async (_, thunkAPI) => {
        try {
            return await requests.Rehber.list();
        }
        catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.data })
        }
    }
)

export const yeniCalisanTalepOnayla = createAsyncThunk<IEmployee[], { CalisanId: number }>(
    "employee/yeniCalisanTalepOnayla",
    async ({ CalisanId }) => {
        try {
            return await requests.Rehber.YeniCalisanTalepOnayla(CalisanId);
        }
        catch (error: any) {
            console.log(error);
        }
    }
)

export const yeniCalisanTalepReddet = createAsyncThunk<IEmployee[], { CalisanId: number }>(
    "employee/yeniCalisanTalepReddet",
    async ({ CalisanId }) => {
        try {
            return await requests.Rehber.YeniCalisanTalepReddet(CalisanId);
        }
        catch (error: any) {
            console.log(error);
        }
    }
)

export const employeeSlice = createSlice({
    name: "employee",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(fetchEmployees.pending, (state) => {
            state.status = "pendingFetchItems";
        });

        builder.addCase(fetchEmployees.fulfilled, (state, action) => {
            employeeAdapter.setAll(state, action.payload);
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
            employeeAdapter.setAll(state, action.payload);
            state.status = "idle";
        });
        builder.addCase(yeniCalisanTalepOnayla.rejected, (state) => {
            state.status = "idle";
        });

        builder.addCase(yeniCalisanTalepReddet.pending, (state, action) => {
            state.status = "pendingYeniCalisanTalepReddet" + action.meta.arg.CalisanId;
        });
        builder.addCase(yeniCalisanTalepReddet.fulfilled, (state, action) => {
            employeeAdapter.setAll(state, action.payload);
            state.status = "idle";
        });
        builder.addCase(yeniCalisanTalepReddet.rejected, (state) => {
            state.status = "idle";
        });
    }
});

export const employeeSelector = employeeAdapter.getSelectors((state: RootState) => state.employee);