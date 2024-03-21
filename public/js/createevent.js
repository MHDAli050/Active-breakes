/* eslint-disable */

//const { post } = require("../../app");
import axios from 'axios';

import { showAlert } from './alert';

export const createevent = async (title, espId, date, time) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/events/createevent',
      data: {
        title,
        espId,
        date,
        time,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'event created successfuly!!!');
      console.log(res.data.data.newDoc._id);
      window.setTimeout(() => {
        location.assign(`/events/${res.data.data.newDoc._id}`);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
