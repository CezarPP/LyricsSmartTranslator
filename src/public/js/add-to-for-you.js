const showMoreButtonForYou = document.querySelector('#for-you-container .show-more-button');
const forYouList = document.querySelector('#for-you-container .for-you-list');

let forYouData = [];

const getForYouSongsData = async () => {
    try {
        const response = await fetch('/api/user/recommendations', {method: 'GET'});
        const data = await response.json();

        forYouData = data.map(song => ({
            title: song.title,
            artist: song.artist,
            primary_translation: song.primary_translation,
        }));

    } catch (error) {
        console.error('Error fetching song data: ', error);
    }
};

const addMoreForYou = () => {
    const childrenLength = forYouList.children.length;

    for (let i = 1; i <= 5 && childrenLength + i <= forYouData.length; i++) {
        const songData = forYouData[childrenLength + i - 1];
        const newItem = document.createElement('li');

        newItem.innerHTML = `
            <span class="song-number">${childrenLength + i}</span>
            <span class="song-title"><a href="/song-page/${songData.primary_translation}" style="color:black">${songData.title}</a></span>
            <span class="song-author">${songData.artist}</span>
        `;

        forYouList.appendChild(newItem);
        if (childrenLength + i >= 20) showMoreButtonForYou.style.display = "none";
    }

    if (childrenLength === 0) document.getElementById("for-you-container").style.display = "none";
};

export async function addMoreForYouFirstTime() {
    showMoreButtonForYou.addEventListener('click', addMoreForYou);
    await getForYouSongsData();
    await addMoreForYou();
}
