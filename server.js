const express = require('express')
require('dotenv').config();
const fs = require('fs')
const fsPromises = require('fs').promises

const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

const app = express()
const connectionString = process.env.CONN_STRING
console.log(connectionString)

//Main DB connection
MongoClient.connect(connectionString, (err, client) => {
    if (err) return console.error(err)
    console.log('Connected to MongoDB')
    const db = client.db('star-wars-quotes')
    const quotesCollection = db.collection('quotes')

    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(express.static('public'))
    app.use(bodyParser.json())
    app.set('view engine', 'ejs')

    app.listen(process.env.PORT || PORT, _ => {
        console.log("Server is live on port 3000")
    })

    //routes

    app.get('/', async (req, res) => {
        try {
            const results = await db.collection('quotes').find().toArray()
            console.log(results)
            res.render('index.ejs',{ quotes: results})
        } catch (err) {
            console.error(err)
        }
    })

    app.get('/dnd/:charName', async (req, res) => {
        try {
            const charName = req.params.charName
            console.log(charName)
            const json = JSON.parse(
                await fs.promises.readFile(`./resources/${charName}.json`)
                    )
            res.render('dnd.ejs',{ char: json})
        } catch (e) {
            console.error(e)
        }
        
    })

    app.put('/quotes', async (req, res) => {
        try {
            const result = await quotesCollection.findOneAndUpdate(
                { name: 'Yoda' },
                {$set: {
                    name: req.body.name,
                    quote: req.body.quote
                } },
                { upsert: true }
            )
            res.json('Success')
        } catch (err) {
            console.log(err)
        }
        
    })

    app.delete('/quotes', async (req,res) => {
        try {
        const result = await quotesCollection.deleteOne(
            {name: req.body.name})
        res.json("Deleted Vader's quote")
        } catch (err) {
            console.log(err)
        }

    })

    app.post('/quotes', async (req,res) => {
        try {
            const result = await quotesCollection.insertOne(req.body)
            res.redirect('/')
            console.log(result)
        }
        catch (err) {
            console.error(err)
        }
    })


})


