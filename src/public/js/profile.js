async function getUserInfo() {
    const path = window.location.pathname;
    const username = path.split('/')[2];
    fetch(`/api/user/${username}`, {method: 'GET'})
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error getting user info from server status: ${response.status}`
                    + `error is ${response.json()}`);
            }
            return response.json();
        })
        .then(userData => {
            setUserData(userData);
        })
        .catch(error => {
            console.error("Error: ", error);
        })
}

async function setUserData(userData) {
    const username = userData.username;
    const img_id = userData.img_id;
    const email = userData.email;
    const translationsCount = userData.translationsCount;
    const annotationsCount = userData.annotationsCount;
    const commentsCount = userData.commentsCount;

    document.getElementById('username').textContent = username;
    document.getElementById('email').textContent = email;
    document.getElementById('translations-count').textContent = translationsCount;
    document.getElementById('annotations-count').textContent = annotationsCount;
    document.getElementById('comments-count').textContent = commentsCount;

    await setImage(img_id);
}

async function setImage(img_id) {
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

getUserInfo().then(() => {
    const loader = document.getElementById('preloader');
    loader.style.display = 'none';
});