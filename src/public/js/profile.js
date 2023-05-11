document.addEventListener("DOMContentLoaded", function () {
    const saveChangesBtn = document.querySelector("#save-changes");
    const changePhotoBtn = document.querySelector("#change-photo");
    const usernameInput = document.querySelector("#username");
    const passwordInput = document.querySelector("#password");
    const photoInput = document.querySelector("#upload-photo");

    saveChangesBtn.addEventListener("click", saveChanges);
    changePhotoBtn.addEventListener("click", () => photoInput.click());

    function saveChanges() {
        // API calls
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