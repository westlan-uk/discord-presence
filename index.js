require('dotenv').config()
const fs = require('fs')

const express = require('express')
const app = express()
const port = process.env.PORT

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('data.sqlite')

const Discord = require('discord.js')
const client = new Discord.Client()

function getName(member) {
    var nickname = member.nickname

    if (nickname) {
        return nickname
    } else {
        return member.user.username
    }
}

function getGame(member) {
    var game = member.presence.game
    var gameName

    if (game) {
        gameName = game.name
    } else {
        gameName = ''
    }

    return gameName
}

client.on('ready', () => {
    console.log('Discord Bot Connected')

    db.run(`CREATE TABLE IF NOT EXISTS user_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        game TEXT NOT NULL,
        timestamp INT NOT NULL
    )`, (err) => {
        if (!err) {
            let guild = client.guilds.get(process.env.DISCORD_GUILD)

            var stmt = db.prepare('INSERT INTO user_status (user_id, user_name, game, timestamp) VALUES (?, ?, ?, ?)')

            guild.members.forEach(function(member) {
                stmt.run(member.id, getName(member), getGame(member), Date.now())
            })
        }
    })
})

client.on('presenceUpdate', (oldUser, newUser) => {
    db.run(
        'INSERT INTO user_status (user_id, user_name, game, timestamp) VALUES (?, ?, ?, ?)',
        [
            newUser.id,
            getName(newUser),
            getGame(newUser),
            Date.now()
        ]
    )
})

client.login(process.env.DISCORD_TOKEN)

app.get('/', async (req, res) => {
    let results

    try {
        await db.all('SELECT user_id, user_name, game FROM user_status WHERE game IS NOT NULL AND game != "" GROUP BY user_id ORDER BY timestamp', (err, rows) => {
            if (err) {
                console.log('Error', err)
            } else {
                res.json(rows)
            }
        })
    } catch (err) {
        console.log('Error', err)
    }

})

app.listen(port, () => {
    console.log('Discord bot serving on port', port)
})
