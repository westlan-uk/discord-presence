const sqlCreate = `
    CREATE TABLE IF NOT EXISTS user_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        game TEXT NOT NULL,
        timestamp INT NOT NULL
    )
`

const sqlInsert = `
    INSERT INTO user_status (user_id, user_name, game, timestamp)
        VALUES (?, ?, ?, ?)
`

const sqlSelect = `
    SELECT user_id, user_name, game
    FROM user_status
    WHERE game IS NOT NULL
        AND game != ""
    GROUP BY user_id
    ORDER BY timestamp
`

export { sqlCreate, sqlInsert, sqlSelect }
