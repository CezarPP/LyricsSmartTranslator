import Annotation from './Annotation.js';


function getTranslation(translationId) {
    return fetch(`/api/translations/${translationId}`)
        .then(response => {
            if (!response.ok)
                throw new Error("Failed to get unreviewed annotations");
            return response.json();
        })
        .catch(error => {
            alert('Error getting translation' + error);
        })
}

function getSong(songId) {
    return fetch(`/api/songs/${songId}`)
        .then(response => {
            if (!response.ok)
                throw new Error("Failed to get unreviewed annotations");
            return response.json();
        })
        .catch(error => {
            alert('Error getting translation' + error);
        });
}

function getAnnotationContent(annotation, translation) {
    return translation.lyrics.slice(annotation.beginPos, annotation.endPos);
}

async function addAnnotation(annotationData) {
    const translation = await getTranslation(annotationData.translationId);
    const song = await getSong(translation.songId);

    const container = document.getElementById('container');

    const annotation = document.createElement('div');
    annotation.className = 'annotation';

    const title = document.createElement('h2');

    const titleLink = document.createElement('a');
    titleLink.href = "/song-page/" + translation.id;
    titleLink.textContent = song.title;
    titleLink.style.color = "black";

    title.appendChild(titleLink);
    annotation.appendChild(title);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';

    const annotatedTextDiv = document.createElement('div');
    annotatedTextDiv.className = 'annotated-text';

    const annotatedTextHeader = document.createElement('p');
    annotatedTextHeader.textContent = "Annotated text:";
    annotatedTextDiv.appendChild(annotatedTextHeader);

    const text = document.createElement('p');
    text.textContent = getAnnotationContent(annotationData, translation);
    annotatedTextDiv.appendChild(text);

    contentDiv.appendChild(annotatedTextDiv);

    const annotationTextDiv = document.createElement('div');
    annotationTextDiv.className = 'annotation-text';

    const annotationTextHeader = document.createElement('p');
    annotationTextHeader.textContent = "Annotation:";
    annotationTextDiv.appendChild(annotationTextHeader);

    const annotationText = document.createElement('p');
    annotationText.textContent = annotationData.content;
    annotationTextDiv.appendChild(annotationText);

    contentDiv.appendChild(annotationTextDiv);

    annotation.appendChild(contentDiv);

    const buttons = document.createElement('div');
    buttons.className = 'buttons';

    const acceptButton = document.createElement('button');
    acceptButton.className = 'accept';
    acceptButton.textContent = 'Accept';
    acceptButton.onclick = function () {
        annotationData.reviewed = true;
        if (confirm('Are you sure you want to accept this annotation?')) {
            fetch(`/api/annotations/${annotationData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(annotationData)
            })
                .then(response => {
                    if (!response.ok)
                        throw new Error("Error accepting annotation");
                })
                .then(() => {
                    window.location.reload();
                })
                .catch(error => {
                    console.log("Error accepting translation: " + error);
                });
        }
    };
    buttons.appendChild(acceptButton);

    const rejectButton = document.createElement('button');
    rejectButton.className = 'reject';
    rejectButton.textContent = 'Reject';
    rejectButton.onclick = function () {
        if (confirm('Are you sure you want to reject this annotation?')) {
            fetch(`/api/annotations/${annotationData.id}`, {method: 'DELETE'})
                .then(() => {
                    window.location.reload();
                })
                .catch(error => {
                    console.log("Error deleting translation: " + error);
                });
        }
    };
    buttons.appendChild(rejectButton);

    annotation.appendChild(buttons);

    container.appendChild(annotation);
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/annotations?reviewed=0')
        .then(response => {
            console.log("Got response");
            if (!response.ok)
                throw new Error("Failed to get unreviewed annotations");
            return response.json();
        })
        .then(data => {
            let annotations = data.map(annotation => new Annotation(
                annotation.id, annotation.userId, annotation.translationId,
                annotation.beginPos, annotation.endPos, annotation.content, annotation.reviewed
            ));
            annotations.forEach((annotation) => {
                addAnnotation(annotation);
            })
        })
        .catch(error => {
            console.error("Error: " + error);
            alert('Error getting annotations to be reviewed' + error);
        })
})