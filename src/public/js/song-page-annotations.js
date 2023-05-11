document.addEventListener('DOMContentLoaded', () => {
    // annotations feature
    let activeAnnotationBox;
    const lyricsContainer = document.querySelector('.lyrics-container');

    const annotationsMap = new Map(); // (text, annotation)

    lyricsContainer.addEventListener('mouseup', () => {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        if (selectedText && !annotationsMap.has(selectedText)) {
            showAnnotationBox(selection, selectedText);
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

    /**
     * Prints the box that lets you annotate text not annotated before
     * @param selection
     * @param selectedText
     */
    function showAnnotationBox(selection, selectedText) {
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

        const btnSubmit = document.createElement('button');
        btnSubmit.id = 'submit-annotation';
        btnSubmit.textContent = 'Submit';
        const btnCancel = document.createElement('button');
        btnCancel.id = 'cancel-annotation';
        btnCancel.textContent = 'Cancel';

        const btnWrapper = document.createElement('div');
        btnWrapper.id = 'annotation-btn-wrapper';

        btnSubmit.addEventListener('click', () => {
            let annotationText = textArea.value.trim();
            if (annotationText) {
                annotationsMap.set(selectedText, annotationText);
                const span = document.createElement('span');
                span.style.backgroundColor = 'rgb(233, 233, 233)';
                span.style.cursor = 'pointer';
                span.textContent = selectedText;
                span.addEventListener('click', () => {
                    showAnnotatedBox(span);
                });
                range.deleteContents();
                range.insertNode(span);
                box.remove();
            }
        });

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

    /**
     * Prints the box that lets you edit already annotated text
     * @param span -> the span that contains the text that was clicked on
     */
    function showAnnotatedBox(span) {
        const rect = span.getBoundingClientRect();
        const annotations = document.getElementById("annotations-container").getBoundingClientRect();
        const box = document.createElement('div');
        box.classList.add('annotation-box', 'annotation-box-active');
        const topValue = rect.top + window.scrollY;
        box.style.left = `${annotations.left}px`;
        box.style.top = `${topValue}px`;
        activeAnnotationBox = box;

        const annotationBoxTitle = document.createElement('h2');
        annotationBoxTitle.textContent = 'Annotation';
        annotationBoxTitle.classList.add('annotation-box-title');

        const textArea = document.createElement('textarea');
        textArea.id = "editable-annotation-text";
        textArea.readOnly = true;
        textArea.value = annotationsMap.get(span.textContent);

        const btnEdit = document.createElement('button');
        btnEdit.id = 'btn-edit-annotation';
        btnEdit.textContent = 'Edit';

        const btnSave = document.createElement('button');
        btnSave.id = 'btn-save-annotation';
        btnSave.textContent = 'Save';

        const btnShare = document.createElement('button');
        btnShare.id = 'btn-share-annotation';
        btnShare.textContent = 'Share';

        const btnWrapper = document.createElement('div');
        btnWrapper.id = 'annotation-btn-wrapper';

        btnEdit.addEventListener('click', () => {
            textArea.readOnly = !textArea.readOnly;
        });

        btnSave.addEventListener('click', () => {
            const newText = textArea.value.trim();
            annotationsMap.set(span.textContent, newText);
            textArea.readOnly = !textArea.readOnly;
        });

        btnShare.addEventListener('click', () => {
            alert("Sharing is caring");
        });

        box.appendChild(annotationBoxTitle);
        box.appendChild(textArea);
        btnWrapper.appendChild(btnEdit);
        btnWrapper.appendChild(btnSave);
        btnWrapper.appendChild(btnShare);
        box.appendChild(btnWrapper);

        document.body.appendChild(box);
    }
});

