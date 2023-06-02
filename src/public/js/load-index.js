import {loadNewsCards} from './add-news.js';
import {addMoreFirstTime} from "./add-to-community.js";
import {loadCharts} from "./add-to-charts.js";
import {addMoreForYouFirstTime} from "./add-to-for-you.js";

document.addEventListener('DOMContentLoaded', async () => {
    await loadNewsCards();
    await addMoreFirstTime();
    await loadCharts();
    await addMoreForYouFirstTime();

    const preloader = document.getElementById('preloader');
    preloader.style.display = 'none';
});