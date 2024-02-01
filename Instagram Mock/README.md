# Instagram Mock

This project was supposed to be a rudamentary mimic of Instagram/Twitter, utilizing [Node.js, Express.js, Javascript, Fetch API, MYSQL, MYSQL-await, Pug, CSS, JWT, and bcrypt].

After spending almost 2 hours trying to make the like button interactive, I decided that this project could serve as a demonstration of my SQL knowledge and safe data practices (parameterization, bcrypt, etc.), rather than my front-end skills.

However, I have not given up completely on the front-end just yet. I'm currently learning React.js and Tailwind CSS so I can avoid that pain going forward.

<br>

## How to run
This version can be ran, or so they say.

### TO RUN THIS YOURSELF, YOU WILL NEED ACCESS TO YOUR OWN MYSQL SERVER & LOGIN

- Ensure you have a recent version of Node.js on your computer
- Clone this repo and open a terminal in the <code>v6</code> directory
- Enter your login information for `user`, `database`, `password` in <code>data.js</code>.
    - **NOTE: these values should *really* be stored as environment variables for safety, but I ignored it at this stage of this project.**
1. Assuming your MYSQL server is *NOT* behind a firewall:
    - Open your MYSQL database in another terminal. Create \``user`\`, `post`, and `like_table` tables with the CREATE commands in <code>schema.sql</code>.
    - Run these commands:
        - <code>npm install</code>
        - <code>node server.js</code>
2. If you, too, are an unfortunate soul, here's how to tunnel under the firewall:
    - Open your MYSQL database in another terminal (you will probably need to SSH into the network first). Create \``user`\`, `post`, and `like_table` tables with the CREATE commands in <code>schema.sql</code>.
    - In <code>tunnel.js</code>, change the final line to be the following format:
        - <code>start_server('name of network machine', 'name of network's internal MYSQL server', 3306);</code>
        - Note: the last argument must be 3306, as that is the MYSQL port.
    - Run these commands: <b>NOTE: DO THESE IN ORDER</b>
        - <code>npm install</code>
        - <code>node tunnel.js</code> : run the tunnel and sign in to it.
        - Open a new terminal
        - <code>node server.js</code> : run the project server

- Open <code>http://localhost:4131/</code> in your local browser