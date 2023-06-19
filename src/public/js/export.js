document.getElementById("tumblr-icon").addEventListener("click", function() {
    document.getElementById("tumblr-icon").addEventListener("click", function() {
        // Create the pop-up window container
        const popupContainer = document.createElement("div");
        popupContainer.classList.add("popup-container");

        const titleElement = document.createElement("h2");
        titleElement.textContent = "Tumblr";
        titleElement.classList.add("popup-title");

        // Create labels and input fields for WordPress information
        /*const usernameLabel = document.createElement("label");
        usernameLabel.textContent = "Username:";
        const usernameInput = document.createElement("input");
        usernameInput.type = "text";

        const passwordLabel = document.createElement("label");
        passwordLabel.textContent = "Password:";
        const passwordInput = document.createElement("input");
        passwordInput.type = "password";

        const blogUrlLabel = document.createElement("label");
        blogUrlLabel.textContent = "Blog URL:";
        const blogUrlInput = document.createElement("input");
        blogUrlInput.type = "text";*/

        // Create labels and input fields for post details
        const postTitleLabel = document.createElement("label");
        postTitleLabel.textContent = "Post Title:";
        const postTitleInput = document.createElement("input");
        postTitleInput.type = "text";

        const postTextLabel = document.createElement("label");
        postTextLabel.textContent = "Post Text:";
        const postTextInput = document.createElement("textarea");

        // Create the "Post" button
        const postButton = document.createElement("button");
        postButton.textContent = "Post";
        postButton.classList.add("post-button");

        // Create the "Cancel" button
        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.classList.add("cancel-button");

        // Add event listener to handle the "Post" button click
        postButton.addEventListener("click", function() {
            const postData = {
                /*username: usernameInput.value,
                password: passwordInput.value,
                blogUrl: blogUrlInput.value,*/
                postTitle: postTitleInput.value,
                postText: postTextInput.value,
                songId: extractSongIdFromUrl()
            }
            document.body.removeChild(popupContainer);

            fetch('/export/tumblr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            })
                .then(response => response.json())
                .then(data => {
                    //console.log(data.message);
                    window.location.href = data.message;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });

        // Add event listener to handle the "Cancel" button click
        cancelButton.addEventListener("click", function() {
            document.body.removeChild(popupContainer);
        });

        // Add all the elements to the pop-up container
        popupContainer.appendChild(titleElement);
        /*popupContainer.appendChild(usernameLabel);
        popupContainer.appendChild(usernameInput);
        popupContainer.appendChild(passwordLabel);
        popupContainer.appendChild(passwordInput);
        popupContainer.appendChild(blogUrlLabel);
        popupContainer.appendChild(blogUrlInput);*/
        popupContainer.appendChild(postTitleLabel);
        popupContainer.appendChild(postTitleInput);
        popupContainer.appendChild(postTextLabel);
        popupContainer.appendChild(postTextInput);
        popupContainer.appendChild(postButton);
        popupContainer.appendChild(cancelButton);

        // Append the pop-up container to the document body
        document.body.appendChild(popupContainer);
    });
});

document.getElementById("wordpress-icon").addEventListener("click", function() {
    document.getElementById("wordpress-icon").addEventListener("click", function() {
        // Create the pop-up window container
        const popupContainer = document.createElement("div");
        popupContainer.classList.add("popup-container");

        const titleElement = document.createElement("h2");
        titleElement.textContent = "Wordpress";
        titleElement.classList.add("popup-title");

        // Create labels and input fields for WordPress information
        /*const usernameLabel = document.createElement("label");
        usernameLabel.textContent = "Username:";
        const usernameInput = document.createElement("input");
        usernameInput.type = "text";

        const passwordLabel = document.createElement("label");
        passwordLabel.textContent = "Password:";
        const passwordInput = document.createElement("input");
        passwordInput.type = "password";

        const clientIdLabel = document.createElement("label");
        clientIdLabel.textContent = "Client ID:";
        const clientIdInput = document.createElement("input");
        clientIdInput.type = "text";

        const clientSecretLabel = document.createElement("label");
        clientSecretLabel.textContent = "Client Secret:";
        const clientSecretInput = document.createElement("input");
        clientSecretInput.type = "text";

        const blogUrlLabel = document.createElement("label");
        blogUrlLabel.textContent = "Blog URL:";
        const blogUrlInput = document.createElement("input");
        blogUrlInput.type = "text";*/

        // Create labels and input fields for post details
        const postTitleLabel = document.createElement("label");
        postTitleLabel.textContent = "Post Title:";
        const postTitleInput = document.createElement("input");
        postTitleInput.type = "text";

        const postTextLabel = document.createElement("label");
        postTextLabel.textContent = "Post Text:";
        const postTextInput = document.createElement("textarea");

        // Create the "Post" button
        const postButton = document.createElement("button");
        postButton.textContent = "Post";
        postButton.classList.add("post-button");

        // Create the "Cancel" button
        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.classList.add("cancel-button");

        // Add event listener to handle the "Post" button click
        postButton.addEventListener("click", function() {
            const postData = {
                /*username: usernameInput.value,
                password: passwordInput.value,
                clientId: clientIdInput.value,
                clientSecret: clientSecretInput.value,
                blogUrl: blogUrlInput.value,*/
                postTitle: postTitleInput.value,
                postText: postTextInput.value,
                songId: extractSongIdFromUrl()
            }
            document.body.removeChild(popupContainer);


            fetch('/export/wordpress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            })
                .then(response => response.json())
                .then(data => {
                    //console.log(data.message);
                    window.location.href = data.message;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });

        // Add event listener to handle the "Cancel" button click
        cancelButton.addEventListener("click", function() {
            document.body.removeChild(popupContainer);
        });

        // Add all the elements to the pop-up container
        popupContainer.appendChild(titleElement);
        /*popupContainer.appendChild(usernameLabel);
        popupContainer.appendChild(usernameInput);
        popupContainer.appendChild(passwordLabel);
        popupContainer.appendChild(passwordInput);
        popupContainer.appendChild(clientIdLabel);
        popupContainer.appendChild(clientIdInput);
        popupContainer.appendChild(clientSecretLabel);
        popupContainer.appendChild(clientSecretInput);
        popupContainer.appendChild(blogUrlLabel);
        popupContainer.appendChild(blogUrlInput);*/
        popupContainer.appendChild(postTitleLabel);
        popupContainer.appendChild(postTitleInput);
        popupContainer.appendChild(postTextLabel);
        popupContainer.appendChild(postTextInput);
        popupContainer.appendChild(postButton);
        popupContainer.appendChild(cancelButton);

        // Append the pop-up container to the document body
        document.body.appendChild(popupContainer);
    });
});

function extractSongIdFromUrl() {
    const url = window.location.href;
    const match = url.match(/\/song-page\/(\d+)/);
    if (match && match[1]) {
        return match[1];
    }
    return null;
}


