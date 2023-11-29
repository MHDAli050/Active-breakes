/* eslint-disable no-undef */
/* eslint-disable node/no-unsupported-features/es-syntax */

export const hidAlert = ()=>{
    const el = document.querySelector('.alert');
    if(el) el.parentElement.removeChild(el);
}

export const showAlert = (type,msg,time=7)=>{
    hidAlert();
    const markerup = `<div class="alert alert--${type}"> ${msg} </div>`
    document.querySelector('body').insertAdjacentHTML('afterbegin',markerup);
    window.setTimeout(hidAlert,time*1000)
}