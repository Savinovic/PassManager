import { AnyAction } from '@reduxjs/toolkit'
import axios, { InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import axiosPublic from '../api/axiosPublic'
import { logoutUser, userInfoReset } from '../features/userSlices/listUser'
import { passwordsReset } from '../features/passwordSlices/getUserPasswords'

let store: AnyAction
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const injectStore = (_store: any) => {
  store = _store
}

const axiosProtected = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

const refreshAccessToken = async () => {
  try {
    const { data } = await axiosPublic.get('/users/refreshAccessToken', { withCredentials: true })
    data?.accessToken && localStorage.setItem('accessToken', JSON.stringify(data.accessToken))
    return { type: 'data', payload: data }
  } catch (error: unknown) {
    return { type: 'error', payload: error }
  }
}

const reqIntercept = axiosProtected.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!config.headers) config.headers = {} as AxiosRequestHeaders

    if (!config.headers['Authorization']) {
      const accessToken = localStorage.getItem('accessToken')
      config.headers['Authorization'] = `Bearer ${accessToken ? JSON.parse(accessToken) : null}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  },
)

const resIntercept = axiosProtected.interceptors.response.use(
  res => {
    return res
  },
  async error => {
    const prevRequest = error?.config

    if (error?.response?.status === 403 && error?.response?.data?.message.split(':')[0] === '403_1' && !prevRequest?.sent) {
      prevRequest.sent = true

      const { type, payload } = await refreshAccessToken()

      if (type === 'data') {
        prevRequest.headers['Authorization'] = `Bearer ${payload.accessToken}`
        return axiosProtected(prevRequest)
      } else {
        store.dispatch(passwordsReset(null))
        store.dispatch(userInfoReset(null))
        store.dispatch(logoutUser())
        return Promise.reject(payload)
      }
    }
    return Promise.reject(error)
  },
)

/*const axiosProtectedEject = () => {
  axiosProtected.interceptors.request.eject(reqIntercept)
  axiosProtected.interceptors.response.eject(resIntercept)
}*/

const getTotpSecret = async (passwordId: string) => {
  try {
    const response = await axios.get(`/passwords/${passwordId}/getTotpSecret`)
    return response.data.totpSecret
  } catch (error) {
    console.error('Error getting TOTP secret:', error)
    throw error
  }
}

// client/src/api/axiosProtected.ts

export const setTotpSecret = async (passwordId: string, totpSecret: string) => {
  try {
    const response = await axiosProtected.put(`/passwords/passwords/${passwordId}/setTotpSecret`, {
      totpSecret,
    });
    return response.data;
  } catch (error) {
    console.error('Error setting TOTP secret:', error);
    throw error;
  }
};

export const generateTotpCode = async (passwordId: string) => {
  try {
    const response = await axiosProtected.post(`/passwords/passwords/${passwordId}/generateTotp`);
    return response.data.totpCode;
  } catch (error) {
    console.error('Error generating TOTP code:', error);
    throw error;
  }
};

export { reqIntercept, resIntercept }
export default axiosProtected
export { getTotpSecret }
