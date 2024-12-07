import { createAsyncThunk, Slice, createSlice, PayloadAction } from '@reduxjs/toolkit'
import axiosProtected from '../../api/axiosProtected'

interface createPasswordTotpData {
  id: string
  secret: string
}

const createPasswordTotp = createAsyncThunk(
  'passwords/createPasswordTotp',
  async (sendData: createPasswordTotpData, thunkAPI) => {
    try {
      const { data } = await axiosProtected.post(`/passwords/createPasswordTotp/${sendData.id}`, {
        secret: sendData.secret,
      })
      return data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  },
)

export { createPasswordTotp }

interface createPasswordTotpState {
  loading: boolean
  success: boolean
  successMessage: string
  error: boolean
  errorMessage: string
}

export const createPasswordTotpSlice: Slice<createPasswordTotpState> = createSlice({
  name: 'passwords/createPasswordTotp',
  initialState: {
    loading: false,
    success: false,
    successMessage: '',
    error: false,
    errorMessage: '',
  } as createPasswordTotpState,
  reducers: {
    successReset: state => {
      state.success = false
    },
    errorReset: state => {
      state.error = false
    },
  },
  extraReducers: builder => {
    builder.addCase(createPasswordTotp.pending, state => {
      state.loading = true
      state.success = false
      state.error = false
    })
    builder.addCase(createPasswordTotp.fulfilled, (state, action) => {
      state.loading = false
      state.success = true
      state.successMessage = action.payload.message
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    builder.addCase(createPasswordTotp.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false
      if (action.payload) {
        state.error = true
        state.errorMessage = action.payload
      }
    })
  },
})

export const { successReset, errorReset } = createPasswordTotpSlice.actions
export const createPasswordTotpReducer = createPasswordTotpSlice.reducer