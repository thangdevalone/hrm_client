import { PayloadAction, createSlice } from "@reduxjs/toolkit";


export type Theme = "dark" | "light"

export interface AppState {
    theme: Theme
    
}

const initialState: AppState = {
    theme: "light",
   
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers:{
    setTheme: (state,action:PayloadAction<Theme>) => {
        state.theme=action.payload
    },
  }
});
export const appActions = appSlice.actions
const appReducer = appSlice.reducer
export default appReducer