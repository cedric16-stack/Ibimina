import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ibimina_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ibimina_token');
      localStorage.removeItem('ibimina_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);

export const createFund = (data) => API.post('/funds', data);
export const getFunds = () => API.get('/funds');
export const getMyFund = () => API.get('/funds/my');
export const updateFundDescription = (id, data) => API.put(`/funds/${id}/description`, data);
export const addUserToFund = (id, data) => API.post(`/funds/${id}/add-user`, data);
export const removeUserFromFund = (id, userId) => API.delete(`/funds/${id}/remove-user/${userId}`);
export const deleteFund = (id) => API.delete(`/funds/${id}`);

export const getFundMembers = (fundId) => API.get(`/members/fund/${fundId}`);
export const getMember = (id) => API.get(`/members/${id}`);
export const getAllUsers = () => API.get('/members');
export const createUser = (data) => API.post('/members/create', data);

export const getFundTransactions = (fundId) => API.get(`/transactions/fund/${fundId}`);
export const getMyTransactions = () => API.get('/transactions/my');
export const contribute = (data) => API.post('/transactions/contribute', data);
export const withdrawRequest = (data) => API.post('/transactions/withdraw-request', data);
export const secretaryApprove = (id) => API.put(`/transactions/${id}/secretary-approve`);
export const presidentAction = (id, data) => API.put(`/transactions/${id}/president-action`, data);
export const recordPayment = (data) => API.post('/transactions/record-payment', data);

export const getFundActivities = (fundId) => API.get(`/activities/fund/${fundId}`);
export const getGlobalActivities = () => API.get('/activities/global');

export default API;