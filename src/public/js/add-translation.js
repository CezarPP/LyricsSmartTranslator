async function setTitleAuthor() {
    const url = document.URL;
    // url should look like /add-translation/{id}
    const components = url.split('/');
    const songId = parseInt(components[components.length - 1]);
    console.log("Song id is " + songId);

    const titleElement = document.getElementById("song");
    const artistElement = document.getElementById("artist");

    fetch(`/api/song/${songId}`, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`
                    + `error is ${response.json()}`);
            }
            return response.json();
        })
        .then(data => {
            titleElement.value = data.title;
            artistElement.value = data.artist;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

const form = document.getElementById("submit-form");
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    let songElement = document.getElementById("song");
    let artistElement = document.getElementById("artist");
    let descriptionElement = document.getElementById("description");
    let translatedLyricsElement = document.getElementById("translated-lyrics");
    let languageElement = document.getElementById("language");

    let formData = {
        song: songElement.value,
        author: artistElement.value,
        description: descriptionElement.value,
        translatedLyrics: translatedLyricsElement.value,
        language: languageElement.value
    }

    await fetch('/api/translation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});

setTitleAuthor()
    .then(() => console.log("Title and author set"))