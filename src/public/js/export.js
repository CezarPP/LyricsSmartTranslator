document.getElementById("tumblr-icon").addEventListener("click", function(){
// Create the pop-up window container
    const popupContainer = document.createElement("div");
    popupContainer.classList.add("popup-container");

    const titleElement = document.createElement("h2");
    titleElement.textContent = "Tumblr";
    titleElement.classList.add("popup-title");

    // Create labels and input fields for post details
    const blogNameLabel = document.createElement("label");
    blogNameLabel.textContent = "Blog name:";
    const blogNameInput = document.createElement("input");
    blogNameInput.type = "text";

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
            postTitle: postTitleInput.value,
            postText: postTextInput.value,
            blogName: blogNameInput.value,
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
    popupContainer.appendChild(blogNameLabel);
    popupContainer.appendChild(blogNameInput);
    popupContainer.appendChild(postTitleLabel);
    popupContainer.appendChild(postTitleInput);
    popupContainer.appendChild(postTextLabel);
    popupContainer.appendChild(postTextInput);
    popupContainer.appendChild(postButton);
    popupContainer.appendChild(cancelButton);

    // Append the pop-up container to the document body
    document.body.appendChild(popupContainer);
});
document.getElementById("wordpress-icon").addEventListener("click", function() {
        // Create the pop-up window container
        const popupContainer = document.createElement("div");
        popupContainer.classList.add("popup-container");

        const titleElement = document.createElement("h2");
        titleElement.textContent = "Wordpress";
        titleElement.classList.add("popup-title");

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
        popupContainer.appendChild(postTitleLabel);
        popupContainer.appendChild(postTitleInput);
        popupContainer.appendChild(postTextLabel);
        popupContainer.appendChild(postTextInput);
        popupContainer.appendChild(postButton);
        popupContainer.appendChild(cancelButton);

        // Append the pop-up container to the document body
        document.body.appendChild(popupContainer);
});

function extractSongIdFromUrl() {
    const url = window.location.href;
    const match = url.match(/\/song-page\/(\d+)/);
    if (match && match[1]) {
        return match[1];
    }
    return null;
}


