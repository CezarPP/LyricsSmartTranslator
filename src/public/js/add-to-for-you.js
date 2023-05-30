const showMoreButtonForYou = document.querySelector('#for-you-container .show-more-button');
const forYouList = document.querySelector('#for-you-container .for-you-list');

const forYouSongs = [];
const forYouArtists = [];
const translationIds = [];

const getForYouSongsData = async () => {
    forYouSongs.length = 0;
    forYouArtists.length = 0;
    await fetch('/api/user/recommendations', {method: 'GET'})
        .then(response => response.json())
        .then(data => {
            data.forEach(song => {
                forYouSongs.push(song.title);
                forYouArtists.push(song.artist);
                translationIds.push(song.primary_translation);
            });

        })
        .catch(err => console.log('Error getting the songs for you ' + err));
}
const addMoreForYou = () => {
    for (let i = 1; i <= 5; i++) {
        const newItem = document.createElement('li');
        const index = forYouList.children.length + 1;
        const song = forYouSongs[index - 1];
        if (song === undefined) {
            showMoreButtonForYou.style.display = "none";
            break;
        }
        newItem.innerHTML = `
      <span class="song-number">${index}</span>
      <span class="song-title"><a href="/song-page/${translationIds[index - 1]}" style="color:black">${song}</a></span>
      <span class="song-author">${forYouArtists[index]}</span>
    `;
        forYouList.appendChild(newItem);
        if (forYouList.children.length > 20)
            showMoreButtonForYou.style.display = "none";
    }
    if (forYouList.children.length === 0) {
        document.getElementById("for-you-container").style.display = "none";
    }
};

const addMoreForYouFirstTime = async () => {
    await getForYouSongsData();
    await addMoreForYou();
}

showMoreButtonForYou.addEventListener('click', addMoreForYou);

addMoreForYouFirstTime()
    .then();