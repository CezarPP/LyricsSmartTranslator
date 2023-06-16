async function fetchNewsData() {
    const response = await fetch('/api/songs?filter=newest&limit=4');
    if (!response.ok) {
        throw new Error(`ERROR getting data from API : ${response.status}`);
    }
    return await response.json();
}

async function setImage(imageId, img) {
    const response = await fetch(`/api/images/${imageId}`, {method: 'GET'});
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    img.src = data.link;
}
export async function loadNewsCards() {
    const newsData = await fetchNewsData();

    for (let i = 0; i < newsData.length; i++) {
        const newsItem = newsData[i];
        const newsCard = document.getElementById(`news-card-${i + 1}`);

        const img = newsCard.querySelector('img');
        await setImage(newsItem.imageId, img);

        const a = newsCard.querySelector('a');
        a.href = '/song-page/' + newsItem.primary_translation;

        const title = newsCard.querySelector('.news-title');
        title.textContent = newsItem.title;

        const artist = newsCard.querySelector('.news-author');
        artist.textContent = 'by ' + newsItem.artist;
    }
}
