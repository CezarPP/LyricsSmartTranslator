document
    .querySelector('.login-container form')
    .addEventListener('submit', function (event) {
        event.preventDefault();
        console.log("Logging in...");

        // Get the form data
        const formData = new FormData(event.target);

        // Send the form data to the server
        fetch('/login', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                console.log("Response message:", data.message);
        })
        .catch(error => {
            console.error('Error logging in:', error);
        });
});

document
    .querySelector('.sign-up-container form')
    .addEventListener('submit', function (event) {
        event.preventDefault();
        console.log("Registering...");

        // Get the form data
        const formData = new FormData(event.target);

        // Send the form data to the server
        fetch('/register', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                console.log("Response message:", data.message);
            })
            .catch(error => {
                console.error('Error registering:', error);
            });
});