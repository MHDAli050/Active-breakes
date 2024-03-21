/* eslint-disable */

//const { post } = require("../../app");
import axios from 'axios';

import { showAlert } from './alert';

export const createFeedback = async (userID, eventID, text, rating) => {
  try {
    const res1 = await getFeedback(userID, eventID, text, rating);

    if (res1.data.status === 'success') {
      showAlert('success', 'Feedback was founded successfuly!!!');
      const res = await updateFeedback(userID, eventID, text, rating);
      if (res.data.status === 'success') {
        showAlert('success', 'Feedback updated successfuly!!!');
        console.log(res.data.data.doc._id);
        window.setTimeout(() => {
          location.assign(`/vote/${eventID}`);
        }, 1500);
      }
    } else {
      const res = await postFeedback(userID, eventID, text, rating);
      if (res.data.status === 'success') {
        showAlert('success', 'Feedback created successfuly!!!');
        console.log('hiii', res.data.data);
        window.setTimeout(() => {
          location.assign(`/vote/${eventID}`);
        }, 1500);
      }
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const updateFeedback = async (userID, eventID, text, rating) => {
  const res = await axios({
    method: 'PATCH',
    url: '/api/v1/feedback/createfeedback',
    data: {
      user: userID,
      event: eventID,
      feedback: text,
      rating: rating,
    },
  });
  return res;
};

const getFeedback = async (userID, eventID, text, rating) => {
  const res = await axios({
    method: 'GET',
    url: `/api/v1/feedback/${userID}`,
    data: {
      user: userID,
      event: eventID,
      feedback: text,
      rating: rating,
    },
  });
  return res;
};

const postFeedback = async (userID, eventID, text, rating) => {
  const res = await axios({
    method: 'POST',
    url: '/api/v1/feedback/createfeedback',
    data: {
      user: userID,
      event: eventID,
      feedback: text,
      rating: rating,
    },
  });
  return res;
};
