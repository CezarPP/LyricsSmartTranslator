document
    .querySelector('.add-song-container form')
    .addEventListener('submit', function (event) {
        event.preventDefault();
        console.log("Got to event");

        const formData = new FormData(event.target);

        const imageFile = document.getElementById('cover-photo');

        const reader = new FileReader();

        reader.onloadend = function () {
            const base64String = reader.result.replace('data:', '').replace(/^.+,/, '');

            fetch('/image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({image: base64String}),
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Got image id " + data.id);
                    formData.append('image-id', data.id);
                    // Send the rest of the form data to the server
                    console.log("Submitting to submit-song");
                    return fetch('/submit-song.html', {
                        method: 'POST',
                        body: formData
                    });
                })
                .then(response => {
                    console.log("Add response from server");
                    // Handle the response from the server
                    if (response.ok) {
                        window.location.href = "/submit-song.html";
                    } else {
                        alert('Failed to add song');
                    }
                }).catch(error => console.error(error));
        }

        reader.readAsDataURL(imageFile.files[0]);
    });