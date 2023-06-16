import {loadNewsCards} from './add-news.js';
import {addMoreFirstTime} from "./add-to-community.js";
import {loadCharts} from "./add-to-charts.js";
import {addMoreForYouFirstTime} from "./add-to-for-you.js";

const preloader = document.getElementById('preloader');

document.addEventListener('DOMContentLoaded', () => {
    Promise.all([
        loadNewsCards(),
        addMoreFirstTime(),
        loadCharts(),
        addMoreForYouFirstTime()
    ]).then(() => {
        preloader.style.display = 'none';
    }).catch();
});
