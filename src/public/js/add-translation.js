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

document.addEventListener('DOMContentLoaded', async () => {
    await setTitleAuthor();
    const form = document.getElementById("submit-form");
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // display loader
        const loader = document.getElementById('preloader');
        loader.style.display = 'flex';

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
            .then(response => {
                if (response.ok) {
                    window.location.href = '/submit-translation.html';
                } else {
                    return response.json();
                }
            })
            .then(data => {
                loader.style.display = 'none';
                alert('Failed to add translation: ' + data.message);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });
})