-- USER TABLE
CREATE TABLE `user` (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(30) NOT NULL UNIQUE,
    password_hash VARCHAR(72) NOT NULL,
    logged_in BOOL NOT NULL DEFAULT TRUE,
    -- like_count INT DEFAULT 0,
    -- post_count INT DEFAULT 0,
    PRIMARY KEY (id)
);

-- POST TABLE (LINK TO USER)
CREATE TABLE post (
    id INT NOT NULL AUTO_INCREMENT,
    likes INT NOT NULL DEFAULT 0,
    content VARCHAR(350) NOT NULL,
    publish_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    INDEX user_index (user_id),
    PRIMARY KEY (id),
    FOREIGN KEY (user_id)
        REFERENCES `user`(id)
        ON DELETE CASCADE
);

-- LIKE TABLE
CREATE TABLE like_table (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id)
        REFERENCES `user`(id)
        ON DELETE CASCADE,
    FOREIGN KEY (post_id)
        REFERENCES post(id)
        ON DELETE CASCADE,
    UNIQUE (user_id, post_id)
);


-- (nvm, no perms)
-- -- Create a trigger after updating the post table (like or unlike)
-- DELIMITER //

-- CREATE TRIGGER update_like_count_update
-- AFTER UPDATE ON post
-- FOR EACH ROW
-- BEGIN
--     IF OLD.likes != NEW.likes THEN
--         UPDATE `user`
--         SET like_count = like_count + (NEW.likes - OLD.likes)
--         WHERE id = NEW.user_id;
--     END IF;
-- END//

-- -- Create a trigger after updating the post table (delete post)
-- CREATE TRIGGER update_like_count_delete
-- AFTER DELETE ON post
-- FOR EACH ROW
-- BEGIN
--     UPDATE `user`
--     SET like_count = like_count - OLD.likes
--     WHERE id = OLD.user_id;
-- END//

-- DELIMITER ;
-- (nvm, no perms)



-- COMMENT TABLE (LINK TO POST AND USER [AUTHOR])