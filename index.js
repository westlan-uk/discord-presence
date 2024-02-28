import { Client, GatewayIntentBits } from 'discord.js'
import 'dotenv/config'
import express from 'express'
import sqlite3 from 'sqlite3'
import { sqlCreate, sqlInsert, sqlSelect } from './sql.js'

const app = express()
const port = process.env.PORT

const db = new sqlite3.Database('data.sqlite')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
})

client.on('ready', () => {
    console.log('Discord Bot Connected')

    db.run(sqlCreate, async (err) => {
        if (!err) {
            let guild = await client.guilds.fetch(process.env.DISCORD_GUILD)
            const guildMembers = await guild.members.fetch()

            var stmt = db.prepare(sqlInsert)

            guildMembers.forEach(function(member) {
                stmt.run(
                    member.id,
                    member.displayName,
                    member.presence?.activities[0]?.name ?? '',
                    Date.now()
                )
            })
        }
    })
})

client.on('presenceUpdate', (oldPresence, newPresence) => {
    const member = newPresence.member

    db.run(
        sqlInsert,
        [
            member.id,
            member.displayName,
            newPresence.activities[0]?.name ?? '',
            Date.now()
        ]
    )
})

client.login(process.env.DISCORD_TOKEN)

app.get('/', async (req, res) => {
    try {
        await db.all(sqlSelect, (err, rows) => {
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
