/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:8000/api/v1/users/signin',
      data: {
        email,
        password
      }
    });

    if (response.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => location.assign('/'), 1500);
    }
  } catch (error) {
    // console.log(error);
    showAlert('error', response.data.message);
  }
};

export const logout = async () => {
  try {
    const response = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });
    if ((response.data.status = 'success')) location.reload(true);
  } catch (error) {
    showAlert('error', 'Error logging out. Try again');
  }
};
