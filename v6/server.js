const data = require("./data")
const express = require ('express')
const app = express()
const port = 4131
const basicAuth = require('express-basic-auth')

app.set("views", "templates") // look in "/templates" folder for pug templates
app.set("view engine", "pug")

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use((req, res, next) => {
    next()
    console.log(`\"${req.method} ${req.originalUrl}\" ${res.statusCode}`)
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
            "Spooky": ""
        }
        temp_contact.Name = req.body.Name
        temp_contact.Email = req.body.Email
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
        let result = await data.addContact(temp_contact)
        if (result) {
            return res.status(201).render("confirm.pug")
        } else { 
           return res.status(400).render("deny.pug") 
        }
    } else {
        return res.status(400).render("deny.pug")
    }
})
app.get("/testimonies", async (req, res) => {
    return res.render("testimonies.pug")
})
app.get("/api/sale", async (req, res) => {
    const mostRecentSales = await data.getRecentSales()
    let saleDict = {
        "active": false,
        "message": ""
    }
    if (mostRecentSales && mostRecentSales.length > 0) {
        saleDict = {
            "active": !mostRecentSales[0].Endt,
            "message": mostRecentSales[0].Msg
        }
    }
    res.status(200).json(saleDict)
})
// Middleware for basic authentication applied to the specified endpoints
app.get('/admin/contactlog', auth, async (req, res) => {
    const contacts = await data.getContacts()
    if (contacts) {
        return res.render("contactLog.pug", { contacts: contacts })
    } else {
        return res.render("contactLog.pug", { contacts: contacts })
    }
})
app.get('/admin/salelog', auth, async (req, res) => {
    const mostRecentSales = await data.getRecentSales()
    let sales = []
    for (let i = 0; i < Math.min(mostRecentSales.length, 3); i++) {
        sales.push({
            "message": mostRecentSales[i].Msg,
            "active": !mostRecentSales[i].Endt ? 1 : 0,
        });
    }
    return res.json(sales)
})
app.delete('/api/contact', auth, async (req, res) => {
    const contentType = req.headers['content-type']
    if (!contentType || contentType !== 'application/json') {
        return res.status(400).send("Content-Type is not 'application/json'")
    }
    try {
        const id = req.body.id
        if (!id) {
            throw new Error("id is missing from JSON body")
        }
        let result = await data.deleteContact(id)
        if (result) {
            return res.status(200).send("Successful delete")
        } else {
            return res.status(400).send("Delete failed")
        }
    } catch (error) {
        return res.status(400).send(`An error occurred: ${error.message}`)
    }
})
app.delete('/api/sale', auth, (req, res) => {
    data.endSale()
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
        data.addSale(message)
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