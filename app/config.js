"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require('dotenv').config();
exports.config = {
    mongoUrl: {
        url: "mongodb://localhost/",
        db: "as_telega_3"
    },
    telegramToken: process.env.TELEGRAM_TOKEN,
    telegramPort: 8001,
    password: process.env.PASSWORD
};
//# sourceMappingURL=config.js.map