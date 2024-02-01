// this package behaves just like the mysql one, but uses async await instead of callbacks.
const mysql = require(`mysql-await`); // npm install mysql-await
const bcrypt = require("bcryptjs");

// first -- I want a connection pool: https://www.npmjs.com/package/mysql#pooling-connections
// this is used a bit differently, but I think it's just better -- especially if server is doing heavy work.
var connPool = mysql.createPool({
  connectionLimit: 5, // it's a shared resource, let's not go nuts.
  host: "localhost",// this will work
  user: "username",
  database: "database name",
  password: "password", // we really shouldn't be saving this here long-term -- it should be an environment variable for safety
});

// connPool.awaitQuery(query, data) -- will return a promise for the query results.



async function createUser(username, password) {
  try {
    if (!username || !password) {
      throw new Error('Missing required data fields.');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    let result = await connPool.awaitQuery('INSERT INTO user (username, password_hash) VALUES (?, ?);', [username, passwordHash]);
    if (result && result.affectedRows > 0 && result.insertId) {
      return result.insertId;
    }
    throw new Error('User creation failed or ID not retrieved.');
  } catch (error) {
    console.error('Error creating user account:', error.message);
    return false;
  }
};

async function login(username, password) {
  try {
    if (!username || !password) {
      throw new Error('Missing required data fields.');
    }

    // Select id and password_hash from user table
    let userResult = await connPool.awaitQuery('SELECT id, password_hash FROM user WHERE username = ?;', [username]);
    // Check if entry exists for username
    if (!userResult || userResult.length === 0) {
      throw new Error('User not found.');
    }
    // Compare the provided password with the stored password_hash
    const storedHash = userResult[0].password_hash;
    const isPasswordValid = await bcrypt.compare(password, storedHash);

    if (isPasswordValid) {
      // Passwords match; set login status and return the user id
      let logStatus = await connPool.awaitQuery('UPDATE user SET logged_in = TRUE WHERE id = ?;', [userResult[0].id]);
      console.log(logStatus);
      return userResult[0].id;
    } else {
      throw new Error('Incorrect password.');
    }
  } catch (error) {
    console.error('Error logging in:', error.message);
    // Login failed; return false
    return false;
  }
};

async function checkStatus(userId) {
  try {
    if (!userId || typeof userId !== 'number' || userId <= 0) {
      throw new Error('Invalid userId');
    }
    let result = await connPool.awaitQuery('SELECT logged_in FROM user WHERE id = ?;', [userId]);
    if (!result || result.length === 0) {
      throw new Error('User not found or status not available');
    }

    const loggedInStatus = result[0].logged_in;

    return loggedInStatus;
  } catch (error) {
    console.error('Error checking status:', error.message);
    return null;
  }
};

async function logout(userId) {
  try {
    if (!userId) {
      throw new Error('Missing required data fields.');
    }
    let result = await connPool.awaitQuery('UPDATE user SET logged_in = FALSE WHERE id = ?;', [userId]);
    return true;
  } catch (error) {
    console.error('Error logging out:', error.message);
    return false;
  }
};

async function createPost(content, userId) {
  try {
    if (!content || !userId) {
      throw new Error('Missing required data fields.');
    }
    let result = await connPool.awaitQuery('INSERT INTO post (content, user_id) VALUES (?, ?);', [content, userId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error creating post:', error.message);
    return false;
  }
};

async function editPost(content, postId) {
  try {
    if (!content || !postId) {
      throw new Error('Missing required data fields.');
    }
    let result = await connPool.awaitQuery('UPDATE post SET content = ? WHERE id = ?;', [content, postId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error editing post:', error.message);
    return false;
  }
};

async function deletePost(postId) {
  try {
    if (!postId) {
      throw new Error('Missing required data fields.');
    }
    let result = await connPool.awaitQuery('DELETE FROM post WHERE id = ?', [postId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting post:', error.message);
    return false;
  }
};

async function getUserLikedPosts(likersUserId) {
  // Returns every postId liked by likersUserId
  try {
    if (!likersUserId || typeof likersUserId !== 'number'|| likersUserId <= 0) {
      throw new Error('Invalid likersUserId.');
    }
    const likedPosts = await connPool.awaitQuery('SELECT post_id FROM like_table WHERE user_id = ?', [likersUserId]);
    if (!likedPosts) {
      throw new Error('awaitQuery failed.');
    }
    return likedPosts;
  } catch (error) {
    console.error('Error getting user\'s liked posts:', error.message);
    return null;
  }
};

async function unlikePost(unlikersUserId, postId) {
  try {
    if (!unlikersUserId || !postId) {
      throw new Error('Missing required data fields.');
    }
    // Start a transaction
    await connPool.awaitQuery('START TRANSACTION');

    // Remove the like entry from like_table
    const likeDeletion = await connPool.awaitQuery('DELETE FROM like_table WHERE user_id = ? AND post_id = ?', [unlikersUserId, postId]);
    // Check if like entry was deleted
    if (!likeDeletion || likeDeletion.affectedRows === 0) {
      throw new Error('Failed to remove like entry.');
    }

    // Decrement post's like count
    const postLikeUpdate = await connPool.awaitQuery('UPDATE post SET likes = likes - 1 WHERE id = ? AND likes > 0', [postId]);
    // Check if the post was liked and like count was updated
    if (!postLikeUpdate || postLikeUpdate.affectedRows === 0) {
      throw new Error('Post wasn\'t liked or failed to update post likes.');
    }

    // Commit the transaction
    await connPool.awaitQuery('COMMIT');

    return true; // Successfully unliked the post
  } catch (error) {
    // Rollback the transaction on error
    await connPool.awaitQuery('ROLLBACK');
    console.error('Error unliking post:', error.message);
    return false;
  }
};

async function likePost(likersUserId, postId) {
  try {
    if (!likersUserId || !postId || typeof likersUserId !== 'number' || typeof postId !== 'number' ||
    likersUserId <= 0 || likersUserId <= 0) {
      throw new Error('Missing required data fields.');
    }
    // Start a transaction
    await connPool.awaitQuery('START TRANSACTION');

    try {
      // Check that postId isn't already liked by likersUserId
      const likedPosts = await getUserLikedPosts(likersUserId);
      if (!likedPosts) {
        throw new Error('getUserLikedPosts failed.');
      }
      if (likedPosts && likedPosts.length > 0 && likedPosts[0].post_id !== null && postId === likedPosts[0].post_id) {
        // Post already liked, so unlike - indicate by returning false
        return false;
      }

      // Create new entry in `like` table
      const likeInsert = await connPool.awaitQuery('INSERT INTO like_table (user_id, post_id) VALUES (?, ?);', [likersUserId, postId]);
      // Check if new entry was created (unique like)
      if (!likeInsert || likeInsert.affectedRows === 0) {
        throw new Error('Failed to insert like.');
      }

      // Increment post's like count
      const postLikeUpdate = await connPool.awaitQuery('UPDATE post SET likes = likes + 1 WHERE id = ?', [postId]);
      // Check if like count was properly update
      if (!postLikeUpdate || postLikeUpdate.affectedRows === 0) {
        throw new Error('Failed to update post likes.');
      }

      // Commit the transaction
      await connPool.awaitQuery('COMMIT');

      return true; // Successfully liked the post
    } catch (queryError) {
      await connPool.awaitQuery('ROLLBACK');
      console.error('Error in query:', queryError.message);
      return null;
    }
  } catch (error) {
    // Rollback the transaction on error
    await connPool.awaitQuery('ROLLBACK');
    console.error('Error liking post:', error.message);
    return null;
  }
};

async function getPostLikes(postId) {
  try {
    if (!postId || typeof postId !== 'number' || postId <= 0) {
      throw new Error('Invalid postId');
    }
    // Select like count from post table
    const result = await connPool.awaitQuery('SELECT likes FROM post WHERE id = ?;', [postId]);
    // Check if post exists for postId
    if (!result || result.length === 0) {
      throw new Error('Post not found.');
    }
    return result[0].likes;
  } catch (error) {
    console.error('Error getting like count:', error.message);
    return false;
  }
};

async function getPostCount(userId) {
  try {
    if (!userId || typeof userId !== 'number' || userId <= 0) {
      throw new Error('Invalid userId');
    }
    // Select like count from post table
    const result = await connPool.awaitQuery('SELECT COUNT(*) AS postCount FROM post WHERE user_id = ?;', [userId]);
    // Check if result is empty or null
    if (!result || result.length === 0 || !result[0].postCount) {
      throw new Error('No posts found for this user.');
    }
    return result[0].postCount;
  } catch (error) {
    console.error('Error getting post count:', error.message);
    return false;
  }
};

async function getRecentPosts(pageNumber, postsPerPage) {
  try {
    if (!pageNumber || !postsPerPage || typeof pageNumber !== 'number' || typeof postsPerPage !== 'number' ||
      pageNumber <= 0 || postsPerPage <= 0) {
      throw new Error('Invalid data fields.');
    }

    const offset = (pageNumber - 1) * postsPerPage;
    // Fetch posts from the database, sorted by timestamp (newest first) with pagination
    const posts = await connPool.awaitQuery('SELECT * FROM post ORDER BY publish_time DESC LIMIT ?, ?;', [offset, postsPerPage]);
    if (!posts || posts.length === 0) {
      throw new Error('No posts found for this page.');
    }
    return posts;
  } catch (error) {
    console.error('Error getting posts:', error.message);
    return false;
  }
};

async function getPopularPosts(pageNumber, postsPerPage) {
  try {
    if (!pageNumber || !postsPerPage || typeof pageNumber !== 'number' || typeof postsPerPage !== 'number' ||
      pageNumber <= 0 || postsPerPage <= 0) {
      throw new Error('Invalid data fields.');
    }

    const offset = (pageNumber - 1) * postsPerPage;
    // Fetch posts from the database, sorted by likes (descending order) with pagination
    const posts = await connPool.awaitQuery('SELECT * FROM post ORDER BY likes DESC LIMIT ?, ?;', [offset, postsPerPage]);
    if (!posts || posts.length === 0) {
      throw new Error('No posts found for this page.');
    }
    return posts;
  } catch (error) {
    console.error('Error getting posts:', error.message);
    return false;
  }
};



// Simple Tests
async function runTests() {
  try {
    const result = await createUser('goober', 'strsdf');
    if (result) {
      const post1 = await createPost('FIRST POST EVER', result);
      console.log(post1);

      const post2 = await createPost('Second post', result);
      console.log(post2.insertId);

      const like1 = await likePost(2, 2);
      console.log(like1);

      const like2 = await likePost(2, 1);
      console.log(like2);

      const editedPost = await editPost('second post edited', 2);
      console.log(editedPost);

      const post3 = await createPost('Third post', result);
      console.log(post3);
    }

    const result2 = await createUser('earlyadfsasdf', 'stsadfadfassword');
    if (result2) {
      const post4 = await createPost('(my) FIRST POST EVER', result2);
      console.log(post4);

      const like3 = await likePost(3, 2);
      console.log(like3);

      const like4 = await likePost(3, 1);
      console.log(like4);

      const unlike1 = await unlikePost(3, 1);
      console.log(unlike1);
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

// Call the function to execute the tests
// runTests();


module.exports = {createUser, login, checkStatus, logout, createPost, editPost, deletePost, getUserLikedPosts, likePost, unlikePost, getPostLikes, getPostCount, getRecentPosts, getPopularPosts};