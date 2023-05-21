// TODO(add no_comments)
// TODO(about should be a short description)

async function getSongFromServer() {
    const path = window.location.pathname;
    const translationId = path.split('/')[2];
    fetch(`/api/translation/${translationId}`, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error getting translation from server status: ${response.status}`
                    + `error is ${response.json()}`);
            }
            return response.json();
        })
        .then(translationData => {
            loadTranslation(translationData);
        })
        .catch(error => {
            console.error('Error:', error);
        })
}

async function loadTranslation(translationData) {
    const songId = translationData.songId;
    const userId = translationData.userId;
    const language = translationData.language;
    const description = translationData.description;
    const lyrics = translationData.lyrics;
    const no_views = translationData.no_views;
    const time = translationData.time;

    fetch(`/api/song/${songId}`, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`
                    + `error is ${response.json()}`);
            }
            return response.json();
        })
        .then(async data => {
            await setSongElements(data.link, data.imageId, data.author, data.title);
        })
        .catch(error => {
            console.error('Error:', error);
        });

    await setTranslationElements(lyrics, description, no_views, time);
}

async function setTranslationElements(lyrics, description, no_views, time) {
    document.getElementById('about-content').textContent = description;
    document.getElementById('song-description').textContent = description;
    document.getElementById('lyrics-paragraphs').textContent = lyrics;
    document.getElementById('no-views').textContent = no_views;
    document.getElementById('song-date').textContent = time;
}

async function setSongElements(link, imageId, author, title) {
    document.getElementById('song-link').src = link;
    document.getElementById('song-author').textContent = author;
    document.getElementById('song-title').textContent = title;
    document.getElementById('lyrics-song-title').textContent = title;
    await setImage(imageId);
}

async function setImage(imageId) {
    fetch(`/api/image/${imageId}`, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`
                    + `error is ${response.json()}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('song-img').src = data.link;
        })
        .catch(error => {
            console.error('Error: ' + error);
        })
}

getSongFromServer().then(() => console.log("Got data from the server"));