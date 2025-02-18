import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  token: null,
  user: null,
};

// Create slice for user authentication
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user; // Store user data in the store
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

// Export actions
export const { login, logout } = userSlice.actions;

// Export reducer to be used in the store
export default userSlice.reducer;
