"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var tokens_1 = require("../tokens");
exports.config = {
    mongoUrl: {
        url: "mongodb://localhost/",
        // url: "mongodb+srv://QWE123:QWE123@cluster0.rrd3k.mongodb.net/",
        db: "as_telega_3"
    },
    // telegramToken: tokens.main, // main
    telegramToken: tokens_1.tokens.test,
    telegramPort: 8001,
    accountant: "Динаре @attractor_almaty22" // лучше писать в родительском падеже, так как в сообщениях группам там имено Кому Чему обращаться по поводу оплаты и прочего бухгалтерского
};
//# sourceMappingURL=config.js.map