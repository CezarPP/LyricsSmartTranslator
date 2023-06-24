document.querySelector('.login-container form').addEventListener('submit', function(event) {
    event.preventDefault();
    console.log("Logging in...");

    // Get the form data
    const formData = new FormData(event.target);

    // Convert the form data to JSON
    const jsonData = {
        username: formData.get('username'),
        password: formData.get('password')
    };

    // Send the form data as JSON to the server
    const loader = document.getElementById('preloader');
    loader.style.display = 'flex';
    fetch('/api/user/login', {
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
                return response.json();
            }
        })
        .then(data => {
            loader.style.display = 'none';
            alert('Failed to log in: ' + data.message);
        })
        .catch(error => {
            console.error('Error logging in:', error);
        });
});

document.querySelector('.sign-up-container form').addEventListener('submit', function(event) {
    event.preventDefault();
    console.log("Registering...");

    // Get the form data
    const formData = new FormData(event.target);

    // Create an object with selected fields
    const jsonData = {
        username: formData.get('username'),
        password: formData.get('password'),
        email: formData.get('email')
    };

    // Send the form data as JSON to the server
    const loader = document.getElementById('preloader');
    loader.style.display = 'flex';
    fetch('/api/user/register', {
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
                return response.json();
            }
        })
        .then(data => {
            loader.style.display = 'none';
            alert('Failed to register: ' + data.message);
        })
        .catch(error => {
            console.error('Error registering:', error);
        });
});