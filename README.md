# WebProject
### Various stages of development for a satire website advertising a medieval hitman.
#### [SEE FULL CHANGE LOG BELOW](#change-log)

This is a full-stack website I developed from scratch, iteratively improving it over six versions. Starting with a basic Python server and raw HTML, I gradually introduced new technologies like Node.js, Express.js, Pug(Jade), and MySQL. This incremental approach helped me learn core web development principles while simplifying and enhancing the system with new functionality.


Video demonstration of final version, v6 (Google Drive share link): [https://drive.google.com/file/d/1ZqiHP6dm08Cmd_7k67z6JBv73PCVpUb_/view?usp=drive_link](https://drive.google.com/file/d/1ZqiHP6dm08Cmd_7k67z6JBv73PCVpUb_/view?usp=drive_link)


![image](https://github.com/JacksonKary/WebProject/assets/117691954/9eb3a5b5-5773-42b5-a137-063554d29545)

<br>

# Change Log

- ## Version 1
  ### Description
  This is the first version of this website. It was made using HTML files and a Python server.

- ## Version 2
  ### Changes
  - In this version, I implemented several new endpoints, along with CSS styling, and dynamic HTML generation for the contact log.

  - The contact form now updates the contact log.

  - Is the image on the front page getting longer, or is it just me?

- ## Version 3
  ### Changes
  - Dark mode is here! Feel free to toggle dark/light mode using the handle button on the nav bar.

  - Added visual feedback for contact form submissions.

  - Added a feature to delete rows from the contact list (changes are not persistent in this version).

- ## Version 4
  ### Changes
  1. Contact log is now restricted to **authorized users only**. It now prompts the user to log in to view the contact log, using basic auth. 
      - Most secure login ever: (admin, password)
      - Note: your browser will remember the login for you. Incognito makes this easier to test repeatedly.

  2. **NEW SALE FEATURE ON CONTACT LOG PAGE**
      - Add or remove a sale, which will appear as a banner on the homepage.

  3. Contact log deletions are now persistent.

  4. Parameter parser is more involved - checks emails and dates with regex to ensure proper format, sanitizes all other form inputs.

- ## Version 5
  ### Changes
  1. Server ported from Python to Express.js!!!
      - Why didn't I start here? Great question

  2. **ALL HTML** replaced with **Pug**
      - Pug, formerly known as Jade, is a concise and elegant templating language for generating HTML. It makes writing HTML more efficient by using indentation-based syntax rather than explicit closing tags. With its simplicity and powerful features like mixins and inheritance, Pug streamlines the process of creating dynamic web content.
      - Mugsy <img src="/v5/image.png" width="176" height="236"> 



- ## Version 6
  ### Changes

  #### Data is now stored in MYSQL instead of a global variable in the server code.
  - All data about Sales and Contacts will be stored in MYSQL - meaning it survives even when our server restarts!
  - <code>data.js</code> creates a connection to the MYSQL server using mysql-await.
      - This is where I directly interact with the database with queries and handle the response (just routing it back to the express endpoints).
  - I used a server provided by UMN, but this should work for any MYSQL server.
      - One caveat about using a school server on a personal computer outside the campus network is F I R E W A L L.
      - Since the school's firewall is doing its thing, blocking connections from outside the campus network, I have to workaround with tunneling.
      - <code>tunnel.js</code> is the workaround. All it does is SSH into a UMN-CSE machine before connecting to the UMN MYSQL server, forwarding the port to my machine. This allows me to access the server despite the external firewall.
  - My SQL schema can be found in <code>schema.sql</code>

  Is it just me, or does the knight keep getting longer? Someone stop this man! He's just too long!

<br>
<br>

# Instagram Mock
### There is also a similar but unrelated directory in this repo named `Instagram Mock`. This is a separate project and is not related to the medieval hitman.

Video demo of Instagram Mock. Please focus on the backend/SQL & password storage, not the appearance or completeness. (Google Drive share link): [https://drive.google.com/file/d/1G7ch8YGyTAmCJD-Mh4Jp9d304_1yWYFv/view?usp=sharing](https://drive.google.com/file/d/1G7ch8YGyTAmCJD-Mh4Jp9d304_1yWYFv/view?usp=sharing)

![image](https://github.com/JacksonKary/WebProject/assets/117691954/1fcb4dad-9b03-4ae5-9d71-70eb3b97eef0)


