import {loadCharts} from './chars-news.js';
import {addMoreFirstTime} from "./add-to-community.js";
import {initializeSongs} from "./add-to-for-you.js";

const preloader = document.getElementById('preloader');

document.addEventListener('DOMContentLoaded', () => {
    Promise.all([
        addMoreFirstTime(),
        loadCharts(),
        initializeSongs()
    ]).then(() => {
        preloader.style.display = 'none';
    }).catch();
});
