/* eslint-disable */
import '@babel/polyfill';
import { updateSettings } from './dataSettings';
import { login, logout } from "./login";
import { displayMap } from './mapBox';
import { bookTour } from './stripe';
import { showAlert } from './alert';
import {signup} from './signup'

const mapBox = document.getElementById('map');
const signupForm = document.querySelector('.form-signup');
const loginForm = document.querySelector('.form-login');
const logoutBtn= document.querySelector('.nav__el--logout');
const updateUserDataForm= document.querySelector('.form-user-data');
const userPasswordForm= document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');

//dellegation
if (mapBox){
const locations = JSON.parse(mapBox.dataset.locations);
displayMap(locations);
}

if(signupForm){
    signupForm.addEventListener('submit', e=>{
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name,email,password,passwordConfirm)
})
}

if(loginForm){
    loginForm.addEventListener('submit', e=>{
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email,password)
})
}

if(logoutBtn) logoutBtn.addEventListener('click',logout)

if(updateUserDataForm) updateUserDataForm.addEventListener('submit',e=>{  
    e.preventDefault();
    const form = new FormData();
    form.append('name',document.getElementById('name').value);
    form.append('email',document.getElementById('email').value);
    form.append('photo',document.getElementById('photo').files[0]);
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    updateSettings(form,'data');
})

if(userPasswordForm) userPasswordForm.addEventListener('submit', async e=>{ 
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
  
    await updateSettings({passwordCurrent,password,passwordConfirm},'password');// await to make sure that the password was updated before rest content

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value='' ;
    document.getElementById('password-confirm').value='' ;
})

if(bookBtn)
bookBtn.addEventListener('click', e =>{
    e.target.textContent = 'Processing ...';
    const {tourId} = e.target.dataset;
    bookTour(tourId);
})

const alertMessage = document.querySelector('body').dataset.alert;
if(alertMessage) showAlert('success',alertMessage,16)