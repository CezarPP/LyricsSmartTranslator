const showMoreButtonCharts = document.querySelector('#charts-container .show-more-button');
const chartsList = document.querySelector('#charts-container .charts-list');

let songs = [];
let translationId = [];
let artists = [];
let imageId = [];

let dataMap = new Map();

const getSongsData = async () => {
    const methods = ['newest', 'mostCommented', 'mostViewed'];
    for (let method of methods) {
        await fetch(`/api/songs?filter=${method}`, {method: 'GET'})
            .then(response => response.json())
            .then(data => {
                let songData = [];
                let artistData = [];
                let translationIdData = [];
                let imageIdData = []
                data.forEach(song => {
                    songData.push(song.title);
                    translationIdData.push(song.primary_translation);
                    artistData.push(song.artist);
                    imageIdData.push(song.imageId);
                });
                dataMap.set(method, {
                    songs: songData, artists: artistData,
                    translationId: translationIdData, imageId: imageIdData
                });
            })
            .catch(err => console.log('Error getting the charts songs ' + err));
    }
}

const loadFromDataMap = (filterMethod) => {
    let data = dataMap.get(filterMethod);
    if (data !== undefined) {
        songs = data.songs;
        artists = data.artists;
        translationId = data.translationId;
        imageId = data.imageId;
    } else {
        throw new Error("Error getting song data for method");
    }
}

// news
async function setImage(imageId, img) {
    const response = await fetch(`/api/images/${imageId}`, {method: 'GET'});
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    img.src = data.link;
}

export async function loadNewsCards() {
    for (let i = 0; i < 4; i++) {
        const newsCard = document.getElementById(`news-card-${i + 1}`);

        const img = newsCard.querySelector('img');
        setImage(imageId[i], img)
            .then();

        const a = newsCard.querySelector('a');
        a.href = '/song-page/' + translationId[i];

        const title = newsCard.querySelector('.news-title');
        title.textContent = songs[i];

        const artist = newsCard.querySelector('.news-author');
        artist.textContent = 'by ' + artists[i];
    }
}

// end news

const addMoreCharts = () => {
    for (let i = 1; i <= 5; i++) {
        const newItem = document.createElement('li');
        const index = chartsList.children.length + 1;
        const id = translationId[index - 1];
        if (id === undefined) {
            showMoreButtonCharts.style.display = "none";
            break;
        }
        newItem.innerHTML = `
      <span class="song-number">${index}</span>
      <span class="song-title"><a href="/song-page/${id}" style="color:black">${songs[index - 1]}</a></span>
      <span class="song-author">${artists[index - 1]}</span>
    `;
        chartsList.appendChild(newItem);
        if (chartsList.children.length > 20)
            showMoreButtonCharts.style.display = "none";
    }
};

const removeAllAndAddMoreCharts = async () => {
    showMoreButtonCharts.style.display = "block";
    while (chartsList.firstChild) {
        chartsList.removeChild(chartsList.firstChild);
    }
    await addMoreCharts();
}

const addFirstTime = async () => {
    for (let i = 1; i <= 5; i++) {
        const id = translationId[i - 1];
        if (id === undefined) {
            showMoreButtonCharts.style.display = "none";
            break;
        }
        const number = document.getElementById('song-number-' + i);
        const title = document.getElementById('song-title-' + i);
        const author = document.getElementById('song-author-' + i);
        number.textContent = i.toString();
        title.href = `/song-page/${id}`;
        title.textContent = songs[i - 1];
        author.textContent = artists[i - 1];
    }
}

export async function loadCharts() {
    showMoreButtonCharts.addEventListener('click', addMoreCharts);

    await getSongsData();

    const newest = document.getElementById('newest');
    const mostCommented = document.getElementById('most-commented');
    const mostViewed = document.getElementById('most-viewed');

    newest.addEventListener('click', async function (e) {
        e.preventDefault();
        loadFromDataMap('newest');
        await removeAllAndAddMoreCharts();
    });
    mostCommented.addEventListener('click', async function (e) {
        e.preventDefault();
        loadFromDataMap('mostCommented');
        await removeAllAndAddMoreCharts();
    });
    mostViewed.addEventListener('click', async function (e) {
        e.preventDefault();
        loadFromDataMap('mostViewed');
        await removeAllAndAddMoreCharts();
    });

    // default
    loadFromDataMap('newest');
    loadNewsCards()
        .then();
    await addFirstTime();
}