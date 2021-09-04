
export const config = {
    mongoUrl: {
        url: "mongodb://localhost/",
        // url: "mongodb+srv://QWE123:QWE123@cluster0.rrd3k.mongodb.net/",
        db: `as_telega_3`
    },
    telegramToken: "", //  LOOK FOR TOKENS IN TOKENS.TXT FILE IN ROOT FILE
    telegramPort: 8001,
    accountant: "Динаре @attractor_almaty22" // лучше писать в родительском падеже, так как в сообщениях группам там имено Кому Чему обращаться по поводу оплаты и прочего бухгалтерского
}