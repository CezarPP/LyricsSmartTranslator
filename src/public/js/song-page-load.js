// TODO(add no_comments)
// TODO(about should be a short description)
async function getSongFromServer() {
    const path = window.location.pathname;
    const translationId = path.split('/')[2];
    fetch(`/api/translations/${translationId}`, {method: 'GET'})
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

/*async function setUserTranslation(userId) {
    fetch(`/api/user/${userId}`, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`
                    + `error is ${response.json()}`);
            }
            return response.json();
        })
        .then(user => {
            document.getElementById('by-user').textContent = user.username;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}*/

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
                language.textContent = translation.language;
                languageOptions.appendChild(language);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


async function loadTranslation(translationData) {
    const songId = translationData.songId;
    setTranslationLanguages(songId)
        .then();
    const addTranslationButton = document.getElementById('add-translation-link');
    addTranslationButton.href = `/add-translation/${songId}`;

    const userId = translationData.userId;
    /*    setUserTranslation(userId)
            .then();*/
    const language = translationData.language;
    const description = translationData.description;
    const lyrics = translationData.lyrics;
    const no_views = translationData.no_views;
    const time = translationData.time;

    fetch(`/api/songs/${songId}`, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`
                    + `error is ${response.json()}`);
            }
            return response.json();
        })
        .then(async data => {
            await setSongElements(data.link, data.imageId, data.artist, data.title);
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

async function setSongElements(link, imageId, artist, title) {
    document.getElementById('song-link').src = link;
    document.getElementById('song-author').textContent = artist;
    document.getElementById('song-title').textContent = title;
    document.getElementById('lyrics-song-title').textContent = title;
    await setImage(imageId);
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

getSongFromServer().then(() => console.log("Got data from the server"));


async function getCommentsFromServer() {
    const path = window.location.pathname;
    const translationId = path.split('/')[2];
    fetch(`/api/comments/${translationId}`, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error getting translation from server status: ${response.status}`
                    + `error is ${response.json()}`);
            }
            return response.json();
        })
        .then(commentsData => {
            loadComments(commentsData);
        })
        .catch(error => {
            console.error('Error:', error);
        })
}

async function loadComments(commentsData) {
    document.getElementById('no-comments').textContent = commentsData.length;
    for (const commentData of commentsData)
        await addComment(commentData.username, commentData.imageId, commentData.content).then();
}

async function addComment(username, imageId, content) {
    const commentsList = document.getElementById("comments-list");
    const comment = document.createElement("div");
    comment.classList.add("comment");

    const infAuthor = document.createElement("img");
    const imgLink = await fetch(`/api/images/${imageId}`, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`
                    + `error is ${response.json()}`);
            }
            return response.json();
        })
        .then(data => {
            return data.link;
        })
        .catch(error => {
            console.error('Error: ' + error);
        });
    infAuthor.src = imgLink;
    infAuthor.alt = "Avatar Image";
    comment.appendChild(infAuthor);

    const commentDetails = document.createElement("div");
    commentDetails.classList.add("comment-details");

    const commentAuthor = document.createElement("h3");
    commentAuthor.textContent = username;
    commentDetails.appendChild(commentAuthor);

    const commentText = document.createElement("p");
    commentText.textContent = content;
    commentDetails.appendChild(commentText);

    comment.appendChild(commentDetails);

    commentsList.appendChild(comment);
}

async function handleComments() {
    getCommentsFromServer().then(() => console.log("Got comments from the server"));

    const meResponse = await fetch('/api/me', {method: 'GET'});
    if (!meResponse.ok) {
        document.querySelector('.input-container').style.display = 'none';
        document.getElementById('add-translation-button').style.display = 'none';
        return;
    }

    const meData = await meResponse.json();
    const userResponse = await fetch(`/api/user/${meData.username}`, {method: 'GET'});
    const userInfo = await userResponse.json();
    const imgResponse = await fetch(`/api/images/${userInfo.img_id}`, {method: 'GET'});
    const imgInfo = await imgResponse.json();

    document.querySelector(".avatar-container img").src = imgInfo.link;

    const submitCommentBtn = document.getElementById("submit-comment");
    const commentInput = document.getElementById("comment-input");

    submitCommentBtn.addEventListener("click", () => {
        const commentText = commentInput.value.trim();
        if (commentText) {
            const path = window.location.pathname;
            const translationId = path.split('/')[2];
            const content = commentText;
            fetch(`/api/comments`, {
                method: `POST`,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({translationId, content})
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error adding comment: ${response.status}`
                            + `error is ${response.json()}`);
                    } else window.location.href = path;
                })
                .catch(error => {
                    console.error("Error adding comment");
                });
        }
    });
}

handleComments().then(() => console.log('Comments done'));
