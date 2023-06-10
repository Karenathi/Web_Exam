const button = document.getElementById("theme-btn");
const bodyMessage = document.getElementById("body-message");


button.addEventListener("click", ()=>{
    bodyMessage.classList.toggle("dark");
});