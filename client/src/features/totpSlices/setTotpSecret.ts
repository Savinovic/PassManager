import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setTotpSecret as setTotpSecretAPI } from '../../api/axiosProtected';

interface SetTotpSecretData {
  id: string;
  secret: string;
}

interface SetTotpSecretState {
  loading: boolean;
  success: boolean;
  successMessage: string;
  error: boolean;
  errorMessage: string;
}

const initialState: SetTotpSecretState = {
  loading: false,
  success: false,
  successMessage: '',
  error: false,
  errorMessage: '',
};

export const setTotpSecret = createAsyncThunk(
  'totp/setTotpSecret',
  async (data: SetTotpSecretData, thunkAPI) => {
    try {
      const response = await setTotpSecretAPI(data.id, data.secret);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Errore sconosciuto';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const setTotpSecretSlice = createSlice({
  name: 'setTotpSecret',
  initialState,
  reducers: {
    successReset(state) {
      state.success = false;
      state.successMessage = '';
    },
    errorReset(state) {
      state.error = false;
      state.errorMessage = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setTotpSecret.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(setTotpSecret.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.success = true;
        state.successMessage = action.payload.message || 'Operazione completata con successo';
      })
      .addCase(setTotpSecret.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.errorMessage = action.payload as string;
      });
  },
});

export const { successReset, errorReset } = setTotpSecretSlice.actions;
export const setTotpSecretReducer = setTotpSecretSlice.reducer;