"use strict";
// const apiPort = 8000
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    mongoUrl: {
        url: "mongodb://localhost/",
        // url: "mongodb+srv://QWE123:QWE123@cluster0.rrd3k.mongodb.net/",
        db: "as_telega_3"
    },
    // telegramToken: "1514560951:AAFtVl-OZIRVrZNGmcsU6zgsmK8oKd1Qcfs", // main
    telegramToken: "1764913546:AAFBdFo9td0BNJLb9Ir5eM7KTEKKbwo9WVQ",
    telegramPort: 8001,
    accountant: "Динаре @attractor_almaty22" // лучше писать в родительском падеже, так как в сообщениях группам там имено Кому Чему обращаться по поводу оплаты и прочего бухгалтерского
};
//# sourceMappingURL=config.js.map