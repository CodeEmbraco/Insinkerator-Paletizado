import { createAction, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { endpointsCodes } from './endpointCodes';

const initialState = {
  user: null,
  isCorrect: null,
  loading: false,
  resetPassword: null,
};

export const revertAll = createAction('REVERT_ALL');

const authSlice = createSlice({
  initialState,
  name: 'auth',
  extraReducers: (builder) => {
    builder.addCase(revertAll, () => initialState);
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setIsCorrect: (state, action) => {
      state.isCorrect = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setUser, setIsCorrect, setLoading } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsCorrect = (state) => state.auth.isCorrect;
export const selectLoading = (state) => state.auth.loading;

export default authSlice.reducer;

export const sendData = (data, navigate) => (dispatch) => {
  dispatch(setLoading(true));
  axios
    .post('http://35.174.106.95/api/auth/login/', data)
    .then((response) => {
      dispatch(setLoading(false));
      if (response.data.status_code === 202) {
        dispatch(setUser(response.data));
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('email', response.data.email);
        sessionStorage.setItem('first_name', response.data.first_name);
        sessionStorage.setItem('id', response.data.id);
        sessionStorage.setItem('rol', response.data.rol);
        dispatch(setIsCorrect(false));
        navigate('/mp-pro/');
      }
    })
    .catch((error) => {
      endpointsCodes(error, dispatch, setIsCorrect);
      dispatch(setLoading(false));
      setTimeout(() => dispatch(revertAll()), 5000);
    });
};

export const logoutUser = (navigate) => () => {
  const emailUser = sessionStorage.getItem('email');
  const tokenUser = sessionStorage.getItem('token');
  const email = {
    email: emailUser,
  };
  axios
    .post('http://35.174.106.95/api/auth/logout/', email, {
      headers: { Authorization: `Token ${tokenUser}` },
    })
    .then((response) => {
      if (response.data.status_code === 200) {
        sessionStorage.clear();
        navigate('/mp-pro/signin/');
      }
    });
};

export const emailSend = (data, navigate) => (dispatch) => {
  dispatch(setLoading(true));
  axios
    .post('http://35.174.106.95/api/auth/password-reset/send-code', data)
    .then((response) => {
      dispatch(setLoading(false));
      if (response.data.status_code === 200) {
        sessionStorage.setItem('code', response.data.code);
        sessionStorage.setItem('email', data.email);
        dispatch(setIsCorrect(false));
        navigate('/mp-pro/verification-code/');
      }
    })
    .catch((error) => {
      endpointsCodes(error, dispatch, setIsCorrect);
      dispatch(setLoading(false));
      setTimeout(() => dispatch(revertAll()), 5000);
    });
};

export const codeSend = (data, navigate) => (dispatch) => {
  dispatch(setLoading(true));

  const json = {
    email: sessionStorage.getItem('email'),
    user_code: parseInt(data.user_code),
  };

  axios
    .post('http://35.174.106.95/api/auth/password-reset/verify-code', json)
    .then((response) => {
      dispatch(setLoading(false));
      if (response.data.status_code === 202) {
        sessionStorage.setItem('token2', response.data.token);
        sessionStorage.setItem('email', response.data.email);
        dispatch(setIsCorrect(false));

        navigate('/mp-pro/confirm-password/');
      }
    })
    .catch(() => {
      dispatch(setIsCorrect(true));
      dispatch(setLoading(false));
    });
};

export const confirmNewPass = (data, navigate) => (dispatch) => {
  dispatch(setLoading(true));

  const token = sessionStorage.getItem('token2');
  const json = {
    email: sessionStorage.getItem('email'),
    new_password: data.password,
  };

  axios
    .post('http://35.174.106.95/api/auth/password-reset/confirmation', json, {
      headers: { Authorization: `Token ${token}` },
    })
    .then((response) => {
      dispatch(setLoading(false));
      if (response.data.status_code === 200) {
        dispatch(setIsCorrect(true));
        setTimeout(() => {
          navigate('/mp-pro/signin/');
          dispatch(setIsCorrect(false));
        }, 3000);
      }
    })
    .catch(() => {
      dispatch(setIsCorrect(false));
      dispatch(setLoading(false));
    });
};