const express = require("express")
const fs = require("fs")
const mysql = require("mysql2")
const bodyParser = require("body-parser");
const PORT = 3001
let pidCrypt = require("pidcrypt")
require("pidcrypt/aes_cbc")
const app = express()
const urlencodedParser = bodyParser.urlencoded({extended: false});
const cors = require("cors");
const aes = new pidCrypt.AES.CBC()
app.use(cors());

const connection = mysql.createConnection({
    //FOR TESTING!

    // host: "remotemysql.com",
    // user: "DR1SB0n3fN",
    // database: "DR1SB0n3fN",
    // password: "DfSvP9TsWr"

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

app.get("/commentsGet", (req, res) => {
    const sql = `SELECT * FROM comments`
    connection.query(sql, function (err, results) {
        let messages = JSON.stringify(results, null, '\t')
        if (messages) {
            res.send(messages)
        } else {
            res.status(404).send()
        }
    })
})

app.post("/post", (req, res) => {
    let JsonBody = ''
    req.on('data', chunk => {
        JsonBody += chunk.toString()
    })
    req.on('end', () => {
        let body = JSON.parse(JsonBody)
        const sql = `INSERT INTO messages(message, likes, likeNumber, username) VALUES('${body.message}', ${body.likes}, ${body.likeNumber}, '${body.username}')`
        connection.query(sql, function (err, results) {
            if (err) console.log(err)
            else res.send(true)
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
        let sql = `DELETE FROM messages WHERE messages_id = ${body.messages_id}`
        connection.query(sql, function (err, results) {
            if (err) console.log(err);
        })
        sql = `DELETE FROM comments WHERE messages_id = ${body.messages_id}`
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

app.put("/put", (req, res) => {
    let JsonBody = ''
    req.on('data', chunk => {
        JsonBody += chunk.toString()
    })
    req.on('end', () => {
        let body = JSON.parse(JsonBody)
        const sql = `UPDATE messages SET likeNumber = ${body.likeNumber} WHERE messages_id = ${body.messages_id}`
        connection.query(sql, function (err, results) {
            if (err) console.log(err);
            if (results) {
                res.send('Данные обновлены')
            } else {
                res.status(404).send()
            }
            body = ''
        })
    })
})

app.post("/comments", (req, res) => {
    let JsonBody = ''
    req.on('data', chunk => {
        JsonBody += chunk.toString()
    })
    req.on('end', () => {
        let body = JSON.parse(JsonBody)
        const sql = `SELECT * FROM comments WHERE messages_id =${body.messages_id}`
        connection.query(sql, function (err, results) {
            let comments = JSON.stringify(results, null, '\t')
            if (comments) {
                res.send(comments)
            } else {
                res.status(404).send()
            }
        })
    })
})
app.post("/addComment", (req, res) => {
    let JsonBody = ''
    req.on('data', chunk => {
        JsonBody += chunk.toString()
    })
    req.on('end', () => {
        let body = JSON.parse(JsonBody)
        const sql = `INSERT INTO comments(comment, messages_id, usersname) VALUES('${body.comment}', ${body.messages_id}, '${body.userName}')`
        connection.query(sql, function (err, results) {
            if (err) console.log(err)
            else res.send("Данные добавлены")
            body = ''
        })
        body = ''
    })
})
app.post("/registration", (req, res) => {
    let JsonBody = ''
    req.on('data', chunk => {
        JsonBody += chunk.toString()
    })
    req.on('end', () => {
        let body = JSON.parse(JsonBody)
        let sql = `SELECT * FROM usersdata WHERE login ='${body.userName}'`
        connection.query(sql, function (err, results) {
            if (results[0] !== undefined) {
                res.send(false)
                body = ''
            } else {
                sql = `INSERT INTO usersdata(login, password) VALUES('${body.userName}', '${body.userPassword}')`
                connection.query(sql, function (err, result) {
                    if (err) console.log(err)
                    else res.send(true)
                    body = ''
                })
            }
        })
    })
})
app.get("/users", (req, res) => {
    const sql = `SELECT * FROM usersdata`
    connection.query(sql, function (err, results) {
        let usersdata = JSON.stringify(results, null, '\t')
        if (usersdata) {
            res.send(usersdata)
        } else {
            res.status(404).send()
        }
    })
})

app.post("/authorization", (req, res) => {
    let JsonBody = ''
    req.on('data', chunk => {
        JsonBody += chunk.toString()
    })
    req.on('end', () => {
        let body = JSON.parse(JsonBody)
        let sql = `SELECT * FROM usersdata WHERE login ='${body.userName}'`
        connection.query(sql, function (err, results) {
            if (results[0] !== undefined) {
                let pass = results[0].password
                res.send(pass)
                body = ''
            } else {
                res.send(false)
                body = ''
            }
        })
    })
})


app.listen(PORT, () => {
    console.log(`Server has been started on port ${PORT}`)
})