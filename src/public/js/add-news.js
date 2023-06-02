async function fetchNewsData() {
    const response = await fetch('/api/songs?filter=newest&limit=4');
    if (!response.ok) {
        throw new Error(`ERROR getting data from API : ${response.status}`);
    }
    return await response.json();
}

async function setImage(imageId, img) {
    fetch(`/api/images/${imageId}`, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`
                    + `error is ${response.json()}`);
            }
            return response.json();
        })
        .then(data => {
            img.src = data.link;
        })
        .catch(error => {
            console.error('Error: ' + error);
        })
}

async function createNewsCard(song) {
    const newsCard = document.createElement('div');
    newsCard.classList.add('news-card');

    const img = document.createElement('img');
    setImage(song.imageId, img)
        .then();
    img.alt = 'Album cover';
    const a = document.createElement('a');
    a.href = '/song-page/' + song.primary_translation;
    a.appendChild(img);

    newsCard.appendChild(a);

    const title = document.createElement('p');
    title.classList.add('news-title');
    title.textContent = song.title;
    newsCard.appendChild(title);

    const artist = document.createElement('p');
    artist.classList.add('news-author');
    artist.textContent = 'by ' + song.artist;
    newsCard.appendChild(artist);

    return newsCard;
}

export async function loadNewsCards() {
    const newsData = await fetchNewsData();

    const newsContainer = document.querySelector('.news-container .news-content');

    for (const newsItem of newsData) {
        const newsCard = createNewsCard(newsItem);
        await newsContainer.appendChild(await newsCard);
    }
}