const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const redis = require("redis");
const _ = require('lodash')


//create Client redis

const client = redis.createClient();

client.on('error', error => {

    console.log("error: " + error)
})

//Init App 
const app = express();

//Parse middleware url 

app.use(bodyParser.urlencoded())

app.use(bodyParser.json())

//engine views

app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}))

app.set('view engine', 'handlebars');

//path home
app.get('/', (req, res) => {
    res.render('home')
})

app.post('/registerUrl', (req, res) => {
    const url = req.body.url
    const patternUrl = /^https|http|www/gi
    resultMatch = url.match(patternUrl)
    if (resultMatch != null) {
        let token = Math.random() * (url.length * 500 - 100) + 100
        token = Math.floor(token).toString();
        client
            .hexists('url', token, function (err, resultQuery) {
            const responseText = {
                message: ""
            }
            client
                .hset('url', token, url, function (err, resultQuery) {
                responseText.message = `url générée : ${req.headers.host}/${token}`
                if (!err) res.render('home', {
                    message: responseText.message
                })
            });
        })
    } else {
        res.render('home', {
            message: "wrong Pattern your url should be contain http|https|www"
        })
    }
})

app.get('/:tokenUrl', (req, res) => {
    const tokenUrl = req.params.tokenUrl;
    client.hexists('url', tokenUrl, (err, resultQuery) => {
        if (resultQuery == 1) {
            client.hget('url', tokenUrl, (err, url) => {
                res.redirect(url);
            })
        } else {
            res.render('home', {
                message: `L'url ${req.headers.host}/${tokenUrl} n'existe pas...`
            })
        }
    })
})
app.listen(8080, (req, res) => {
    console.log('server started');
})