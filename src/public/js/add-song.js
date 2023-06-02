document
    .querySelector('.add-song-container form')
    .addEventListener('submit', function (event) {
        event.preventDefault();
        console.log("Got to event");

        const formData = new FormData(event.target);

        // Convert formData to a regular object
        let formObject = {};
        formData.forEach((value, key) => formObject[key] = value);

        delete formObject['cover-photo'];

        const imageFile = document.getElementById('cover-photo');

        const reader = new FileReader();

        reader.onloadend = function () {
            const base64String = reader.result.replace('data:', '').replace(/^.+,/, '');

            // Send the image tot the server
            fetch('/api/images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({image: base64String}),
            })
                .then(response => response.json())
                .then(data => {
                    // Get the image id back from the server
                    formObject['imageId'] = data.id;
                    // Send the rest of the form data to the server
                    return fetch('/api/songs', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formObject)
                    });
                })
                .then(response => {
                    if (response.ok) {
                        window.location.href = '/submit-song.html';
                    } else
                        alert('Failed to add song');
                })
                .catch(error => console.error(error));
        }

        reader.readAsDataURL(imageFile.files[0]);
    });