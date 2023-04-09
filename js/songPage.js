document.addEventListener('DOMContentLoaded', () => {
    // add ability to select lyrics
    const lyricsContainer = document.querySelector('.lyrics-container');
    const annotationsContainer = document.querySelector('.annotations-container');

    lyricsContainer.addEventListener('mouseup', () => {
        const selectedText = window.getSelection().toString();
        if (selectedText) {
            const annotation = prompt('Add an annotation for the selected text:');
            if (annotation) {
                const annotationElement = document.createElement('div');
                annotationElement.classList.add('annotation');
                annotationElement.innerHTML = `
                    <h3>${selectedText}</h3>
                    <p>${annotation}</p>
                `;
                annotationsContainer.appendChild(annotationElement);
            }
        }
    });

    // add comment adding feature
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

        const commentAuthor = document.createElement("h3");
        commentAuthor.textContent = "Ionut";
        comment.appendChild(commentAuthor);

        const commentText = document.createElement("p");
        commentText.textContent = text;
        comment.appendChild(commentText);

        commentsList.appendChild(comment);
    }
});

