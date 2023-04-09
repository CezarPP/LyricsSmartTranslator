document.addEventListener('DOMContentLoaded', () => {
    // annotations feature
    let activeAnnotationBox;
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
        const topValue = rect.top + window.scrollY;
        box.style.left = `${annotations.left}px`;
        box.style.top = `${topValue}px`;
        activeAnnotationBox = box;
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
            let annotationText = textArea.value.trim();
            if (annotationText) {
                const annotationElement = document.createElement('div');
                annotationElement.classList.add('annotation');
                annotationElement.innerHTML = `
                            <h3>${selection.toString()}</h3>
                            <p>${annotationText}</p>
                        `;
                annotationsContainer.appendChild(annotationElement);
                box.remove();
            }
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
        setTimeout(() => {
            updateAnnotationBoxPosition();
        }, 0);
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

    function updateAnnotationBoxPosition() {
        if (activeAnnotationBox) {
            const range = window.getSelection().getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const annotations = document.getElementById("annotations-container").getBoundingClientRect();
            const topValue = rect.top + window.scrollY;
            activeAnnotationBox.style.left = `${annotations.left}px`;
            activeAnnotationBox.style.top = `${topValue}px`;
        }
    }

    window.addEventListener('resize', updateAnnotationBoxPosition);
});

