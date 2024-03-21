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
      showAlert('success', 'Successfuly Logged in to Active Breakes');
      console.log(res.data.data.user.role);
      if (res.data.data.user.role === 'user') {
        window.setTimeout(() => {
          open().location.assign('/allchallenges');
        }, 1500);
      } else if (res.data.data.user.role === 'admin') {
        window.setTimeout(() => {
          open().location.assign('/jigsawMethod');
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
