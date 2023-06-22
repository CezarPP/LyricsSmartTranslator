const showMoreButtonForYou = document.querySelector('#for-you-container .show-more-button');
const forYouList = document.querySelector('#for-you-container .for-you-list');

let forYouData = [];

const fetchAndRenderSongs = async () => {
    try {
        const response = await fetch('/api/user/recommendations', {method: 'GET'});
        const data = await response.json();

        forYouData = data.map(song => ({
            title: song.title,
            artist: song.artist,
            primary_translation: song.primary_translation,
        }));

        renderSongs();
    } catch (error) {
        // If user is not logged in, do not display
        document.getElementById("for-you-container").style.display = "none";
    }
};

const createSongItem = (songData, index) => {
    const newItem = document.createElement('li');

    newItem.innerHTML = `
        <span class="song-number">${index + 1}</span>
        <span class="song-title"><a href="/song-page/${songData.primary_translation}" class="song-link" style="color:black">${songData.title}</a></span>
        <span class="song-author">${songData.artist}</span>
    `;

    return newItem;
};

const renderSongs = () => {
    const fragment = document.createDocumentFragment();
    const start = forYouList.children.length;
    const end = start + 5 <= forYouData.length ? start + 5 : forYouData.length;

    for (let i = start; i < end; i++) {
        fragment.appendChild(createSongItem(forYouData[i], i));
    }

    forYouList.appendChild(fragment);

    if (end >= 20 || end === forYouData.length) {
        showMoreButtonForYou.style.display = "none";
    }

    if (end === 0) {
        document.getElementById("for-you-container").style.display = "none";
    }
};

export async function initializeSongs() {
    showMoreButtonForYou.addEventListener('click', renderSongs);
    await fetchAndRenderSongs();
}
