import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { User } from "../models/IUser";
import { FieldValues } from "react-hook-form";
import requests from "../api/requests";
import { router } from "../Router/Routes";

export interface AccountState {
    user: User | null;
}

const initialState: AccountState = {
    user: null
}

export const loginUser = createAsyncThunk<User, FieldValues>(
    "account/login",
    async (data, { rejectWithValue }) => {
        try {
            const user = await requests.Account.login(data);
            localStorage.setItem("user", JSON.stringify(user));
            return user;
        }
        catch (error: any) {
            return rejectWithValue({ error: error.data })
        }
    }
)

export const getUser = createAsyncThunk<User>(
    "account/getuser",
    async (_, thunkAPI) => {
        try {
            thunkAPI.dispatch(setUser(JSON.parse(localStorage.getItem("user")!)))
            const user = await requests.Account.getUser();
            localStorage.setItem("user", JSON.stringify(user));
            return user;

        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.data })
        }
    },
    {
        condition: () => {
            if (!localStorage.getItem("user")) {
                return false;
            }
        }
    }
)

export const AccountSlice = createSlice(
    {
        name: "account",
        initialState,
        reducers: {
            setUser: (state, action) => {
                state.user = action.payload;
            },
            logout: (state) => {
                state.user = null;
                localStorage.removeItem("user");
                router.navigate("/admin");
            }
        },
        extraReducers: (builder) => {
            builder.addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload;
            });

            builder.addCase(getUser.fulfilled, (state, action) => {
                state.user = action.payload;
            });

            builder.addCase(getUser.rejected, (state) => {
                state.user = null;
                localStorage.removeItem("user");
                router.navigate("/login");
            });
        }
    }
)

export const { logout, setUser } = AccountSlice.actions;