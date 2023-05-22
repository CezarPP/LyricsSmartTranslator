// TODO(add no_comments)
// TODO(about should be a short description)
async function getSongFromServer() {
    const path = window.location.pathname;
    const translationId = path.split('/')[2];
    fetch(`/api/translation/${translationId}`, {method: 'GET'})
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

async function loadTranslation(translationData) {
    const songId = translationData.songId;
    const addTranslationButton = document.getElementById('add-translation-button');
    addTranslationButton.href = `/add-translation/${songId}`;

    const userId = translationData.userId;
    const language = translationData.language;
    const description = translationData.description;
    const lyrics = translationData.lyrics;
    const no_views = translationData.no_views;
    const time = translationData.time;

    fetch(`/api/song/${songId}`, {method: 'GET'})
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
    fetch(`/api/image/${imageId}`, {method: 'GET'})
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

async function getCommentsFromServer(){
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

async function loadComments(commentsData){
    for(const commentData of commentsData)
        await addComment(commentData.username, commentData.imageId, commentData.content).then();
}
getCommentsFromServer().then(() => console.log("Got comments from the server"));

async function addComment(username, imageId, content){
    const commentsList = document.getElementById("comments-list");
    const comment = document.createElement("div");
    comment.classList.add("comment");

    const infAuthor = document.createElement("img");
    const imgLink = await fetch(`/api/image/${imageId}`, {method: 'GET'})
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
    infAuthor.style.width = 'auto';
    infAuthor.style.height = '60px';
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
document.addEventListener('DOMContentLoaded', () => {
    const submitCommentBtn = document.getElementById("submit-comment");
    const commentInput = document.getElementById("comment-input");

    submitCommentBtn.addEventListener("click", () => {
        const commentText = commentInput.value.trim();
        if (commentText) {
            addComment("Ionut", 0, commentText).then();
            commentInput.value = "";
        }
    });
});