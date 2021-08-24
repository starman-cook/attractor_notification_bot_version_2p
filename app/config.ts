import {tokens} from '../tokens'

export const config = {
    mongoUrl: {
        url: "mongodb://localhost/",
        // url: "mongodb+srv://QWE123:QWE123@cluster0.rrd3k.mongodb.net/",
        db: `as_telega_3`
    },
    // telegramToken: tokens.main, // main
    telegramToken: tokens.test, // testing
    telegramPort: 8001,
    accountant: "Динаре @attractor_almaty22" // лучше писать в родительском падеже, так как в сообщениях группам там имено Кому Чему обращаться по поводу оплаты и прочего бухгалтерского
}