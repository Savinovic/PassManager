import { createAsyncThunk, Slice, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axiosProtected from '../../api/axiosProtected';

interface RemoveTotpSecretParams {
  id: string;
}

const removeTotpSecret = createAsyncThunk(
  'passwords/removeTotpSecret',
  async ({ id }: RemoveTotpSecretParams, { rejectWithValue }) => {
    try {
      const response = await axiosProtected.post(`/passwords/passwords/${id}/removeTotpSecret`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export { removeTotpSecret };

interface RemoveTotpSecretState {
  loading: boolean;
  success: boolean;
  successMessage: string;
  error: boolean;
  errorMessage: string;
}

export const removeTotpSecretSlice: Slice<RemoveTotpSecretState> = createSlice({
  name: 'passwords/passwords/removeTotpSecret',
  initialState: {
    loading: false,
    success: false,
    successMessage: '',
    error: false,
    errorMessage: '',
  } as RemoveTotpSecretState,
  reducers: {
    successReset: (state) => {
      state.success = false;
    },
    errorReset: (state) => {
      state.error = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(removeTotpSecret.pending, (state) => {
      state.loading = true;
      state.success = false;
      state.error = false;
    });
    builder.addCase(removeTotpSecret.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.successMessage = action.payload.message;
    });
    builder.addCase(removeTotpSecret.rejected, (state, action:PayloadAction<any>) => {
      state.loading = false;
      state.error = true;
      state.errorMessage = action.payload.message;
    });
  },
});

export const { successReset, errorReset } = removeTotpSecretSlice.actions
export const deleteUserPasswordReducer = removeTotpSecretSlice.reducer