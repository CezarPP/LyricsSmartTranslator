async function getTranslation() {
    const path = window.location.pathname;
    const translationId = path.split('/')[2];
    return await fetch(`/api/translations/${translationId}`, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error getting translation from server status: ${response.status}`
                    + `error is ${response.json()}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error:', error);
        })
}

function getCapitalized(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

async function setTranslationLanguages(songId) {
    // get all translation for this song
    fetch(`/api/translations?songId=${songId}`, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`
                    + `error is ${response.json()}`);
            }
            return response.json();
        })
        .then(translations => {
            const languageOptions = document.getElementById('language-options');
            for (const translation of translations) {
                const language = document.createElement('a');
                language.href = `/song-page/${translation.id}`;
                language.textContent = getCapitalized(translation.language);
                languageOptions.appendChild(language);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


async function loadTranslation(translationData) {
    const songId = translationData.songId;
    const addTranslationButton = document.getElementById('add-translation-link');
    addTranslationButton.href = `/add-translation/${songId}`;

    const language = getCapitalized(translationData.language);
    const description = translationData.description;
    const lyrics = translationData.lyrics;
    const no_views = translationData.no_views;
    const date = new Date(translationData.time);
    const time = date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });

    await setTranslationElements(lyrics, description, no_views, time, language);
    await setTranslationLanguages(songId);
}

async function loadSong(songId) {
    const song = await fetch(`/api/songs/${songId}`, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`
                    + `error is ${response.json()}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    await setSongElements(song.link, song.imageId, song.artist, song.title);
}

async function setDescription(description) {
    const maxLength = 100;
    let shortDescription;
    if (description.length > maxLength) {
        shortDescription = description.substring(0, maxLength) + "...";
        document.getElementById('read-more').style.display = 'block';
    } else {
        shortDescription = description;
        document.getElementById('read-more').style.display = 'none';
    }

    document.getElementById('about-short').innerText = shortDescription;
    document.getElementById('about-content').innerText = description;
}

async function setTranslationElements(lyrics, description, no_views, time, language) {
    document.getElementById('about-content').textContent = description;
    document.getElementById('song-language').textContent = language;
    document.getElementById('lyrics-paragraphs').textContent = lyrics;
    document.getElementById('no-views').textContent = no_views;
    document.getElementById('song-date').textContent = time;
    await setDescription(description);
}

let linkGlobal = ''

async function setSongElements(link, imageId, artist, title) {
    linkGlobal = link;
    // document.getElementById('song-link').src = link;
    document.getElementById('song-author').textContent = artist;
    document.getElementById('song-title').textContent = title;
    document.getElementById('lyrics-song-title').textContent = title;
    await setImage(imageId);
}

function loadYoutubeVideo() {
    document.getElementById('song-link').style.display = 'block';
    document.getElementById('song-link').src = linkGlobal;
    document.getElementById('youtube-facade').style.display = 'none';
}


async function setImage(imageId) {
    fetch(`/api/images/${imageId}`, {method: 'GET'})
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

document.addEventListener('DOMContentLoaded', async () => {
    const translation = await getTranslation();
    loadTranslation(translation)
        .then();
    loadSong(translation.songId)
        .then();
    const preloader = document.getElementById('preloader');
    preloader.style.display = 'none';
});
