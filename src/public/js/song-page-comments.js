document.addEventListener('DOMContentLoaded', () => {
    const submitCommentBtn = document.getElementById("submit-comment");
    const commentInput = document.getElementById("comment-input");
    const commentsList = document.getElementById("comments-list");

    submitCommentBtn.addEventListener("click", () => {
        const commentText = commentInput.value.trim();

        if (commentText) {
            addComment(commentText);
            commentInput.value = "";
        }
    });
    function addComment(text) {
        const comment = document.createElement("div");
        comment.classList.add("comment");

        const infAuthor = document.createElement("img");
        infAuthor.src = "img/default-profile-photo.png";
        infAuthor.alt = "Avatar Image";
        infAuthor.style.width = 'auto';
        infAuthor.style.height = '60px';
        comment.appendChild(infAuthor);

        const commentDetails = document.createElement("div");
        commentDetails.classList.add("comment-details");

        const commentAuthor = document.createElement("h3");
        commentAuthor.textContent = "Ionut";
        commentDetails.appendChild(commentAuthor);

        const commentText = document.createElement("p");
        commentText.textContent = text;
        commentDetails.appendChild(commentText);

        comment.appendChild(commentDetails);

        commentsList.appendChild(comment);
    }
});