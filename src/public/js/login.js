

document.querySelector('.login-container form').addEventListener('submit', function (event) {
    event.preventDefault();
    console.log("Logging in...");

    // Get the form data
    const formData = new FormData(event.target);

    // Convert the form data to JSON
    const jsonData = {
        username: formData.get('username'),
        password: formData.get('password')
    };

    console.log(jsonData.username);
    console.log(jsonData.password);

    // Send the form data as JSON to the server
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    })
        .then(response => {
            if(response.ok){
                window.location.href = "/";
            }
            else{
                alert('Failed to log in');
            }
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

        // Create an object with selected fields
        const jsonData = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        // Send the form data as JSON to the server
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        })
            .then(response => {
                if(response.ok){
                    window.location.href = "/register-page.html";
                }
                else{
                    alert('Failed to register');
                }
            })
            .catch(error => {
                console.error('Error registering:', error);
            });
    });