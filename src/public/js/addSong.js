document
    .querySelector('.add-song-container form')
    .addEventListener('submit', function (event) {
        event.preventDefault();
        console.log("Got to event");

        const formData = new FormData(event.target);

        const imageFile = formData.get('cover-photo');

        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        // Send the image file to the server
        fetch('/image', {
            method: 'POST',
            body: imageFormData
        })
            .then(response => response.json())
            .then(data => {
                console.log("Appended image");
                formData.append('image-id', data.id);

                // Send the rest of the form data to the server
                return fetch('submit-song.html', {
                    method: 'POST',
                    body: formData
                });
            })
            .then(response => {
                console.log("Add response from server");
                // Handle the response from the server
                if (response.ok) {
                    alert('Song added successfully!');
                } else {
                    alert('Failed to add song');
                }
            })
            .catch(error => {
                console.error('Error submitting song:', error);
            });
    });
