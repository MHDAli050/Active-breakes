/* eslint-disable */

//const { post } = require("../../app");
import axios from 'axios';

import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfly Let us Start a Challenge!');
      if (res.data.data.role === 'user') {
        window.setTimeout(() => {
          location.assign('/allchallenges');
        }, 1500);
      } else if (res.data.data.role === 'admin') {
        window.setTimeout(() => {
          location.assign('/scancode');
        }, 1500);
      }
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      //location.reload(true);
      showAlert('success', 'Logged Out successfly!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    console.log(err.response);
    showAlert('error', error.response.data.message);
  }
};
