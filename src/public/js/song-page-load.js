async function getSongFromServer() {
    const path = window.location.pathname;
    const songId = path.split('/')[2];
    fetch(`/get-song-data/${songId}`, {method: 'POST'})
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`
                    + `error is ${response.json()}`);
            }
            return response.json();
        })
        .then(data => {
            loadSong(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

async function loadSong(data) {
    console.log("Link is " + data.songLink);
    console.log("Lyrics are " + data.lyrics);
    document.getElementById('song-link').src = data.songLink;
    document.getElementById('song-img').src = data.imageLink;
    document.getElementById('song-author').textContent = data.author;
    document.getElementById('about-content').textContent = data.description; // TODO(change to short version)
    document.getElementById('song-description').textContent = data.description;
    document.getElementById('song-title').textContent = data.title;
    document.getElementById('lyrics-song-title').textContent = data.title;
    document.getElementById('lyrics-paragraphs').textContent = data.lyrics;
    document.getElementById('no-likes').textContent = data.no_likes;
    document.getElementById('no-comments').textContent = data.no_comments;
    document.getElementById('no-views').textContent = data.no_views;
}

getSongFromServer().then(() => console.log("Got data from the server"));