import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { IEmployee } from "../models/IEmployee";
import requests from "../api/requests";
import { RootState } from "./store";

type EmployeeEntity = IEmployee & { id: number };
const employeeAdapter = createEntityAdapter<EmployeeEntity>();

const initialState = employeeAdapter.getInitialState({
    status: "idle",
    isLoaded: false
});
const toEntities = (arr: IEmployee[]): EmployeeEntity[] =>
    (arr ?? []).map((e) => ({ ...e, id: e.Id }));

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

export const employeeSlice = createSlice({
    name: "employee",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(fetchEmployees.pending, (state) => {
            state.status = "pendingFetchItems";
        });

        builder.addCase(fetchEmployees.fulfilled, (state, action) => {
            employeeAdapter.setAll(state, toEntities(action.payload) );
            state.status = "idle";
            state.isLoaded = true;
        });

        builder.addCase(fetchEmployees.rejected, (state) => {
            state.isLoaded = false;
            state.status = "idle";
        });

    }
});

export const employeeSelector = employeeAdapter.getSelectors((state: RootState) => state.employee);