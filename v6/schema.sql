CREATE TABLE sale (
  Id INT NOT NULL AUTO_INCREMENT,
  Msg TEXT NOT NULL,
  Startt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Endt TIMESTAMP,
  PRIMARY KEY(id)
);


-- GET top 3 SALES
-- SELECT * FROM sale WHERE Endt IS NULL ORDER BY Startt DESC LIMIT 3;

-- POST new sale
-- INSERT INTO sale (Msg) VALUES ('user input');
  -- INSERT INTO sale (Msg) VALUES (?);
  --      [message]

-- DELETE all sales
-- UPDATE sale SET Endt=CURRENT_TIMESTAMP WHERE Endt IS NULL;

CREATE TABLE contact (
  Id INT NOT NULL AUTO_INCREMENT,
  ContactName VARCHAR(50) NOT NULL,
  Email VARCHAR(50) NOT NULL, -- If your email is longer than this, that is simply not my problem: "Works on my email"
  ScheduledDate DATE,
  Dropdown ENUM('Claymore', 'Halberd', 'Voulge') DEFAULT 'Claymore',
  Spooky ENUM('Yes', 'No') DEFAULT 'No',
  PRIMARY KEY(Id)
);

-- DELETE a contact
-- DELETE FROM contact WHERE Id = ?;
--      [id]