
document.getElementById('settingsForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from submitting in the default way

    const pageNumber = document.getElementById('pageNumber').value;
    const postsPerPage = document.getElementById('postsPerPage').value;
    const algo = document.getElementById('algo').value;

    try {
        const queryParams = `?pageNumber=${pageNumber}&postsPerPage=${postsPerPage}&algo=${algo}`;
        const response = await fetch('/posts' + queryParams, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json(); // Parse JSON response
        await renderPosts(data); // Render posts in the posts container
    } catch (error) {
        console.error('Error fetching posts:', error);
        // Handle error (display error message, etc.)
    }
});


// Function to fetch and display posts
async function fetchPosts() {
    try {
        const response = await fetch('/posts', {
            method: 'GET',
            // headers: {
            //     'Authorization': `Bearer ${token}`
            // }
            // body: JSON.stringify({ content })
            
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json(); // Parse JSON response
        await renderPosts(data); // Render posts in the posts container
    } catch (error) {
        console.error('Error fetching posts:', error);
        // Handle error (display error message, etc.)
    }
};

async function attemptLike(post, heartIcon) {
    // Like post if user is logged in
    try {
        // Get jwt from storage
        const token = localStorage.getItem('token');
        // Must have token to verify login before liking posts
        if (!token) {
            alert('Please log in to like posts.');
            return;
        }
    
        // Check if user is logged in
        const response = await fetch('/user/status', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.statusResult && data.statusResult === 'logged in') {
            // User is logged in, attempt to like post
            const sendLike = await fetch('/post/like', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ postId: post.id })
            });
            if (!sendLike.ok && sendLike.status !== 400) {
                throw new Error('Network response was not (ok or 400)');
            }
            const sendLikeData = await sendLike.json();
            if (sendLikeData && sendLikeData.likeResult && sendLikeData.likeResult === true) {
                // Successfully liked post
                // Add the "liked" class on click
                heartIcon.classList.remove('unliked');
                heartIcon.classList.add('liked');
            } else if (sendLike.status === 400 && sendLikeData && sendLikeData.likeResult !== null && sendLikeData.likeResult === false) {
                // Post was already liked, attempt to unlike
                const sendUnlike = await fetch('/post/unlike', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ postId: post.id })
                });
                if (!sendUnlike.ok) {
                    throw new Error('Network response was not ok');
                }
                const sendUnlikeData = await sendUnlike.json();
                if (sendUnlikeData && sendUnlikeData.unlikeResult !== null && sendUnlikeData.unlikeResult === true) {
                    // Successfully unliked
                    heartIcon.classList.remove('liked');
                    heartIcon.classList.add('unliked');
                } else {
                    throw new Error('fetch(\'/post/unlike\') failed');
                }
            } else {
                throw new Error('fetch(\'/post/like\') failed');
            }
        } else if (data.statusResult && data.statusResult === 'logged out') {
            // User is logged out, alert login
            alert('Please log in again to like posts.');
            
        } else {
            // Catch all 
            throw new Error('Failed to check status.');
        }
    } catch (error) {
        console.error('Error creating user:', error);
        alert('Error liking post, try again.');
    }
};


async function attemptGetLikedPosts() {
    try {
        // Get jwt from storage
        const token = localStorage.getItem('token');
        // Must have token to verify login before liking posts
        if (!token) {
            throw new Error('User not logged in - can\'t see which posts are already liked');
        }
        const likedPosts = await fetch('/user/liked/posts', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!likedPosts.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await likedPosts.json();
        if (!data) {
            throw new Error('fetch /user/liked/posts failed.');
        }
        if (data && data.length > 0 && data[0].post_id !== null) {
            return data;
        }
    } catch (error) {
        console.error('Error getting liked posts:', error);
        // Should be silent error
    }
};

// Function to render posts in the posts container
async function renderPosts(posts) {
    // First, get liked posts
    const likedPosts = await attemptGetLikedPosts()
        .catch((error) => {
            console.error('Error while getting liked posts:', error);
        });

    // Ensure likedPosts is an array
    const likedPostsArray = Array.isArray(likedPosts) ? likedPosts : [];

    const postsContainer = document.getElementById('postsContent');

    // Clear previous posts
    postsContainer.innerHTML = '';

    // Append fetched posts to the container
    posts.result.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post'); // Adding a class to the post container
    
        // Create elements to display likes, content, and publish time
        const likesElement = document.createElement('p');
        likesElement.textContent = `Likes: ${post.likes}`;
        likesElement.classList.add('post-likes'); // Adding a class to the likes paragraph
    
        const contentElement = document.createElement('p');
        contentElement.textContent = `${post.content}`;
        contentElement.classList.add('post-content'); // Adding a class to the content paragraph
    
        const publishTimeElement = document.createElement('p');
        publishTimeElement.textContent = `${post.publish_time}`;
        publishTimeElement.classList.add('post-publish-time'); // Adding a class to the publish time paragraph
    
        const idElement = document.createElement('p');
        idElement.textContent = `id: ${post.id}`;
        idElement.classList.add('post-id'); // Adding a class to the ID paragraph

        const iconElement = document.createElement('i');
        iconElement.classList.add('fas', 'fa-heart'); // Add Font Awesome classes
        iconElement.classList.add('unliked');

        
    
        // // Check if post.id matches any liked post
        // const isLiked = likedPostsArray.some(likedPost => likedPost.post_id === post.id);

        let isLiked = false;

        for (let i = 0; i < likedPostsArray.length; i++) {
            if (likedPostsArray[i].post_id === post.id) {
                isLiked = true;
                break;
            }
        }

        if (isLiked) {
            iconElement.classList.remove('unliked');
            iconElement.classList.add('liked');
            iconElement.style.fontSize = '30px';
            iconElement.style.color = 'red';
        }

        // Add event listener to each heart icon
        iconElement.addEventListener('click', () => {
            attemptLike(post, iconElement)
                .catch((error) => {
                    console.error('Error while liking post:', error);
                });
        });
    
        // Append elements to post container
        postElement.appendChild(likesElement);
        postElement.appendChild(contentElement);
        postElement.appendChild(publishTimeElement);
        postElement.appendChild(idElement);
        postElement.appendChild(iconElement);
    
        // Append post container to posts container
        postsContainer.appendChild(postElement);
    });
};

// Call fetchPosts when the page loads or when needed
// fetchPosts();

window.addEventListener("load", (event) => {
    if (window.location.pathname === '/' || window.location.pathname === '/main') {
        // Execute specific code for 'some-page'
        fetchPosts();
    }
});

async function updateHearts() {
    const heartClass = localStorage.getItem('heartClass');
    if (heartClass === 'liked') {
        let heart
    } else {

    }
}

window.addEventListener("load", (event) => {
    setInterval()
});



document.getElementById('postForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from submitting in the default way

    const content = document.getElementById('content').value;

    try {
        const token = localStorage.getItem('token');

        const response = await fetch('/auth/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include the token in the Authorization header
            },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json(); // Parse JSON response
        const jsonString = JSON.stringify(data.message, null, 2); // Indentation of 2 spaces for better readability

        const tokenMessageDiv = document.getElementById('tokenMessageContent');
        tokenMessageDiv.innerText = jsonString;

        let cont = document.getElementById('content');
        cont.value = "";
        // Update the content inside the 'tokenMessage' div
    } catch (error) {
        console.error('Error creating post:', error);
        // Handle error (display error message, etc.)
    }
});