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

    let meResponse;
    try{
        meResponse = await fetch('/api/me', {method: 'GET'});
        if(!meResponse.ok){
            document.querySelector('.input-container').style.display = 'none';
            document.getElementById('add-translation-button').style.display = 'none';
            return;
        }
    } catch(error){
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
