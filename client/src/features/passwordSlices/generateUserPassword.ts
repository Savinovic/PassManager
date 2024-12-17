import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axiosProtected from '../../api/axiosProtected'

interface GeneratePasswordParams {
  length: number
  includeNumbers: boolean
  includeSpecial: boolean
  includeUppercase: boolean
}

const generateUserPassword = createAsyncThunk(
  'passwords/generate',
  async (params: GeneratePasswordParams, thunkAPI) => {
    try {
      const response = await axiosProtected.post('/passwords/generate', {
        length: params.length,
        includeNumbers: params.includeNumbers,
        includeSpecial: params.includeSpecial,
        includeUppercase: params.includeUppercase,
      })
      return response.data.password // Assumendo che il backend ritorni { password: '...' }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export { generateUserPassword }

interface GeneratePasswordState {
  loading: boolean
  password: string
  error: string | null
}

const initialState: GeneratePasswordState = {
  loading: false,
  password: '',
  error: null,
}

const passwordSlice = createSlice({
  name: 'generatePassword',
  initialState,
  reducers: {
    resetPassword: (state) => {
      state.password = ''
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateUserPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(generateUserPassword.fulfilled, (state, action) => {
        state.loading = false
        state.password = action.payload
      })
      .addCase(generateUserPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { resetPassword } = passwordSlice.actions
export default passwordSlice.reducer