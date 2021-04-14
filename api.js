const express = require("express")
const fs = require("fs")
const mysql = require("mysql2")
const bodyParser = require("body-parser");
const PORT = 3001
const app = express()
const urlencodedParser = bodyParser.urlencoded({extended: false});
const cors = require("cors");
app.use(cors());
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "NewsLineDB",
    password: "eoot"
})
//Проверка подключения к базе данных
connection.connect(function (err) {
    if (err) {
        return console.error("Ошибка: " + err.message)
    } else {
        console.log("Подключение к серверу MySQL успешно установлено")
    }
})
app.get("/messages", (req, res) => {
    const sql = `SELECT * FROM messages`
    connection.query(sql, function (err, results) {
        let messages = JSON.stringify(results, null, '\t')
        if (messages) {
            res.send(messages)
        } else {
            res.status(404).send()
        }
    })
})
app.post("/post", urlencodedParser, function (req, res) {

    let JsonBody = ''
    req.on('data', chunk => {
        JsonBody += chunk.toString()
    })
    req.on('end', () => {
        let body = JSON.parse(JsonBody)
        const sql = `INSERT INTO messages(message) VALUES(?)`
        connection.query(sql, body.message, function (err, results) {
            if (err) console.log(err)
            else res.send("Данные добавлены")
        })
        body = ''
    })
})

app.post("/delete", (req, res) => {
    let JsonBody = ''
    req.on('data', chunk => {
        JsonBody += chunk.toString()
    })
    req.on('end', () => {
        let body = JSON.parse(JsonBody)
        const sql = `DELETE FROM messages WHERE messages_id = ${body.messages_id}`
        connection.query(sql, function (err, results) {
            if (err) console.log(err);
            if (results) {
                res.send('Данные удалены')
            } else {
                res.status(404).send()
            }
            body = ''
        })
    })
})

// connection.end(function(err) {
//     if (err) {
//         return console.log("Ошибка: " + err.message);
//     }
//     console.log("Подключение закрыто");
// });

app.listen(PORT, () => {
    console.log(`Server has been started on port ${PORT}`)
})