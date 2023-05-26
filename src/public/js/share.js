// Tumblr Icon Click Event
document.getElementById("tumblr-icon").addEventListener("click", function() {
    // Export logic here
    console.log("Exporting to Tumblr...");

    // Make an API request to create a new Tumblr post using the Tumblr API
    // You'll need to provide your own Tumblr API key and specify the post content
    const apiKey = "sRw63z7tFWa3bLWqJiaRu8zolYpxa7Nk5gqHhIe9oKnwgjSYvu"; // OAuth Consumer Key
    const postContent = "This is my exported page on Tumblr!";

    fetch("https://api.tumblr.com/v2/blog/{www.tumblr.com/proiectweb}/post", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify({
            type: "text",
            title: "My Exported Page",
            body: postContent
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log("Exported to Tumblr successfully!");
            console.log("Tumblr post ID:", data.response.id);
        })
        .catch(error => {
            console.error("Failed to export to Tumblr:", error);
        });
});


/*
// WordPress Icon Click Event
document.querySelector('.svg-wordpress').addEventListener('click', function() {
    // Export logic for WordPress
    console.log('Exporting site to WordPress...');

    // Make an API request to create a new post using the WordPress REST API
    // You'll need to provide your own WordPress site URL and authentication credentials
    const apiUrl = 'https://your-wordpress-site.com/wp-json/wp/v2/posts';
    const username = 'web2023';
    const password = 'proiectweb2023';

    // Create a new post object
    const post = {
        title: 'My Exported Page',
        content: 'This is my exported page on WordPress!',
        status: 'publish'
    };

    // Make the API request to create the post
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(username + ':' + password)
        },
        body: JSON.stringify(post)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Exported to WordPress successfully!');
            console.log('WordPress post ID:', data.id);
        })
        .catch(error => {
            console.error('Failed to export to WordPress:', error);
        });
});
 */