import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { employeeSlice } from "./employeeSlice";
import { AccountSlice } from "./AccountSlice";
import { adminSlice } from "./AdminSlice";

export const store = configureStore({
    reducer: {
        employee: employeeSlice.reducer,
        account: AccountSlice.reducer,
        admin: adminSlice.reducer,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();