function Annotation(id, userId, translationId, beginPos, endPos, content, reviewed) {
    this.id = id;
    this.userId = userId;
    this.translationId = translationId;
    this.beginPos = beginPos;
    this.endPos = endPos;
    this.content = content;
    this.reviewed = reviewed;
}

Annotation.prototype.toObject = function () {
    return {
        id: this.id,
        userId: this.userId,
        translationId: this.translationId,
        beginPos: this.beginPos,
        endPos: this.endPos,
        content: this.content,
        reviewed: this.reviewed,
    };
};

function encodePair(a, b) {
    return `${a}-${b}`;
}

function decodePair(pairStr) {
    return pairStr.split('-').map(Number);
}

function rangeIntersects(map, start, end) {
    for (let annotation of map.values()) {
        if ((start >= annotation.beginPos && start <= annotation.endPos) ||
            (end >= annotation.beginPos && end <= annotation.endPos) ||
            (start <= annotation.beginPos && end >= annotation.endPos)) {
            return true;
        }
    }
    return false;
}

document.addEventListener('DOMContentLoaded', () => {
    // span start, span length excluding text
    let spanMap = new Map();
    // span id, annotation
    let annotationsMap = new Map();

    let activeAnnotationBox = null;
    const lyricsContainer = document.querySelector('.content-container');

    const path = window.location.pathname;
    const translationId = path.split('/')[2];
    let translation = null;

    fetch(`/api/translations/${translationId}`, {method: 'GET'})
        .then(response => response.json())
        .then(data => {
            translation = data;
        })
        .catch(error => console.error('Error:', error));

    fetch(`/api/annotations?translationId=${translationId}`)
        .then(response => response.json())
        .then(data => {
            let annotations = data.map(annotation => new Annotation(
                annotation.id, annotation.userId, annotation.translationId,
                annotation.beginPos, annotation.endPos, annotation.content, annotation.reviewed
            ));

            annotations.forEach((annotation) => addAnnotation(annotation));
        })
        .catch(error => console.error('Error:', error));

    function adjustDBToHTMLPosition(position) {
        let newPosition = position;
        for (const [key, value] of spanMap) {
            if (key < position)
                newPosition += value;
        }
        return newPosition;
    }

    function getContainerOffset(container) {
        let node = container.parentNode.firstChild;
        let globalOffset = 0;

        while (node !== container) {
            if (node.textContent)
                globalOffset += node.textContent.length;
            node = node.nextSibling;
        }

        return globalOffset;
    }


    function addAnnotation(annotation) {

        const lyricParagraphs = document.getElementById('lyrics-paragraphs');
        const lyricsText = lyricParagraphs.textContent;
        const annotatedText = lyricsText.slice(annotation.beginPos, annotation.endPos);
        const span = document.createElement('span');
        span.id = 'annotation-id-' + encodePair(annotation.beginPos, annotation.endPos);
        span.style.backgroundColor = 'rgb(233, 233, 233)';
        span.style.cursor = 'pointer';
        span.textContent = annotatedText;
        span.style.userSelect = 'none';

        annotationsMap.set(span.id, annotation);

        const lyricsHTML = lyricParagraphs.innerHTML;
        const htmlStart = adjustDBToHTMLPosition(annotation.beginPos);
        const htmlEnd = adjustDBToHTMLPosition(annotation.endPos);

        lyricParagraphs.innerHTML =
            lyricsHTML.slice(0, htmlStart) +
            span.outerHTML +
            lyricsHTML.slice(htmlEnd);


        const spanLength = span.outerHTML.length - span.textContent.length;
        spanMap.set(annotation.beginPos, spanLength);

        document.querySelectorAll('[id^="annotation-id-"]').forEach((element) => {
            element.addEventListener('click', (e) => {
                // This is to not trigger the event listener of adding a new annotation
                e.stopPropagation();
                showAnnotationBox(e.currentTarget);
            });
        });

        return span;
    }

    lyricsContainer.addEventListener('mouseup', () => {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        if (selectedText) {
            const range = selection.getRangeAt(0);
            const container = range.startContainer;
            const containerOffset = getContainerOffset(container);
            const startOffset = range.startOffset + containerOffset;
            const endOffset = range.endOffset + containerOffset;

            // Annotation intersects other annotations
            if (rangeIntersects(annotationsMap, startOffset, endOffset)
                || range.startContainer !== range.endContainer
                || (translation !== null && startOffset > translation.lyrics.length)) {
                return;
            }

            console.log('New annotation position is ' + startOffset + ' ' + endOffset);

            const span =
                addAnnotation(new Annotation(0, 0, translationId, startOffset, endOffset, '', false));
            if (span === null) {
                console.log("Span is null");
            }
            showAnnotationBox(span);
        }
    });

    document.addEventListener('mousedown', (event) => {
        hideAnnotationsOnClick(event);
    });

    window.addEventListener('resize', updateAnnotationBoxPosition);

    /**
     * Prints the box that lets you create or edit an annotation
     * @param span -> the span that contains the text that was clicked on
     */
    function showAnnotationBox(span) {
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
        textArea.placeholder = "Write your annotation here";
        textArea.readOnly = true;
        const annotation = annotationsMap.get(span.id);
        if (annotation.content)
            textArea.value = annotation.content;

        const btnSubmit = document.createElement('button');
        btnSubmit.id = 'submit-annotation';
        btnSubmit.textContent = 'Submit';
        btnSubmit.addEventListener('click', () => {
            textArea.readOnly = true;
            let annotationText = textArea.value.trim();
            if (annotationText) {
                box.classList.remove('annotation-box-active');
                const newAnnotation = annotationsMap.get(span.id);
                newAnnotation.content = annotationText;
                annotationsMap.set(span.id, newAnnotation);
            }
        });

        const btnEdit = document.createElement('button');
        btnEdit.id = 'btn-edit-annotation';
        btnEdit.textContent = 'Edit';
        btnEdit.addEventListener('click', () => {
            textArea.readOnly = !textArea.readOnly;
        });

        const btnShare = document.createElement('button');
        btnShare.id = 'btn-share-annotation';
        btnShare.textContent = 'Share';
        btnShare.addEventListener('click', () => {
            textArea.readOnly = true;
            alert("VLAD");// TODO(Vlad)
        });

        const btnWrapper = document.createElement('div');
        btnWrapper.id = 'annotation-btn-wrapper';

        box.appendChild(annotationBoxTitle);
        box.appendChild(textArea);
        btnWrapper.appendChild(btnSubmit);
        btnWrapper.appendChild(btnEdit);
        btnWrapper.appendChild(btnShare);
        box.appendChild(btnWrapper);

        document.body.appendChild(box);
    }

    function hideAnnotationsOnClick(event) {
        if (activeAnnotationBox !== null && !activeAnnotationBox.contains(event.target)) {
            activeAnnotationBox.classList.remove('annotation-box-active');
            activeAnnotationBox = null;
        }
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
});
