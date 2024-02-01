const express = require ('express')
const app = express()
const port = 4131
const basicAuth = require('express-basic-auth')

app.set("views", "templates") // look in "/templates" folder for pug templates
app.set("view engine", "pug")

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

let next_id = 1
let contacts = {
    "Name": ["test"],
    "Email": ["test@gmail.com"],
    "Date": ["2023-10-11"],
    "Dropdown": ["Claymore"],
    "Spooky": ["Yes"],
    "Id": [0]
}
let sale = false
let saleMessage = ""

app.use((req, res, next) => {
    next()
    console.log(`\"${req.method} ${req.originalUrl}\" ${res.statusCode} - Contacts: ${contacts["Name"].length} - Active Sale: ${sale}`)
})

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).send('Bad Request - Invalid JSON')
    } else {
        next()
    }
})

const path = require('path');
// Serve static files from the 'resources' directory
app.use('/css', express.static(path.join(__dirname, 'resources', 'css')));
app.use('/js', express.static(path.join(__dirname, 'resources', 'js')));
app.use('/images', express.static(path.join(__dirname, 'resources', 'images')));

const auth = basicAuth({
    users: { 'admin': 'password' },
    challenge: true // Enable WWW-Authenticate header for unauthorized requests
})


app.get(["/", "/main"], async (req, res) => {
    return res.render("mainpage.pug")
})
app.get("/contact", async (req, res) => {
    return res.render("contact.pug")
})
app.post("/contact", async (req, res) => {
    // If both required fields were sent, create a new table entry
    const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
    if (req.body.Name && req.body.Email && emailPattern.test(req.body.Email)) {
        let temp_contact = {
            "Name": "",
            "Email": "",
            "Date": "",
            "Dropdown": "",
            "Spooky": "",
            "Id": ""
        }
        temp_contact.Name = req.body.Name
        temp_contact.Email = req.body.Email
        temp_contact.Id = next_id
        next_id++
        if (req.body.Date) {
            const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
            if (!datePattern.test(req.body.Date)) {
                return res.status(400).render("deny.pug")
            }
            temp_contact.Date = req.body.Date
        }
        if (req.body.Dropdown) {
            if (!["Claymore", "Halberd", "Voulge"].includes(req.body.Dropdown)) {
                return res.status(400).render("deny.pug")
            }
            temp_contact.Dropdown = req.body.Dropdown
        } else {
            temp_contact.Dropdown = "Claymore"
        }
        if (req.body.Spooky) {
            if (!["Yes", "No"].includes(req.body.Spooky)) {
                return res.status(400).render("deny.pug")
            }
            temp_contact.Spooky = req.body.Spooky
        }
        // Valid input: add to global contacts
        for (const name in temp_contact) {
            contacts[name].push(temp_contact[name])
        }
        return res.status(201).render("confirm.pug")
    } else {
        return res.status(400).render("deny.pug")
    }
})
app.get("/testimonies", async (req, res) => {
    return res.render("testimonies.pug")
})
app.get("/api/sale", async (req, res) => {
    if (!sale) {
        saleMessage = ""
    }
    const saleDict = {
        "active": sale,
        "message": saleMessage
    }
    res.status(200).json(saleDict)
})
// Middleware for basic authentication applied to the specified endpoints
app.get('/admin/contactlog', auth, (req, res) => {
    return res.render("contactLog.pug", { contacts: contacts })
})
app.delete('/api/contact', auth, (req, res) => {
    const contentType = req.headers['content-type']
    if (!contentType || contentType !== 'application/json') {
        return res.status(400).send("Content-Type is not 'application/json'")
    }
    try {
        const id = req.body.id
        if (!id) {
            throw new Error("id is missing from JSON body")
        }
        if (id < 0 || id >= next_id) {
            return res.status(404).send("No contact with the given ID exists")
        }
        const idIndex = contacts["Id"][id]
        if (idIndex === -1) {
            return res.status(404).send("No contact with the given ID exists")
        }

        // Remove the elements at 'idIndex' for each key in 'contacts'
        for (const key in contacts) {
            if (Object.hasOwnProperty.call(contacts, key)) {
                contacts[key].splice(idIndex, 1)
            }
        }

        return res.status(200).send("Successful delete");
    } catch (error) {
        return res.status(400).send(`An error occurred: ${error.message}`)
    }
})
app.delete('/api/sale', auth, (req, res) => {
    sale = false
    saleMessage = ""
    return res.status(200).send("Successful delete")
})
app.post('/api/sale', auth, (req, res) => {
    const contentType = req.headers['content-type']
    if (!contentType || contentType !== 'application/json') {
        return res.status(400).send("Content-Type is not 'application/json'")
    }
    try {
        const { message } = req.body
        if (!message) {
            throw new Error("message is missing from JSON body")
        }
        sale = true
        saleMessage = message
        return res.status(200).send("Successful Update")
    } catch (error) {
        return res.status(400).send(`An error occurred: ${error.message}`)
    }
});



// put at bottom so it runs last -- this acts as a "catch all" letting us 404
app.use((req, res, next) => {
    return res.status(404).render("404.pug")
})

app.listen(port , () => {
    console.log(`Example app listening on port ${port}`)
})