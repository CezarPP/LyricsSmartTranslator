const showMoreButtonCharts = document.querySelector('#charts-container .show-more-button');
const chartsList = document.querySelector('#charts-container .charts-list');

const songs = [];
const translationId = [];
const artists = [];

const getNewestSongsData = async () => {
    songs.length = 0;
    artists.length = 0;
    translationId.length = 0;
    await fetch('/api/stats/songs', {method: 'GET'})
        .then(response => response.json())
        .then(data => {
            data.forEach(song => {
                songs.push(song.title);
                translationId.push(song.translationId);
                artists.push(song.artist);
            });

        })
        .catch(err => console.log('Error getting the newest songs ' + err));
}
const addMoreCharts = () => {
    for (let i = 1; i <= 5; i++) {
        const newItem = document.createElement('li');
        const index = chartsList.children.length + 1;
        const id = translationId[index - 1];
        if(id === undefined) {
            showMoreButtonCharts.style.display = "none";
            break;
        }
        newItem.innerHTML = `
      <span class="song-number">${index}</span>
      <span class="song-title"><a href="/song-page/${id}" style="color:black">${songs[index - 1]}</a></span>
      <span class="song-author">${artists[index]}</span>
    `;
        chartsList.appendChild(newItem);
        if (chartsList.children.length > 20)
            showMoreButtonCharts.style.display = "none";
    }
};

const addMoreChartsFirstTime = async () => {
    await getNewestSongsData();
    await addMoreCharts();
}

showMoreButtonCharts.addEventListener('click', addMoreCharts);

addMoreChartsFirstTime()
    .then();
