const bcrypt = require("bcryptjs");
// BCRYPT IS USED IN DATA.JS

const jwt = require('jsonwebtoken');
const secretKey = 'qwopeIIru819732a/.sfnm,asaw7987q1asdfhASDFJASDq0';
const data = require("./data")
const express = require ('express');
const app = express();
const port = 4131;

app.set("views", "templates"); // look in "/templates" folder for pug templates
app.set("view engine", "pug");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
    next();
    console.log(`\"${req.method} ${req.originalUrl}\" ${res.statusCode}`);
});

// Middleware to verify the token in incoming requests
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Get the token from the Authorization header

    if (token == null) {
        return res.sendStatus(401); // Unauthorized if no token provided
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden if token is invalid or expired
        }
        req.user = user; // Set the authenticated user for further processing
        next();
    });
}

const path = require('path');
// Serve static files from the 'resources' directory
app.use('/css', express.static(path.join(__dirname, 'resources', 'css')));
app.use('/js', express.static(path.join(__dirname, 'resources', 'js')));
app.use('/images', express.static(path.join(__dirname, 'resources', 'images')));

app.get(["/", "/main"], async (req, res) => {
    return res.render("mainpage.pug");
});

app.get(["/profile"], async (req, res) => {
    return res.render("profile.pug");
});

app.get(["/login"], async (req, res) => {
    return res.render("login.pug");
});

app.get("/posts", async (req, res) => {
    try {
        const algo = req.query.algo;
        const pageNumber = parseInt(req.query.pageNumber);
        const postsPerPage = parseInt(req.query.postsPerPage);

        if (!algo || !pageNumber || !postsPerPage || isNaN(pageNumber) || isNaN(postsPerPage) ||
            pageNumber <= 0 || postsPerPage <= 0) {
            return res.status(400).json({ error: 'Invalid data fields.' });
        }

        let result;
        if (algo === "recent") {
            result = await data.getRecentPosts(pageNumber, postsPerPage);
        } else if (algo === "likes") {
            result = await data.getPopularPosts(pageNumber, postsPerPage);
        } else {
            return res.status(400).json({ error: 'Invalid algo' });
        }

        res.json({ success: true, result }); // Send the result as JSON response
    } catch (error) {
        // Handle any errors
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/user/liked/posts", authenticateToken, async (req, res) => {
    try {
        // Check status of user ID obtained from the JWT token
        const userId = req.user.id;
        // Returns list of liked posts, null if error
        const likedPosts = await data.getUserLikedPosts(userId);
        // Check if user's liked posts were successfully found
        if (likedPosts !== null) {
            return res.status(200).json({ message: 'Successfully got user\'s liked posts.', likedPosts: likedPosts});
        } else {
            return res.status(500).json({ error: 'likedPosts object is null' });
        }
    } catch (error) {
        console.error('Error getting user\'s liked posts:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


app.post("/user/create", async (req, res) => {
    try {
        // createUser returns user id on successful creation, false otherwise
        const result = await data.createUser(req.body.username, req.body.password);
        // If user created successfully, create and return a jwt token containing the username and user id
        if (result) {
            const token = jwt.sign({username: req.body.username, id: result}, secretKey, { expiresIn: '24h' }); // Token expires in 24 hours
            res.json({ token: token });
        } else {
            res.status(400).json({ error: 'User creation failed' });
        }
    } catch (error) {
        // Handle any errors that occur during createUser function execution
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post("/user/login", async (req, res) => {
    try {
        let result = await data.login(req.body.username, req.body.password);
        // result is either false or user id
        if (result) {
            // Generate a JWT token
            const token = jwt.sign({ username: req.body.username, userId: result }, secretKey, { expiresIn: '24h' }); // Token expires in 24 hours

            // Send the JWT token back to the client
            res.json({ token: token });
        } else {
            res.status(400).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post("/auth/post", authenticateToken, async (req, res) => {
    try {
        // Check if content is present in the request body
        if (!req.body.content) {
            return res.status(400).json({ error: 'Content is required for editing a post' });
        }

        // Edit the post using the user ID obtained from the JWT token
        const userId = req.user.id;
        // Returns true on success
        const updatedPost = await data.createPost(req.body.content, userId);
        // Check if the post was successfully updated
        if (updatedPost) {
            return res.status(200).json({ message: 'Posted successfully' });
        } else {
            return res.status(500).json({ error: 'Failed to update post' });
        }
    } catch (error) {
        console.error('Error editing post:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.post("/post/like", authenticateToken, async (req, res) => {
    try {
        // Check if postId is present in the request body
        if (!req.body.postId) {
            return res.status(400).json({ error: 'postId is required to like post.' });
        }

        // Like the post using the user ID obtained from the JWT token
        const userId = req.user.id;
        // Returns true on success
        const likePost = await data.likePost(userId, req.body.postId);
        // Check if the post was successfully liked
        if (likePost === null) {
            return res.status(500).json({ error: 'Failed to like post' });
        } else if (likePost === true) {
            return res.status(200).json({ message: 'Liked successfully', likeResult: true });
        } else {
            // This should probably not be 200, 
            return res.status(400).json({ message: 'Already liked. Try unlike', likeResult: false });
        }
    } catch (error) {
        console.error('Error liking post:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.post("/post/unlike", authenticateToken, async (req, res) => {
    try {
        // Check if postId is present in the request body
        if (!req.body.postId) {
            return res.status(400).json({ error: 'postId is required to unlike post.' });
        }

        // Unlike the post using the user ID obtained from the JWT token
        const userId = req.user.id;
        // Returns true on success
        const unlikePost = await data.unlikePost(userId, req.body.postId);
        // Check if the post was successfully unliked
        if (unlikePost !== null && unlikePost === true) {
            return res.status(200).json({ message: 'Unliked successfully', unlikeResult: true });
        } else {
            return res.status(500).json({ error: 'unlikePost is null or false. ' });
        }
    } catch (error) {
        console.error('Error unliking post:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/user/status", authenticateToken, async (req, res) => {
    try {
        // Check status of user ID obtained from the JWT token
        const userId = req.user.id;
        // Returns true if logged in, false if logged out, null if error
        const status = await data.checkStatus(userId);
        // Check if the status was checked successfully
        if (status !== null) {
            return res.status(200).json({ message: 'Status checked successfully', statusResult: status ? 'logged in' : 'logged out' });
        } else {
            return res.status(500).json({ error: 'Failed to check status' });
        }
    } catch (error) {
        console.error('Error checking status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


// put at bottom so it runs last -- this acts as a "catch all" letting us 404
app.use((req, res, next) => {
    return res.status(404).render("404.pug");
});

app.listen(port , () => {
    console.log(`Example app listening on port ${port}`);
});