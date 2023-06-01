function getSongId() {
    const url = document.URL;
    // url should look like /add-translation/{id}
    const components = url.split('/');
    return parseInt(components[components.length - 1]);
}

async function setTitleAuthor() {
    const songId = getSongId();
    console.log("Song id is " + songId);

    const titleElement = document.getElementById("song");
    const artistElement = document.getElementById("artist");

    fetch(`/api/songs/${songId}`, {method: 'GET'})
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

    let descriptionElement = document.getElementById("description");
    let translatedLyricsElement = document.getElementById("translated-lyrics");
    let languageElement = document.getElementById("language");

    let formData = {
        songId: getSongId(),
        description: descriptionElement.value,
        lyrics: translatedLyricsElement.value,
        language: languageElement.value
    }

    await fetch('/api/translations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            // Redirect the user to a success page
            if (data.translationId !== undefined) {
                window.location.href = data.redirectPage;
            } else {
                alert('Failed to add translation');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});

setTitleAuthor()
    .then(() => console.log("Title and author set"))