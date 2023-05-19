document.addEventListener("DOMContentLoaded", function () {
    const saveChangesBtn = document.querySelector("#save-changes");
    const changePhotoBtn = document.querySelector("#change-photo");
    const usernameInput = document.querySelector("#username");
    const passwordInput = document.querySelector("#password");
    const photoInput = document.querySelector("#upload-photo");

    const currentURL = window.location.href;
    const parts = currentURL.split('/');
    const username = parts[parts.length - 1];

    // Hide the profile container initially
    const profileContainer = document.querySelector("#profile-container");
    profileContainer.style.display = "none";

    saveChangesBtn.addEventListener("click", saveChanges);
    changePhotoBtn.addEventListener("click", () => photoInput.click());

    fetch(`/stats/${username}`, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            // Update the DOM with the received profile data
            usernameInput.value = data.username;
            passwordInput.value = data.password;
            document.querySelector("#translations-count").textContent = data.translationsCount;
            document.querySelector("#annotations-count").textContent = data.annotationsCount;
            document.querySelector("#comments-count").textContent = data.commentsCount;

            // Show the profile container once the data is inserted
            profileContainer.style.display = "block";
        })
        .catch(error => {
            console.error("Error fetching user profile:", error);
        });

    function saveChanges() {
        // Perform API call to save the profile changes
        // ...

        alert("Profile changes saved!");
    }

    photoInput.addEventListener("change", function (event) {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            const profilePhoto = document.querySelector("#profile-photo-img");

            reader.onload = function (e) {
                profilePhoto.src = e.target.result;
            };

            reader.readAsDataURL(event.target.files[0]);
        }
    });
});
