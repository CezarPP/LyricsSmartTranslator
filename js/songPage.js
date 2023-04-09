document.addEventListener('DOMContentLoaded', () => {
    // annotations feature

    const lyricsContainer = document.querySelector('.lyrics-container');
    const annotationsContainer = document.querySelector('.annotations-container');

    lyricsContainer.addEventListener('mouseup', () => {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        if (selectedText) {
            showAnnotationBox(selection);
        }
    });

    function showAnnotationBox(selection) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const annotations = document.getElementById("annotations-container").getBoundingClientRect();
        const box = document.createElement('div');
        box.classList.add('annotation-box', 'annotation-box-active');
        box.style.left = `${annotations.left}px`;
        box.style.top = `${rect.top + window.scrollY / 2}px`;

        const inputWrapper = document.createElement('div');

        const label = document.createElement('label');
        label.for = "annotations-input";
        const textArea = document.createElement('textarea');
        textArea.id = "annotations-input";
        textArea.placeholder = "Write your comment here";
        /*
            <label for="comment-input"></label>
            <textarea id="comment-input" placeholder="Write your comment here"></textarea>
             <button id="submit-comment">Submit</button>
         */

        const btnSubmit = document.createElement('button');
        btnSubmit.id = 'submit-annotation';
        btnSubmit.textContent = 'Submit';
        const btnCancel = document.createElement('button');
        btnCancel.id = 'cancel-annotation';
        btnCancel.textContent = 'Cancel';

        const btnWrapper = document.createElement('div');
        btnWrapper.id = 'annotation-btn-wrapper';

        btnSubmit.addEventListener('click', () => {
            alert('Added annotation');
/*            const annotationText = textArea.value.trim();
            if (annotationText) {
                const annotationElement = document.createElement('div');
                annotationElement.classList.add('annotation');
                annotationElement.innerHTML = `
                <h3>${selection.toString()}</h3>
                <p>${annotationText}</p>
            `;
                annotationsContainer.appendChild(annotationElement);
                box.remove();
            }*/
        });

        document.addEventListener('mousedown', (event) => {
            hideAnnotationsOnClick(event);
        });

        function hideAnnotationsOnClick(event) {
            const annotationBoxes = document.querySelectorAll('.annotation-box-active');

            if (annotationBoxes.length === 0) {
                return;
            }

            let shouldHideAnnotations = true;

            annotationBoxes.forEach((box) => {
                if (box.contains(event.target)) {
                    shouldHideAnnotations = false;
                }
            });

            if (shouldHideAnnotations) {
                annotationBoxes.forEach((box) => {
                    box.classList.remove('annotation-box-active');
                });
            }
        }


        const annotationBoxTitle = document.createElement('h2');
        annotationBoxTitle.textContent = 'Annotation';
        annotationBoxTitle.classList.add('annotation-box-title');

        btnCancel.addEventListener('click', () => {
            box.remove();
        });

        box.appendChild(annotationBoxTitle);
        inputWrapper.appendChild(textArea);
        box.appendChild(inputWrapper);
        btnWrapper.appendChild(btnSubmit);
        btnWrapper.appendChild(btnCancel);
        box.appendChild(btnWrapper);

        document.body.appendChild(box);
    }

    function addAnnotation(selectedText, annotation) {
        const annotationElement = document.createElement('div');
        annotationElement.classList.add('annotation');
        annotationElement.innerHTML = `
            <h3>${selectedText}</h3>
            <p>${annotation}</p>
        `;
        annotationsContainer.appendChild(annotationElement);
    }

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

    /*https://img.olympicchannel.com/images/image/private/t_s_w960/t_s_16_9_g_auto/f_auto/primary/eegjuvlm3u2lrhkcc1oc*/
    function addComment(text) {
        const comment = document.createElement("div");
        comment.classList.add("comment");

        const infAuthor = document.createElement("img");
        infAuthor.src = "https://img.olympicchannel.com/images/image/private/t_s_w960/t_s_16_9_g_auto/f_auto/primary/eegjuvlm3u2lrhkcc1oc";
        infAuthor.alt = "Avatar Image";
        infAuthor.width = "60";
        infAuthor.height = "45";
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

