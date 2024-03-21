/* eslint-disable */
import '@babel/polyfill';
import { updateSettings } from './dataSettings';
import { login, logout } from './login';
import { displayMap } from './mapBox';
import { bookTour } from './stripe';
import { showAlert } from './alert';
import { signup } from './signup';
import { createevent } from './createevent';
import { createFeedback } from './createfeedback';

const mapBox = document.getElementById('map');
const createeventForm = document.querySelector('.form-createevent');
const goodBtn = document.querySelector('.btn--good');
const badBtn = document.querySelector('.btn--bad');
const voteForm = document.getElementById('feedbackform');
const signupForm = document.querySelector('.form-signup');
const loginForm = document.querySelector('.form-login');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateUserDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');

//dellegation
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}
if (voteForm) {
  voteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('hiiiii');
    const userID = document.getElementById('userId').value;
    const eventID = document.getElementById('eventId').value;
    const text = document.getElementById('feedback').value;
    const rating = document.querySelector('input[name="rating"]:checked').value;
    await createFeedback(userID, eventID, text, rating);
    document.getElementById('feedback').value = '';
    const checkedInput = document.querySelector('input[name="rating"]:checked');
    if (checkedInput) {
      checkedInput.checked = false;
    }
  });
}

if (createeventForm) {
  createeventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const espId = document.getElementById('espId').value;
    const date = document.getElementById('date').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    // Combine date and time into a single string
    const timeString = `From ${startTime} to ${endTime}`;

    createevent(title, espId, date, timeString);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (updateUserDataForm)
  updateUserDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    ); // await to make sure that the password was updated before rest content

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing ...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 16);
