const hamburger = document.getElementById('hamburger-menu');
const navbar = document.querySelector('.navbar');

hamburger.addEventListener('click', () => {
    navbar.classList.toggle('nav-active');
    hamburger.classList.toggle('active');
});
