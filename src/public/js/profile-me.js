let imageId = null;

async function getUserInfo(username) {
    fetch(`/api/user/${username}`, {method: 'GET'})
        .then(response => {
            if(!response.ok){
                throw new Error(`Error getting user info from server status: ${response.status}`
                    + `error is ${response.json()}`);
            }
            return response.json();
        })
        .then(userData => {
            setUserData(userData);
        })
        .catch(error =>{
            console.error("Error: ", error);
        })
}

async function setUserData(userData){
    const username = userData.username;
    const img_id = userData.img_id;
    const translationsCount = userData.translationsCount;
    const annotationsCount = userData.annotationsCount;
    const commentsCount = userData.commentsCount;
    const email = userData.email;

    document.querySelector("#username").value = username;
    document.querySelector("#email").value = email;
    document.querySelector("#translations-count").textContent = translationsCount;
    document.querySelector("#annotations-count").textContent = annotationsCount;
    document.querySelector("#comments-count").textContent = commentsCount;

    imageId = img_id;
    await setImage(img_id);
}

async function setImage(img_id) {
    // o sa pun o constanta aici
    fetch(`/api/images/${img_id}`, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`
                    + `error is ${response.json()}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('profile-photo-img').src = data.link;
        })
        .catch(error => {
            console.error("Error: " + error);
        })
}
document.addEventListener("DOMContentLoaded", function () {

    const currentURL = window.location.href;
    const parts = currentURL.split('/');
    const username = parts[parts.length - 1];

    const saveChangesBtn = document.querySelector("#save-changes");
    const changePhotoBtn = document.querySelector("#change-photo");
    const photoInput = document.querySelector("#upload-photo");
    const logoutBtn = document.querySelector("#logout-btn");
    const removeAccountBtn = document.querySelector("#remove-account-btn");

    saveChangesBtn.addEventListener("click", event => saveChanges(event));
    changePhotoBtn.addEventListener("click", () => photoInput.click());
    logoutBtn.addEventListener("click", event => logout(event));
    removeAccountBtn.addEventListener("click", event => removeAccount(event));

    getUserInfo(username).then(() => console.log("userData loaded"));

    function logout(event) {
        event.preventDefault();
        fetch('/api/user/logout', { method: 'POST' })
            .then(response => {
                if(!response.ok){
                    throw new Error(`Error logging user out from server status: ${response.status}`
                        + `error is ${response.json()}`);
                }
                else
                    window.location.href = '/'; // Redirect to the main page after logout
            })
            .catch(error => {
                console.error("Error logging out:", error);
            });
    }
    function removeAccount(event) {
        event.preventDefault();
        fetch(`/api/user/${username}`, {method: 'DELETE'})
            .then(response => {
                if(!response.ok){
                    throw new Error(`Error deleting user from server status: ${response.status}`
                        + `error is ${response.json()}`);
                }
                else
                    window.location.href = '/';
            })
            .catch(error =>{
                console.error("Error: ", error);
            })
    }

    function saveChanges(event) {
        event.preventDefault();
        const imageFile = document.getElementById('upload-photo');
        const reader = new FileReader();
        const newUsername = document.getElementById('username').value.trim();
        const newPassword = document.getElementById('password').value;
        const newEmail = document.getElementById('email').value.trim();

       if(newUsername === ''){
           alert('Username field cannot be empty');
           return;
       }

       if(newEmail === ''){
           alert('Email cannot be empty');
           return;
       }

       const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

       if(!emailPattern.test(newEmail)){
           alert('Invalid email format');
           return;
       }

        if(imageId === null) {
            reader.onloadend = function () {
                const base64String = reader.result.replace('data:', '').replace(/^.+,/, '');
                // Send the image to the server
                fetch('/api/images', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({image: base64String}),
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Error adding new user photo: ${response.status}`
                                + `error is ${response.json()}`);
                        } else {
                            return response.json();
                        }
                    })
                    .then(data => {
                        const newImgId = data.id;

                        return fetch(`/api/user/${username}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({newUsername, newImgId, newPassword, newEmail})
                        });
                    })
                    .then(response => {
                        if (!response.ok) {
                            alert('Failed to change user data');
                        } else {
                            const newUsername = document.getElementById('username').value;
                            window.location.href = '/profile/' + newUsername;
                        }
                    })
                    .catch(error => console.error(error));
            }
            reader.readAsDataURL(imageFile.files[0]);
        } else {
            const newImgId = imageId;

            fetch(`/api/user/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({newUsername, newImgId, newPassword, newEmail})
            }).then(response => {
                if(!response.ok)
                    alert('Failed to change user data');
                else{
                    const newUsername = document.getElementById('username').value;
                    window.location.href = '/profile/' + newUsername;
                }
            }).catch(error =>{
                console.error("Error: " + error);
            })
        }
    }


    photoInput.addEventListener("change", function (event) {
        event.preventDefault();
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            const profilePhoto = document.querySelector("#profile-photo-img");
            reader.onload = function (e) {
                profilePhoto.src = e.target.result;
            };
            imageId = null;
            reader.readAsDataURL(event.target.files[0]);
        }
    });
});