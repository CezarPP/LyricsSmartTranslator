import {loadNewsCards} from './add-news.js';
import {addMoreFirstTime} from "./add-to-community.js";
import {loadCharts} from "./add-to-charts.js";
import {addMoreForYouFirstTime} from "./add-to-for-you.js";

let counter = 0;

function incrementAndCheck() {
    counter++;
    if (counter === 4) {
        const preloader = document.getElementById('preloader');
        preloader.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    loadNewsCards()
        .then(incrementAndCheck)
    addMoreFirstTime()
        .then(incrementAndCheck)
    loadCharts()
        .then(incrementAndCheck);
    addMoreForYouFirstTime()
        .then(incrementAndCheck);

});