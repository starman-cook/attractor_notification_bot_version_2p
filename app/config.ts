require('dotenv').config()

export const config = {
    mongoUrl: {
        url: "mongodb://localhost/",
        db: `as_telega_3`
    },
    telegramToken: process.env.TELEGRAM_TOKEN,
    telegramPort: 8001,
    password: process.env.PASSWORD
}