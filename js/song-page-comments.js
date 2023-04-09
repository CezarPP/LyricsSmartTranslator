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
        infAuthor.src = "https://img.olympicchannel.com/images/image/private/t_s_w960/t_s_16_9_g_auto/f_auto/primary/eegjuvlm3u2lrhkcc1oc";
        infAuthor.alt = "Avatar Image";
        infAuthor.width = 60;
        infAuthor.height = 45;
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