"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
var cors_1 = __importDefault(require("cors"));
var mongoose_1 = __importDefault(require("mongoose"));
var config_1 = require("./app/config");
var lesson_model_1 = require("./app/models/lesson_model");
var node_schedule_1 = __importDefault(require("node-schedule"));
var moment_1 = __importDefault(require("moment"));
/**
 8. Создать функционал логирования ошибок работы бота
 9. Реализовать функционал отправки логов ошибок по расписанию *****
 */
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Подключение Mongoose
 */
mongoose_1.default.connect(config_1.config.mongoUrl.url + config_1.config.mongoUrl.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(function () {
    console.log("Mongo connected");
})
    .catch(function (err) {
    console.log(err);
});
/**
 * Подключение express
 */
var app = express_1.default();
app.use(cors_1.default());
app.use(express_1.default.json());
app.listen(config_1.config.telegramPort, function () {
    console.log('connected to port ' + config_1.config.telegramPort);
});
/**
 * Подключение телеграм бота
 */
var bot = new node_telegram_bot_api_1.default(config_1.config.telegramToken, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Необходимые переменные
 */
var weekDays = {
    "1": "понедельникам",
    "2": "вторникам",
    "3": "средам",
    "4": "четвергам",
    "5": "пятницам",
    "6": "субботам",
    "7": "воскресеньям",
};
var lessonTime = {
    "evening": "19:30 до 21:30",
    "lunch": "16:00 до 18:00"
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Здесь мы получаем сегодняшнюю дату в нужном формате, плюс создаем переменные для остлеживания даты субботы и пятницы (для контрольной и дедлайна оплаты)
 * Затем проверяем каждый день недели для отправки необходимых сообщений подходящим по параметрам группам
 */
var dateOfNextSaturday;
var dateOnFriday;
/**
 * Понедельник
 */
node_schedule_1.default.scheduleJob("1 0 13 * * 1", function () { return __awaiter(void 0, void 0, void 0, function () {
    var lesson;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, lesson_model_1.Lesson.find()];
            case 1:
                lesson = _a.sent();
                dateOnFriday = moment_1.default().add(4, "days").format("DD-MM-YYYY");
                return [4 /*yield*/, buildPaymentNotificationMessage(lesson, dateOnFriday)];
            case 2:
                _a.sent();
                dateOfNextSaturday = moment_1.default().add(5, "days").format("DD-MM-YYYY");
                return [4 /*yield*/, buildExamMessageBeforeActualDate(lesson, dateOfNextSaturday)];
            case 3:
                _a.sent();
                return [4 /*yield*/, buildTheMessageWithConditions(lesson, "1")];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Вторник
 */
node_schedule_1.default.scheduleJob("1 0 13 * * 2", function () { return __awaiter(void 0, void 0, void 0, function () {
    var lesson;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, lesson_model_1.Lesson.find()];
            case 1:
                lesson = _a.sent();
                return [4 /*yield*/, buildWebinarMessage(lesson, "2")];
            case 2:
                _a.sent();
                dateOnFriday = moment_1.default().add(3, "days").format("DD-MM-YYYY");
                return [4 /*yield*/, buildPaymentNotificationMessage(lesson, dateOnFriday)];
            case 3:
                _a.sent();
                dateOfNextSaturday = moment_1.default().add(4, "days").format("DD-MM-YYYY");
                return [4 /*yield*/, buildExamMessageBeforeActualDate(lesson, dateOfNextSaturday)];
            case 4:
                _a.sent();
                return [4 /*yield*/, buildTheMessageWithConditions(lesson, "2")];
            case 5:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Среда
 */
node_schedule_1.default.scheduleJob("1 0 13 * * 3", function () { return __awaiter(void 0, void 0, void 0, function () {
    var lesson;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, lesson_model_1.Lesson.find()];
            case 1:
                lesson = _a.sent();
                return [4 /*yield*/, buildWebinarMessage(lesson, "3")];
            case 2:
                _a.sent();
                dateOnFriday = moment_1.default().add(3, "days").format("DD-MM-YYYY");
                return [4 /*yield*/, buildPaymentNotificationMessage(lesson, dateOnFriday)];
            case 3:
                _a.sent();
                dateOfNextSaturday = moment_1.default().add(3, "days").format("DD-MM-YYYY");
                return [4 /*yield*/, buildExamMessageBeforeActualDate(lesson, dateOfNextSaturday)];
            case 4:
                _a.sent();
                return [4 /*yield*/, buildTheMessageWithConditions(lesson, "3")];
            case 5:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Четверг
 */
node_schedule_1.default.scheduleJob("1 0 13 * * 4", function () { return __awaiter(void 0, void 0, void 0, function () {
    var lesson;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, lesson_model_1.Lesson.find()];
            case 1:
                lesson = _a.sent();
                dateOnFriday = moment_1.default().add(3, "days").format("DD-MM-YYYY");
                return [4 /*yield*/, buildPaymentNotificationMessage(lesson, dateOnFriday)];
            case 2:
                _a.sent();
                dateOfNextSaturday = moment_1.default().add(2, "days").format("DD-MM-YYYY");
                return [4 /*yield*/, buildExamMessageBeforeActualDate(lesson, dateOfNextSaturday)];
            case 3:
                _a.sent();
                return [4 /*yield*/, buildTheMessageWithConditions(lesson, "4")];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Пятница
 */
node_schedule_1.default.scheduleJob("1 0 13 * * 5", function () { return __awaiter(void 0, void 0, void 0, function () {
    var lesson;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, lesson_model_1.Lesson.find()];
            case 1:
                lesson = _a.sent();
                return [4 /*yield*/, buildWebinarMessage(lesson, "5")];
            case 2:
                _a.sent();
                dateOnFriday = moment_1.default().format("DD-MM-YYYY");
                return [4 /*yield*/, buildPaymentNotificationMessage(lesson, dateOnFriday)];
            case 3:
                _a.sent();
                dateOfNextSaturday = moment_1.default().add(1, "days").format("DD-MM-YYYY");
                return [4 /*yield*/, buildExamMessageBeforeActualDate(lesson, dateOfNextSaturday)];
            case 4:
                _a.sent();
                return [4 /*yield*/, buildTheMessageWithConditions(lesson, "5")];
            case 5:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Суббота
 */
node_schedule_1.default.scheduleJob("1 30 10 * * 6", function () { return __awaiter(void 0, void 0, void 0, function () {
    var lesson;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, lesson_model_1.Lesson.find()];
            case 1:
                lesson = _a.sent();
                return [4 /*yield*/, buildExamMessage(lesson)];
            case 2:
                _a.sent();
                return [4 /*yield*/, buildTheMessageWithConditions(lesson, "6")];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Здесь мы создаем группу, указывая по каким дням занятия, когда вебинары, когда каникулы, какое текущее занятие и контрольная,
 * если вызвать функцию вновь, то предыдущая модель группы с данными будет удалена и на ее место встанет новая
 */
bot.onText(/\/build_(.+)/, function (msg, arr) { return __awaiter(void 0, void 0, void 0, function () {
    var isBotAdmin, botId, admins, admin, i, ii, oldLesson, lesson, send_1, err_1, funnyResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isBotAdmin = false;
                return [4 /*yield*/, bot.getMe()];
            case 1:
                botId = _a.sent();
                return [4 /*yield*/, bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
                        if (c.status == "administrator") {
                            isBotAdmin = true;
                        }
                    })];
            case 2:
                _a.sent();
                if (!isBotAdmin) return [3 /*break*/, 14];
                return [4 /*yield*/, bot.getChatAdministrators(msg.chat.id)];
            case 3:
                admins = _a.sent();
                admin = false;
                for (i = 0; i < admins.length; i++) {
                    if (admins[i].user.id === msg.from.id) {
                        admin = true;
                    }
                }
                if (!admin) return [3 /*break*/, 11];
                _a.label = 4;
            case 4:
                _a.trys.push([4, 8, , 10]);
                ii = arr[1].replace(/\s+/g, ' ').trim().split(" ");
                return [4 /*yield*/, lesson_model_1.Lesson.findOne({ chatId: msg.chat.id })];
            case 5:
                oldLesson = _a.sent();
                if (oldLesson) {
                    oldLesson.delete();
                }
                return [4 /*yield*/, new lesson_model_1.Lesson({
                        chatId: msg.chat.id,
                        groupName: ii[0],
                        lessonDayOne: ii[1],
                        lessonDayTwo: ii[2],
                        webinarOne: ii[3],
                        webinarTwo: ii[4],
                        time: ii[5],
                        holidayOne: ii[6],
                        holidayTwo: ii[7],
                        lessonNumber: parseInt(ii[8]),
                        examNumber: ii[9]
                    })];
            case 6:
                lesson = _a.sent();
                lesson.save();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Регистрация прошла успешно, ваше сообщение будет удалено автоматически через 20 секунд")];
            case 7:
                send_1 = _a.sent();
                setTimeout(function () {
                    bot.deleteMessage(msg.chat.id, send_1.message_id.toString());
                    bot.deleteMessage(msg.chat.id, msg.message_id.toString());
                }, 20000);
                return [3 /*break*/, 10];
            case 8:
                err_1 = _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Неверный ввод")];
            case 9:
                _a.sent();
                return [3 /*break*/, 10];
            case 10: return [3 /*break*/, 13];
            case 11:
                funnyResponse = "\n<b>\u041A\u0430\u0442\u0430\u043D\u044B \u0437\u0432\u0443\u043A\u0438</b>\n<b>\u0421\u0430\u043C\u0443\u0440\u0430\u0439 \u043F\u0440\u043E\u043C\u0430\u0445\u043D\u0443\u043B\u0441\u044F</b>\n<b>\u0421\u044D\u043F\u043F\u0443\u043A\u0443 \u0432\u044B\u0445\u043E\u0434</b>\n        ";
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, funnyResponse, {
                        parse_mode: "HTML"
                    })];
            case 12:
                _a.sent();
                _a.label = 13;
            case 13: return [3 /*break*/, 16];
            case 14: return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Ничего я не создам, пока я не админ")];
            case 15:
                _a.sent();
                _a.label = 16;
            case 16: return [2 /*return*/];
        }
    });
}); });
/**
 * Внесение изменений в нумерацию, можно поменять номер следующего занятия и следующей контрольной
 * НАПОМИНАНИЕ: добавить данное описание в инструкцию
 */
bot.onText(/\/setup_(.+)/, function (msg, arr) { return __awaiter(void 0, void 0, void 0, function () {
    var admins, admin, i, typeAndNumber, lesson, err_2, funnyResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bot.getChatAdministrators(msg.chat.id)];
            case 1:
                admins = _a.sent();
                admin = false;
                for (i = 0; i < admins.length; i++) {
                    if (admins[i].user.id === msg.from.id) {
                        admin = true;
                    }
                }
                if (!admin) return [3 /*break*/, 13];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 10, , 12]);
                typeAndNumber = arr[1].replace(/\s+/g, ' ').trim().split(" ");
                return [4 /*yield*/, lesson_model_1.Lesson.findOne({ chatId: msg.chat.id })];
            case 3:
                lesson = _a.sent();
                if (!(typeAndNumber[0] === "lesson" && typeAndNumber.length === 2)) return [3 /*break*/, 5];
                lesson.lessonNumber = typeAndNumber[1];
                lesson.save();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "\u041D\u043E\u043C\u0435\u0440 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u0438\u0437\u043C\u0435\u043D\u0435\u043D \u043D\u0430 " + typeAndNumber[1])];
            case 4:
                _a.sent();
                return [3 /*break*/, 9];
            case 5:
                if (!(typeAndNumber[0] === "exam" && typeAndNumber.length === 2)) return [3 /*break*/, 7];
                lesson.examNumber = typeAndNumber[1];
                lesson.save();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "\u041D\u043E\u043C\u0435\u0440 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u043E\u0439 \u0438\u0437\u043C\u0435\u043D\u0435\u043D \u043D\u0430 " + typeAndNumber[1])];
            case 6:
                _a.sent();
                return [3 /*break*/, 9];
            case 7: return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Неверный ввод")];
            case 8:
                _a.sent();
                _a.label = 9;
            case 9: return [3 /*break*/, 12];
            case 10:
                err_2 = _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Неверный ввод")];
            case 11:
                _a.sent();
                return [3 /*break*/, 12];
            case 12: return [3 /*break*/, 15];
            case 13:
                funnyResponse = "\n<b>\u041F\u0440\u0430\u0432\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435</b>\n<b>\u0421\u0451\u0433\u0443\u043D\u0430\u0442\u0443 \u0434\u0430\u043D\u043E \u043B\u0438\u0448\u044C</b>\n<b>\u0421\u0442\u0443\u043F\u0430\u0439 \u0447\u0435\u043B\u043E\u0432\u0435\u043A</b>\n        ";
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, funnyResponse, {
                        parse_mode: "HTML"
                    })];
            case 14:
                _a.sent();
                _a.label = 15;
            case 15: return [2 /*return*/];
        }
    });
}); });
/**
 * Установка даты последнего занятия, эта дата нужна для определения следующей контрольной, и эта дата сама устанавливается автоматически после оповещения о предстоящем занятии
 * Но этой функцией нужно установить дату Первого занятия новой группы в самом начале только для того, чтобы продемонстрировать группе
 * что можно проверять данные своей группы, с датой следующей контрольной, датами каникул, номеров занятий и контрольных и прочего
 */
bot.onText(/\/putdate_(.+)/, function (msg, arr) { return __awaiter(void 0, void 0, void 0, function () {
    var admins, admin, i, lesson, err_3, funnyResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bot.getChatAdministrators(msg.chat.id)];
            case 1:
                admins = _a.sent();
                admin = false;
                for (i = 0; i < admins.length; i++) {
                    if (admins[i].user.id === msg.from.id) {
                        admin = true;
                    }
                }
                if (!admin) return [3 /*break*/, 8];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 5, , 7]);
                return [4 /*yield*/, lesson_model_1.Lesson.findOne({ chatId: msg.chat.id })];
            case 3:
                lesson = _a.sent();
                lesson.dateOfLastLesson = arr[1];
                lesson.save();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "\u0414\u0430\u0442\u0430 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0430 \u043D\u0430 " + arr[1])];
            case 4:
                _a.sent();
                return [3 /*break*/, 7];
            case 5:
                err_3 = _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Неверный ввод")];
            case 6:
                _a.sent();
                return [3 /*break*/, 7];
            case 7: return [3 /*break*/, 10];
            case 8:
                funnyResponse = "\n<b>\u0427\u0438\u0441\u043B\u0430 \u043C\u0435\u043D\u044F\u0435\u0448\u044C</b>\n<b>\u0423\u0440\u043E\u043A\u0430 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0442\u044B</b>\n<b>\u041B\u0443\u0447\u0448\u0435 \u043D\u0435 \u043D\u0430\u0434\u043E</b>\n        ";
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, funnyResponse, {
                        parse_mode: "HTML"
                    })];
            case 9:
                _a.sent();
                _a.label = 10;
            case 10: return [2 /*return*/];
        }
    });
}); });
/**
 * Получение инструкций, команда скрыта, нужно писать ее через / без единой ошибки, если студенты получат к ней доступ, то могут сломать бота
 */
bot.onText(/\/givemetheinstructionsplease/, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var isPrivate, admins, admin, i, text, err_4, funnyResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isPrivate = msg.chat.type === "private";
                if (!!isPrivate) return [3 /*break*/, 10];
                return [4 /*yield*/, bot.getChatAdministrators(msg.chat.id)];
            case 1:
                admins = _a.sent();
                admin = false;
                for (i = 0; i < admins.length; i++) {
                    if (admins[i].user.id === msg.from.id) {
                        admin = true;
                    }
                }
                if (!admin) return [3 /*break*/, 7];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 6]);
                text = " \n        <strong>----------------------------------------------------------------</strong>\n        \n        <b>\u041F\u0440\u0438\u0432\u0435\u0442 \u0434\u043E\u0440\u043E\u0433\u043E\u0439 \u0441\u043E\u0437\u0434\u0430\u0442\u0435\u043B\u044C \u0433\u0440\u0443\u043F\u043F\u044B!</b>\n\n        \n        <pre>\u042D\u0442\u043E \u0438\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F \u043F\u043E \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044E \u0433\u0440\u0443\u043F\u043F\u044B \u0434\u043B\u044F \u043E\u043F\u043E\u0432\u0435\u0449\u0435\u043D\u0438\u044F \u0441\u0442\u0443\u0434\u0435\u043D\u0442\u043E\u0432 \u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F\u0445, \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u044B\u0445, \u043E\u043F\u043B\u0430\u0442\u0430\u0445 \u0438 \u043A\u0430\u043D\u0438\u043A\u0443\u043B\u0430\u0445</pre>\n        <pre>\u0412\u0441\u0435 \u0447\u0442\u043E \u043D\u0443\u0436\u043D\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u044D\u0442\u043E \u0432\u0432\u0435\u0441\u0442\u0438 <b>/build_</b> \u0437\u0430\u0442\u0435\u043C \u043D\u0435 \u0441\u0442\u0430\u0432\u044F \u043F\u0440\u043E\u0431\u0435\u043B \u0432\u0432\u0435\u0441\u0442\u0438 \u043F\u0435\u0440\u0432\u044B\u0439 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440, \u0438 \u0437\u0430\u0442\u0435\u043C \u0443\u0436\u0435 \u0447\u0435\u0440\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B\u044B \u0432\u0441\u0435 \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u043F\u0430\u0440\u043C\u0430\u0435\u0442\u0440\u044B.</pre>\n        <pre>\u0412\u0441\u0435\u0433\u043E \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u043E\u0432 9 \u0448\u0442\u0443\u043A. \u041D\u043E \u043D\u0435 \u043F\u0443\u0433\u0430\u0439\u0442\u0435\u0441\u044C, \u0432\u044B \u0432\u0441\u0435\u0433\u0434\u0430 \u043C\u043E\u0436\u0435\u0442\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 \u0432\u0430\u0448\u0435\u0439 \u0433\u0440\u0443\u043F\u043F\u044B \u0438 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u0435\u0435; \u0442\u043E \u0435\u0441\u0442\u044C \u043F\u0440\u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0435\u043D\u0438\u0438 \u043A\u043E\u043C\u0430\u043D\u0434\u044B <b>/build_</b> \u0441\u043E \u0432\u0441\u0435\u043C\u0438 \u043F\u0430\u0440\u043C\u0435\u0442\u0440\u0430\u043C\u0438 \u0443\u0434\u0430\u043B\u0438\u0442 \u0441\u0442\u0430\u0440\u0443\u044E \u0437\u0430\u043F\u0438\u0441\u044C \u0438 \u0441\u043E\u0437\u0434\u0430\u0441\u0442 \u043D\u043E\u0432\u0443\u044E</pre>\n        \n        <b>\u041A\u0430\u043A\u0438\u0435 \u0435\u0441\u0442\u044C \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B:</b>\n        \n        <b>\u0418\u043C\u044F \u0433\u0440\u0443\u043F\u043F\u044B:</b><pre>\u041F\u0438\u0448\u0438\u0442\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0431\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B\u043E\u0432 \u0432 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0438</pre>\n        <b>\u0414\u0435\u043D\u044C \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u043D\u043E\u043C\u0435\u0440 1:</b><pre>\u041F\u0438\u0448\u0438\u0442\u0435 \u0447\u0438\u0441\u043B\u043E\u043C 1 \u044D\u0442\u043E \u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A, 2 \u0432\u0442\u043E\u0440\u043D\u0438\u043A</pre>\n        <b>\u0414\u0435\u043D\u044C \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u043D\u043E\u043C\u0435\u0440 2:</b><pre>\u0422\u0430\u043A\u0436\u0435 \u0447\u0438\u0441\u043B\u043E\u043C 4 \u044D\u0442\u043E \u0447\u0435\u0442\u0432\u0435\u0440\u0433, 5 \u043F\u044F\u0442\u043D\u0438\u0446\u0430</pre>\n        <b>\u0414\u0435\u043D\u044C \u0432\u0435\u0431\u0438\u043D\u0430\u0440\u0430 \u043D\u043E\u043C\u0435\u0440 1:</b><pre>\u041F\u0438\u0448\u0435\u043C \u043D\u043E\u043C\u0435\u0440 \u0434\u043D\u044F, \u0433\u0434\u0435 1 \u044D\u0442\u043E \u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A, 2 \u0432\u0442\u043E\u0440\u043D\u0438\u043A \u0438 \u0442\u0434, \u0438\u043D\u0430\u0447\u0435 \u043F\u0438\u0448\u0435\u043C null</pre>\n        <b>\u0414\u0435\u043D\u044C \u0432\u0435\u0431\u0438\u043D\u0430\u0440\u0430 \u043D\u043E\u043C\u0435\u0440 2:</b><pre>\u0422\u043E\u0436\u0435 \u0441\u0430\u043C\u043E\u0435, \u0447\u0442\u043E \u0438 \u0434\u043B\u044F \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0434\u043D\u044F \u0432\u0435\u0431\u0438\u043D\u0430\u0440\u0430, \u0441\u0442\u0430\u0432\u0438\u043C \u0447\u0438\u0441\u043B\u043E \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0432\u0435\u043D\u043D\u043E \u0434\u043D\u044F \u043D\u0435\u0434\u0435\u043B\u0438, \u043B\u0438\u0431\u043E \u043F\u0440\u043E\u0441\u0442\u043E \u043F\u0438\u0448\u0435\u043C null</pre>\n        <b>\u0412\u0440\u0435\u043C\u044F \u0437\u0430\u043D\u044F\u0442\u0438\u0439:</b><pre>\u0415\u0441\u0442\u044C \u0434\u0432\u0430 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430 \u043B\u0438\u0431\u043E evening \u043B\u0438\u0431\u043E lunch, \u0432\u0435\u0447\u0435\u0440\u043D\u044F\u044F \u0438 \u0434\u043D\u0435\u0432\u043D\u0430\u044F \u0433\u0440\u0443\u043F\u043F\u044B \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0432\u0435\u043D\u043D\u043E</pre>\n        <b>\u0414\u0430\u0442\u0430 \u043F\u0435\u0440\u0432\u044B\u0445 \u043A\u0430\u043D\u0438\u043A\u0443\u043B:</b><pre>\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0434\u0430\u0442\u0443 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 dd-mm-yyyy (\u043E\u0442 \u044D\u0442\u043E\u0439 \u0434\u0430\u0442\u044B \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F \u043D\u0435\u0434\u0435\u043B\u044F \u043A\u0430\u043D\u0438\u043A\u0443\u043B)</pre>\n        <b>\u0414\u0430\u0442\u0430 \u0432\u0442\u043E\u0440\u044B\u0445 \u043A\u0430\u043D\u0438\u043A\u0443\u043B:</b><pre>\u0422\u0430\u043A\u0436\u0435 \u0443\u043A\u0430\u0436\u0438\u0442\u0435 \u0434\u0430\u0442\u0443 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 dd-mm-yyyy</pre>\n        <b>\u041D\u043E\u043C\u0435\u0440 \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F:</b><pre>\u041F\u0440\u043E\u0441\u0442\u043E \u043D\u043E\u043C\u0435\u0440 \u0443\u043A\u0430\u0436\u0438\u0442\u0435 \u0447\u0438\u0441\u043B\u043E\u043C</pre>\n        <b>\u041D\u043E\u043C\u0435\u0440 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u043E\u0439:</b><pre>\u0422\u0430\u043A\u0436\u0435 \u043F\u0440\u043E\u0441\u0442\u043E \u043D\u043E\u043C\u0435\u0440 \u0447\u0438\u0441\u043B\u043E\u043C \u0443\u043A\u0430\u0436\u0438\u0442\u0435</pre>\n        \n        <b>\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 \u043C\u044B \u0441\u043E\u0437\u0434\u0430\u0435\u043C \u0433\u0440\u0443\u043F\u043F\u0443 JS-5 \u0441 \u0437\u0430\u043D\u044F\u0442\u0438\u044F\u043C\u0438 \u043F\u043E \u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A\u0430\u043C \u0438 \u0447\u0435\u0442\u0432\u0435\u0440\u0433\u0430\u043C, \u0432\u0435\u0431\u0438\u043D\u0430\u0440\u0430\u043C\u0438 \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E \u0441\u0440\u0435\u0434\u0430\u043C, \u0443\u0447\u0435\u0431\u043E\u0439 \u0432 \u0434\u043D\u0435\u0432\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F, \u043A\u0430\u043D\u0438\u043A\u0443\u043B\u0430\u043C\u0438 \u043D\u0430 \u043D\u043E\u0432\u044B\u0439 \u0433\u043E\u0434 \u0438 \u043D\u0435\u0434\u0435\u043B\u0435\u0439 \u0432 \u0430\u0432\u0433\u0443\u0441\u0442\u0435 (15 \u0447\u0438\u0441\u043B\u0430), \u0441 \u0441\u0430\u043C\u044B\u043C \u043F\u0435\u0440\u0432\u044B\u043C \u0437\u0430\u043D\u044F\u0442\u0438\u0435\u043C \u0438 \u043F\u0435\u0440\u0432\u043E\u0439 \u043F\u0440\u0435\u0434\u0441\u0442\u043E\u044F\u0449\u0435\u0439 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u043E\u0439:</b>\n        <pre>/build_JS-5 1 4 3 null lunch 27-12-2020 15-08-2021 1 1</pre>\n        \n        <pre>\u0413\u043E\u0442\u043E\u0432\u043E))</pre>\n        \n        <b>PS:</b>\n        \n        <pre>\u0412\u044B \u0442\u0430\u043A\u0436\u0435 \u043C\u043E\u0436\u0435\u0442\u0435 \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043D\u043E\u043C\u0435\u0440 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u0438\u043B\u0438 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u043E\u0439, \u0432\u0432\u043E\u0434\u0438\u0442\u0435 \u043A\u043E\u043C\u0430\u043D\u0434\u0443 /setup_ \u0438 \u0437\u0430\u0442\u0435\u043C exam \u0438\u043B\u0438 lesson \u0438 \u0447\u0435\u0440\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B \u043D\u0430 \u043A\u0430\u043A\u043E\u0439 \u043D\u043E\u043C\u0435\u0440 \u0432\u044B \u0445\u043E\u0442\u0438\u0442\u0435 \u043F\u043E\u043C\u0435\u043D\u044F\u0442\u044C.</pre>\n        <pre>\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, /setup_lesson 83 \u043C\u044B \u043C\u0435\u043D\u044F\u0435\u043C \u043D\u043E\u043C\u0435\u0440 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u043D\u0430 83, \u0438\u043B\u0438 /setup_exam 9 \u043C\u044B \u0441\u0442\u0430\u0432\u0438\u043C \u043D\u043E\u043C\u0435\u0440 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u043E\u0439 9</pre>\n        \n        <b>PPS:</b>\n        \n        <pre>\u0415\u0449\u0435 \u043C\u043E\u0436\u043D\u043E \u043C\u0435\u043D\u044F\u0442\u044C \u0434\u0430\u0442\u0443 \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E (\u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0433\u043E, \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E, \u044D\u0442\u043E \u0432\u0441\u0435 \u043E\u0434\u043D\u043E \u0438 \u0442\u043E \u0436\u0435 \u0437\u0430\u043D\u044F\u0442\u0438\u0435 \u043D\u0430 \u0441\u0430\u043C\u043E\u043C \u0434\u0435\u043B\u0435) \u0437\u0430\u043D\u044F\u0442\u0438\u044F, \u044D\u0442\u043E \u0441\u043A\u043E\u0440\u0435\u0435 \u0432\u0441\u0435\u0433\u043E \u043F\u043E\u043D\u0430\u0434\u043E\u0431\u0438\u0442\u0441\u044F \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u043E\u0434\u0438\u043D \u0440\u0430\u0437 (\u0438 \u0442\u043E, \u0435\u0441\u043B\u0438 \u044D\u0442\u043E\u0433\u043E \u043D\u0435 \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0432\u0441\u0435 \u0441\u0430\u043C\u043E \u0441\u043E\u0431\u043E\u0439 \u043F\u043E\u0441\u0442\u0430\u0432\u0438\u0442\u0441\u044F \u043F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F) \u0434\u043B\u044F \u0434\u0435\u043C\u043E\u043D\u0441\u0442\u0440\u0430\u0446\u0438\u0438 \u043D\u0430 \u043E\u0440\u0438\u0435\u043D\u0442\u0430\u0446\u0438\u0438</pre>\n        <pre>\u041D\u0430\u043F\u0438\u0448\u0438\u0442\u0435 \u043A\u043E\u043C\u0430\u043D\u0434\u0443 /putdate_ \u0438 \u0441\u0440\u0430\u0437\u0443 \u0431\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B\u0430 \u043D\u0430\u043F\u0438\u0448\u0438\u0442\u0435 \u0434\u0430\u0442\u0443 \u0434\u043B\u044F \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F. \u041D\u0430 \u043E\u0440\u0438\u0435\u043D\u0442\u0430\u0446\u0438\u0438 \u044D\u0442\u043E \u0431\u0443\u0434\u0435\u0442 \u0434\u0430\u0442\u0430 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u043A\u0441\u0442\u0430\u0442\u0438, \u0442\u0430\u043A \u043A\u0430\u043A \u0441\u0447\u0435\u0442 \u0438\u0434\u0435\u0442 \u0441 1, \u0438 \u043E\u0442 \u044D\u0442\u043E\u0439 \u0434\u0430\u0442\u044B \u0438 \u043E\u0442 \u044D\u0442\u043E\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u043F\u0440\u043E\u0438\u0437\u043E\u0439\u0434\u0435\u0442 \u0440\u0430\u0441\u0447\u0435\u0442 \u0434\u0430\u0442\u044B \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u043E\u0439!</pre>\n        <pre>\u0414\u0430\u0442\u0443 \u043F\u0438\u0448\u0435\u043C \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 dd-mm-yyyy</pre>\n        <pre>\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, /putdate_20-04-2021 \u0437\u043D\u0430\u0447\u0438\u0442, \u0447\u0442\u043E \u0434\u0430\u0442\u0430 \"\u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E\" \u0437\u0430\u043D\u044F\u0442\u0438\u044F 20 \u0430\u043F\u0440\u0435\u043B\u044F 2021 \u0433\u043E\u0434\u0430</pre>\n        <pre>\u041A\u043E\u0440\u043E\u0447\u0435, \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u0433\u0440\u0443\u043F\u043F\u044B \u043C\u044B \u0436\u0435 \u0432 \u043A\u043E\u043C\u0430\u043D\u0434\u0435 /build_ \u0432 \u043A\u043E\u043D\u0446\u0435 \u043D\u0430\u043F\u0438\u0448\u0435\u043C 1 1 \u0442\u0430\u043A \u043A\u0430\u043A \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0435 \u0437\u0430\u043D\u044F\u0442\u0438\u0435 1 \u0438 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0430\u044F \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u0430\u044F 1. \u0422\u0430\u043A \u0432\u043E\u0442 \u0436\u0434\u044F \u0432\u043E\u0442 \u044D\u0442\u043E\u0433\u043E 1 (\u043F\u0435\u0440\u0432\u043E\u0433\u043E) \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u043D\u0443\u0436\u043D\u043E \u0443\u043A\u0430\u0437\u0430\u0442\u044C \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0443\u044E \u0434\u0430\u0442\u0443, \u043A\u043E\u0433\u0434\u0430 \u044D\u0442\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u0435 \u0431\u0443\u0434\u0435\u0442 \u0438 \u0432\u0441\u0435)))</pre>\n        \n         <b>PPPS:</b>\n         <pre>\u0427\u0442\u043E\u0431\u044B \u043F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 \u0432\u0441\u0435\u0445 \u0433\u0440\u0443\u043F\u043F, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u043C\u0430\u043D\u0434\u0443 /allgroups \u0432 \u043B\u0438\u0447\u043D\u043E\u0439 \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0435 \u0441 \u0431\u043E\u0442\u043E\u043C</pre>\n         \n         <b>PPPPS:</b>\n         <pre>\u0427\u0442\u043E\u0431\u044B \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u0433\u0440\u0443\u043F\u043F\u0443, \u043D\u0430\u043F\u0438\u0448\u0438\u0442\u0435 \u0445\u043E\u0442\u044C \u043B\u0438\u0447\u043D\u043E, \u0445\u043E\u0442\u044C \u0432 \u0433\u0440\u0443\u043F\u043F\u0435 \u043A\u043E\u043C\u0430\u043D\u0434\u0443 /delete_ \u0437\u0430\u0442\u0435\u043C id \u0433\u0440\u0443\u043F\u043F\u044B (\u043C\u043E\u0436\u043D\u043E \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E /allgroups) \u0438 \u0437\u0430\u0442\u0435\u043C \u0447\u0435\u0440\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B \u043F\u0430\u0440\u043E\u043B\u044C, \u043F\u0430\u0440\u043E\u043B\u044C \u0437\u043D\u0430\u044E\u0442 \u0430\u0434\u043C\u0438\u043D\u044B</pre>\n         <pre>\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u043A\u0442\u043E-\u0442\u043E \u0441\u043E\u0437\u0434\u0430\u043B \u043B\u0435\u0432\u0443\u044E \u043D\u0435\u043D\u0443\u0436\u043D\u0443\u044E \u0438\u043B\u0438 \u0442\u0435\u0441\u0442\u043E\u0432\u0443\u044E \u0433\u0440\u0443\u043F\u043F\u0443 \u0441 id 608ce9694d1311418c93ec9f</pre>\n         <pre>\u0427\u0442\u043E\u0431\u044B \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u044D\u0442\u0443 \u0433\u0440\u0443\u043F\u043F\u0443 \u043D\u0430\u043F\u0438\u0448\u0438\u0442\u0435 /delete_608ce9694d1311418c93ec9f ****** (\u0433\u0434\u0435 ****** \u044D\u0442\u043E \u043F\u0430\u0440\u043E\u043B\u044C)</pre>\n\n                                            <pre>           &#9774; &#9774; &#9774; &#9774; &#9774; &#9774; &#9774; &#9774; &#9774;</pre>\n        \n        <strong>----------------------------------------------------------------</strong>\n";
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, text, {
                        parse_mode: "HTML"
                    })];
            case 3:
                _a.sent();
                return [3 /*break*/, 6];
            case 4:
                err_4 = _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Что то рухнуло и сломалось")];
            case 5:
                _a.sent();
                return [3 /*break*/, 6];
            case 6: return [3 /*break*/, 9];
            case 7:
                funnyResponse = "\n<b>\u0423\u0437\u0440\u0435\u0442\u044C \u0436\u0435\u043B\u0430\u0435\u0448\u044C</b>\n<b>\u0418\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044E \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B</b>\n<b>\u041F\u0443\u0441\u0442\u043E\u0442\u0430 \u043A\u0440\u0443\u0433\u043E\u043C</b>\n        ";
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, funnyResponse, {
                        parse_mode: "HTML"
                    })];
            case 8:
                _a.sent();
                _a.label = 9;
            case 9: return [3 /*break*/, 12];
            case 10: return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Лишь в групповом чате отвечаю я на данную команду")];
            case 11:
                _a.sent();
                _a.label = 12;
            case 12: return [2 /*return*/];
        }
    });
}); });
/**
 * Данная функция доступна всем (возможно добавим ее через BotFather в видимые команды), сообщение показывает данные по группе, текущему занятию, датой следующей контрольной
 * Сообщение автоматически удаляется спустя некоторое время
 */
bot.onText(/\/show/, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var isBotAdmin, botId, lesson, dif_1, arrWithRestDays, result_1, parts, dt, text, send_2, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isBotAdmin = false;
                return [4 /*yield*/, bot.getMe()];
            case 1:
                botId = _a.sent();
                return [4 /*yield*/, bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
                        if (c.status == "administrator") {
                            isBotAdmin = true;
                        }
                    })];
            case 2:
                _a.sent();
                if (!isBotAdmin) return [3 /*break*/, 9];
                _a.label = 3;
            case 3:
                _a.trys.push([3, 6, , 8]);
                return [4 /*yield*/, lesson_model_1.Lesson.findOne({ chatId: msg.chat.id })];
            case 4:
                lesson = _a.sent();
                if (lesson.lessonNumber > 1) {
                    dif_1 = (lesson.lessonNumber - 1) % 8;
                }
                else {
                    dif_1 = lesson.lessonNumber % 8;
                }
                arrWithRestDays = [{ key: 1, value: 26 }, { key: 2, value: 23 }, { key: 3, value: 19 }, { key: 4, value: 16 }, { key: 5, value: 12 }, { key: 6, value: 9 }, { key: 7, value: 5 }, { key: 0, value: 2 }];
                result_1 = 0;
                arrWithRestDays.forEach(function (el) {
                    if (el.key === dif_1) {
                        result_1 = el.value;
                    }
                });
                parts = lesson.dateOfLastLesson.split("-");
                dt = new Date(parts[2] + "-" + parts[1] + "-" + parts[0]);
                if (lesson.lessonDayOne === "2")
                    result_1 -= 1;
                dateOfNextSaturday = moment_1.default(dt).add(result_1, "days").format("DD-MM-YYYY");
                text = "\n\n<strong>--------------------------------------</strong>\n\n\n<strong>\u0414\u0430\u043D\u043D\u044B\u0435 \u043F\u043E \u0432\u0430\u0448\u0435\u0439 \u0433\u0440\u0443\u043F\u043F\u0435</strong>\n        \n        \n<b>\u0412\u0430\u0448\u0430 \u0433\u0440\u0443\u043F\u043F\u0430 </b><pre>" + lesson.groupName + "</pre>\n\n<b>\u0412\u044B \u0443\u0447\u0438\u0442\u0435\u0441\u044C \u043F\u043E </b><pre>" + weekDays[lesson.lessonDayOne] + " \u0438 " + weekDays[lesson.lessonDayTwo] + "</pre>\n\n<b>\u041F\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0438 c </b><pre>" + lessonTime[lesson.time] + "</pre>\n\n<b>\u0412\u0435\u0431\u0438\u043D\u0430\u0440\u044B \u043F\u043E </b><pre>" + weekDays[lesson.webinarOne] + "  " + (lesson.webinarTwo ? " и по " + weekDays[lesson.webinarTwo] : "") + "</pre>\n\n<b>\u041D\u043E\u043C\u0435\u0440 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F </b><pre>#" + lesson.lessonNumber + "</pre>\n\n<b>\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u0430\u044F </b><pre>#" + lesson.examNumber + " \u0431\u0443\u0434\u0435\u0442 \u0432 \u0441\u0443\u0431\u0431\u043E\u0442\u0443 " + dateOfNextSaturday + "</pre>     \n\n<b>\u041F\u0435\u0440\u0432\u044B\u0435 \u043A\u0430\u043D\u0438\u043A\u0443\u043B\u044B</b><pre>#" + lesson.holidayOne + "</pre> \n     \n<b>\u0412\u0442\u043E\u0440\u044B\u0435 \u043A\u0430\u043D\u0438\u043A\u0443\u043B\u044B</b><pre>#" + lesson.holidayTwo + "</pre> \n     \n<strong>--------------------------------------</strong>\n \n";
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, text, {
                        parse_mode: "HTML"
                    })];
            case 5:
                send_2 = _a.sent();
                setTimeout(function () {
                    bot.deleteMessage(msg.chat.id, msg.message_id.toString());
                    bot.deleteMessage(msg.chat.id, send_2.message_id.toString());
                }, 30000); // 30 секунд до удаления сообщения
                return [3 /*break*/, 8];
            case 6:
                err_5 = _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Группа еще не создана")];
            case 7:
                _a.sent();
                return [3 /*break*/, 8];
            case 8: return [3 /*break*/, 11];
            case 9: return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Хочу быть админом, иначе ничего не покажу")];
            case 10:
                _a.sent();
                _a.label = 11;
            case 11: return [2 /*return*/];
        }
    });
}); });
/**
 * Функции для выгрузки данных по всем группам
 * Доступно только при личной переписке с ботом, команда доступна всем
 * Подсказки данной команды нет, нужно вводить самому без ошибок, иначе не сработает
 */
bot.onText(/\/allgroups/, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var isPrivate, arrWithRestDays, lesson, _loop_1, i, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isPrivate = msg.chat.type === "private";
                arrWithRestDays = [{ key: 1, value: 26 }, { key: 2, value: 23 }, { key: 3, value: 19 }, { key: 4, value: 16 }, { key: 5, value: 12 }, { key: 6, value: 9 }, { key: 7, value: 5 }, { key: 0, value: 2 }];
                if (!isPrivate) return [3 /*break*/, 12];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 9, , 11]);
                return [4 /*yield*/, lesson_model_1.Lesson.find()];
            case 2:
                lesson = _a.sent();
                if (!(lesson.length === 0)) return [3 /*break*/, 4];
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Групп в наличии нет, какой кошмар")];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                _loop_1 = function (i) {
                    var totalAmountOfUsers, admins, amountWithoutAdmins, dif, result, parts, dt, text;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, bot.getChatMembersCount(lesson[i].chatId)];
                            case 1:
                                totalAmountOfUsers = _b.sent();
                                return [4 /*yield*/, bot.getChatAdministrators(lesson[i].chatId)];
                            case 2:
                                admins = _b.sent();
                                amountWithoutAdmins = totalAmountOfUsers - admins.length;
                                if (lesson[i].lessonNumber > 1) {
                                    dif = (lesson[i].lessonNumber - 1) % 8;
                                }
                                else {
                                    dif = lesson[i].lessonNumber % 8;
                                }
                                result = 0;
                                arrWithRestDays.map(function (el) {
                                    if (el.key === dif) {
                                        result = el.value;
                                        return null;
                                    }
                                });
                                parts = lesson[i].dateOfLastLesson.split("-");
                                dt = new Date(parts[2] + "-" + parts[1] + "-" + parts[0]);
                                if (lesson[i].lessonDayOne === "2")
                                    result -= 1;
                                dateOfNextSaturday = moment_1.default(dt).add(result, "days").format("DD-MM-YYYY");
                                text = "\n\n<strong>--------------------------------------</strong>\n\n<b>\u0414\u0430\u043D\u043D\u044B\u0435 \u043F\u043E \u0433\u0440\u0443\u043F\u043F\u0435 </b><pre>" + lesson[i].groupName + "</pre>\n\n<b>\u041B\u044E\u0434\u0435\u0439 \u0432 \u0447\u0430\u0442\u0435 \u0433\u0440\u0443\u043F\u043F\u044B </b><pre>" + totalAmountOfUsers + "</pre>\n\n<b>\u041B\u044E\u0434\u0435\u0439 \u0432 \u0447\u0430\u0442\u0435 \u0431\u0435\u0437 \u0430\u0434\u043C\u0438\u043D\u043E\u0432 </b><pre>" + amountWithoutAdmins + "</pre>\n\n<b>\u0423\u0447\u0435\u0431\u043D\u044B\u0435 \u0434\u043D\u0438 \u043F\u043E </b><pre>" + weekDays[lesson.lessonDayOne] + " \u0438 " + weekDays[lesson.lessonDayTwo] + "</pre>\n\n<b>\u041F\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0438 c </b><pre>" + lessonTime[lesson.time] + "</pre>\n\n<b>\u0412\u0435\u0431\u0438\u043D\u0430\u0440\u044B \u043F\u043E </b><pre>" + weekDays[lesson.webinarOne] + "  " + (lesson.webinarTwo ? " и по " + weekDays[lesson.webinarTwo] : "") + "</pre>\n\n<b>\u041D\u043E\u043C\u0435\u0440 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F </b><pre>#" + lesson[i].lessonNumber + "</pre>\n\n<b>\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u0430\u044F </b><pre>#" + lesson[i].examNumber + " \u0431\u0443\u0434\u0435\u0442 \u0432 \u0441\u0443\u0431\u0431\u043E\u0442\u0443 " + dateOfNextSaturday + "</pre>\n\n<b>\u041F\u0435\u0440\u0432\u044B\u0435 \u043A\u0430\u043D\u0438\u043A\u0443\u043B\u044B</b><pre>#" + lesson[i].holidayOne + "</pre>\n\n<b>\u0412\u0442\u043E\u0440\u044B\u0435 \u043A\u0430\u043D\u0438\u043A\u0443\u043B\u044B</b><pre>#" + lesson[i].holidayTwo + "</pre>\n\n<b>ID \u0433\u0440\u0443\u043F\u043F\u044B</b><pre>" + lesson[i]._id + "</pre>\n\n<strong>--------------------------------------</strong>\n\n";
                                return [4 /*yield*/, bot.sendMessage(msg.chat.id, (i + 1).toString())];
                            case 3:
                                _b.sent();
                                return [4 /*yield*/, bot.sendMessage(msg.chat.id, text, {
                                        parse_mode: "HTML"
                                    })];
                            case 4:
                                _b.sent();
                                return [2 /*return*/];
                        }
                    });
                };
                i = 0;
                _a.label = 5;
            case 5:
                if (!(i < lesson.length)) return [3 /*break*/, 8];
                return [5 /*yield**/, _loop_1(i)];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7:
                i++;
                return [3 /*break*/, 5];
            case 8: return [3 /*break*/, 11];
            case 9:
                err_6 = _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Что то рухнуло и сломалось")];
            case 10:
                _a.sent();
                return [3 /*break*/, 11];
            case 11: return [3 /*break*/, 14];
            case 12: return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Напиши мне эту команду лично пожалуйста, я не могу когда все смотрят")];
            case 13:
                _a.sent();
                _a.label = 14;
            case 14: return [2 /*return*/];
        }
    });
}); });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Функция для удаления группы, удалять можно любую группу, это сделано потому, что кто угодно может создать групповой чат с ботом и создать левую группу, которая будет падать в список групп и засорять его
 * Но вы наверное думаете, так и удалить кто угодно сможет, это ж капец. Но не бесспокойтесь, чтобы удалить группу, нужно ввести пароль
 * Вы вводите команду /delete_ затем id группы для удаления (id можно получить из списка всех групп, это нужно потому, что имена могут быть одиннаковыми) и затем через пробел пишите пароль
 * Пароль пока не придумал где хранить, пусть это будет coolPasha
 */
bot.onText(/\/delete_(.+)/, function (msg, arr) { return __awaiter(void 0, void 0, void 0, function () {
    var funnyResponse, ii, lesson, err_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                funnyResponse = "\n<b>\u0413\u0440\u0443\u043F\u043F\u0443 \u0443\u0434\u0430\u043B\u0438\u0442\u044C</b>\n<b>\u041E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u043F\u0443\u0441\u0442\u043E\u0442\u0443 \u043D\u0430\u043C</b>\n<b>\u0412\u0430\u043C \u043C\u0430\u043B\u043E \u0447\u0435\u0441\u0442\u0438</b>\n        ";
                _a.label = 1;
            case 1:
                _a.trys.push([1, 8, , 10]);
                ii = arr[1].replace(/\s+/g, ' ').trim().split(" ");
                return [4 /*yield*/, lesson_model_1.Lesson.findOne({ _id: ii[0] })];
            case 2:
                lesson = _a.sent();
                if (!(ii[1] === "coolPasha")) return [3 /*break*/, 5];
                return [4 /*yield*/, lesson.delete()];
            case 3:
                _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "\u0413\u0440\u0443\u043F\u043F\u0430 " + lesson.groupName + " \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0443\u0434\u0430\u043B\u0435\u043D\u0430 \u0438\u0437 \u0431\u0430\u0437\u044B")];
            case 4:
                _a.sent();
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, bot.sendMessage(msg.chat.id, funnyResponse, {
                    parse_mode: "HTML"
                })];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7: return [3 /*break*/, 10];
            case 8:
                err_7 = _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, funnyResponse, {
                        parse_mode: "HTML"
                    })];
            case 9:
                _a.sent();
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Квест, разные команды, которые ведут к новым задачам, ответы буду писать в описании к каждой команде
 */
/**
 * Первый шифр, азбука Морзе, отправляется аудиофайлом. Зашифрованная команда gotonext
 */
bot.onText(/\/letsplay/, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var isBotAdmin, botId, text, send_3, err_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isBotAdmin = false;
                return [4 /*yield*/, bot.getMe()];
            case 1:
                botId = _a.sent();
                return [4 /*yield*/, bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
                        if (c.status == "administrator") {
                            isBotAdmin = true;
                        }
                    })];
            case 2:
                _a.sent();
                if (!isBotAdmin) return [3 /*break*/, 9];
                _a.label = 3;
            case 3:
                _a.trys.push([3, 6, , 8]);
                text = "\n            <b>\u041A\u0430\u043A \u043A\u043E\u043C\u0430\u043D\u0434\u0443 \u043D\u0430\u043F\u0438\u0448\u0438 \u043C\u043D\u0435 \u0447\u0442\u043E \u0442\u044B \u0441\u043B\u044B\u0448\u0438\u0448\u044C \u0432 \u044D\u0442\u043E\u043C \u0444\u0430\u0439\u043B\u0435</b>\n        ";
                return [4 /*yield*/, bot.sendAudio(msg.chat.id, "./ciphers/guesswhat.wav", {
                        caption: text,
                        parse_mode: "HTML"
                    })];
            case 4:
                send_3 = _a.sent();
                return [4 /*yield*/, setTimeout(function () {
                        bot.deleteMessage(msg.chat.id, msg.message_id.toString());
                        bot.deleteMessage(msg.chat.id, send_3.message_id.toString());
                    }, 120000)];
            case 5:
                _a.sent();
                return [3 /*break*/, 8];
            case 6:
                err_8 = _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Похоже что-то случилось с соединением, или вы звбыли сделать бота админом в групповом чате, или у вас руки кривые))) сообщите саппорту о проблеме")];
            case 7:
                _a.sent();
                return [3 /*break*/, 8];
            case 8: return [3 /*break*/, 11];
            case 9: return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Я бы с радостью показал и затем удалил квестовое сообщение, но я лишь обычный юзер, а не админ((((")];
            case 10:
                _a.sent();
                _a.label = 11;
            case 11: return [2 /*return*/];
        }
    });
}); });
/**
 *  Это обычный код цезаря, его можно получить только в личной переписке. Если кто-то напишет команду в общий чат, то команда сразу удалится
 *  чтобы никто не скопировал то, что смог найти другой. Шифр имеет отступ +7 символов, ведет к команде stepthree
 */
bot.onText(/\/gotonext/, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var isBotAdmin, botId, isPrivate, send_4, err_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isBotAdmin = false;
                return [4 /*yield*/, bot.getMe()];
            case 1:
                botId = _a.sent();
                return [4 /*yield*/, bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
                        if (c.status == "administrator") {
                            isBotAdmin = true;
                        }
                    })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _a.trys.push([3, 12, , 14]);
                isPrivate = msg.chat.type === "private";
                if (!isPrivate) return [3 /*break*/, 5];
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "dypal uvd wslhzl av tl aol jvtthuk zalwaoyll")];
            case 4:
                _a.sent();
                return [3 /*break*/, 11];
            case 5:
                if (!isBotAdmin) return [3 /*break*/, 9];
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Напиши мне эту команду лично, я не могу при всех")];
            case 6:
                send_4 = _a.sent();
                return [4 /*yield*/, bot.deleteMessage(msg.chat.id, msg.message_id.toString())];
            case 7:
                _a.sent();
                return [4 /*yield*/, setTimeout(function () {
                        bot.deleteMessage(msg.chat.id, send_4.message_id.toString());
                    }, 7000)];
            case 8:
                _a.sent();
                return [3 /*break*/, 11];
            case 9: return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Как вы узнали эту команду при том, что я не админ?? Вы читер?")];
            case 10:
                _a.sent();
                _a.label = 11;
            case 11: return [3 /*break*/, 14];
            case 12:
                err_9 = _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Похоже что-то случилось с соединением, или вы звбыли сделать бота админом в групповом чате, или у вас руки кривые))) сообщите саппорту о проблеме")];
            case 13:
                _a.sent();
                return [3 /*break*/, 14];
            case 14: return [2 /*return*/];
        }
    });
}); });
/**
 *  Код перебора, в каждой группе букв берем сначала все первые буквы подряд, потом вторые и так далее, пока не получим предложение.
 *  Код ведет к команде website (исходное предложение you are on the right way my friend now write me the command website)
 */
bot.onText(/\/stepthree/, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var isBotAdmin, botId, isPrivate, send_5, err_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isBotAdmin = false;
                return [4 /*yield*/, bot.getMe()];
            case 1:
                botId = _a.sent();
                return [4 /*yield*/, bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
                        if (c.status == "administrator") {
                            isBotAdmin = true;
                        }
                    })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _a.trys.push([3, 12, , 14]);
                isPrivate = msg.chat.type === "private";
                if (!isPrivate) return [3 /*break*/, 5];
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "yhynen oemotd urywhw aifwee rgrrcb ehiios otetmi nwnemt tadmae")];
            case 4:
                _a.sent();
                return [3 /*break*/, 11];
            case 5:
                if (!isBotAdmin) return [3 /*break*/, 9];
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Если второй шаг был в личной переписке, почему третий должен быть в общем чате?")];
            case 6:
                send_5 = _a.sent();
                return [4 /*yield*/, bot.deleteMessage(msg.chat.id, msg.message_id.toString())];
            case 7:
                _a.sent();
                return [4 /*yield*/, setTimeout(function () {
                        bot.deleteMessage(msg.chat.id, send_5.message_id.toString());
                    }, 7000)];
            case 8:
                _a.sent();
                return [3 /*break*/, 11];
            case 9: return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Похоже да, вы читер, фуууу")];
            case 10:
                _a.sent();
                _a.label = 11;
            case 11: return [3 /*break*/, 14];
            case 12:
                err_10 = _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Похоже что-то случилось с соединением, или вы звбыли сделать бота админом в групповом чате, или у вас руки кривые))) сообщите саппорту о проблеме")];
            case 13:
                _a.sent();
                return [3 /*break*/, 14];
            case 14: return [2 /*return*/];
        }
    });
}); });
/**
 * Отсюда мы попадем на сайт, в котором через испектор в тэгах разметки спрятаны в data фттрибутах уравнения
 * и пояснение что нужно написать ответы подряд слитно в качестве команды боту
 * Уранения:
 * 1) 4x–36=x+36   Ответ: 24
 * 2) x=(7x)-18    Ответ: 3
 * 3) x+75=4x      Ответ: 25
 * 4) 2x/3+3x/2=13 Ответ: 6
 * Итоговая команда /243256
 */
bot.onText(/\/website/, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var isBotAdmin, botId, isPrivate, send_6, err_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isBotAdmin = false;
                return [4 /*yield*/, bot.getMe()];
            case 1:
                botId = _a.sent();
                return [4 /*yield*/, bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
                        if (c.status == "administrator") {
                            isBotAdmin = true;
                        }
                    })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _a.trys.push([3, 12, , 14]);
                isPrivate = msg.chat.type === "private";
                if (!isPrivate) return [3 /*break*/, 5];
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "https://starman-cook.github.io/cipher/html.html")];
            case 4:
                _a.sent();
                return [3 /*break*/, 11];
            case 5:
                if (!isBotAdmin) return [3 /*break*/, 9];
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Вы издеваетесь))?")];
            case 6:
                send_6 = _a.sent();
                return [4 /*yield*/, bot.deleteMessage(msg.chat.id, msg.message_id.toString())];
            case 7:
                _a.sent();
                return [4 /*yield*/, setTimeout(function () {
                        bot.deleteMessage(msg.chat.id, send_6.message_id.toString());
                    }, 7000)];
            case 8:
                _a.sent();
                return [3 /*break*/, 11];
            case 9: return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Я читеру бы написал 'Вы издеваетесь?', но я не админ, поэтому пишу всякую фигню... ")];
            case 10:
                _a.sent();
                _a.label = 11;
            case 11: return [3 /*break*/, 14];
            case 12:
                err_11 = _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Похоже что-то случилось с соединением, или вы звбыли сделать бота админом в групповом чате, или у вас руки кривые))) сообщите саппорту о проблеме")];
            case 13:
                _a.sent();
                return [3 /*break*/, 14];
            case 14: return [2 /*return*/];
        }
    });
}); });
/**
 *  Это финальная задача, довольно сложная. Код типа vigenere, который по ключу решается
 *  ключ спрятан в групповом чате, нужно написать эту команду сначала в группу, получить ключ
 *  отсальной шифр спрятан в картинке, нужно скачать картинку полученную по коду
 *  и поменять расширение на txt, тогда в самом низу будет шифр и подсказка, что нужен ключ для расшифровки
 *  ключ notredame
 *  код gvx cevt oszateh ls uezhavgkaytvcg
 *  команда итоговая iamthechampion
 */
bot.onText(/\/243256/, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var isBotAdmin, botId, isPrivate, text, send_7, err_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isBotAdmin = false;
                return [4 /*yield*/, bot.getMe()];
            case 1:
                botId = _a.sent();
                return [4 /*yield*/, bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
                        if (c.status == "administrator") {
                            isBotAdmin = true;
                        }
                    })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _a.trys.push([3, 12, , 14]);
                isPrivate = msg.chat.type === "private";
                if (!isPrivate) return [3 /*break*/, 5];
                text = "\n            <b>\u041D\u0435 \u043D\u0443\u0436\u043D\u043E \u043D\u0438\u0447\u0435\u0433\u043E \u0438\u0441\u043A\u0430\u0442\u044C, \u043D\u0443\u0436\u043D\u043E \u043B\u0438\u0448\u044C \u0441\u043A\u0430\u0447\u0430\u0442\u044C \u0438 \u0447\u0442\u043E-\u0442\u043E \u043F\u043E\u043C\u0435\u043D\u044F\u0442\u044C</b>\n            ";
                return [4 /*yield*/, bot.sendDocument(msg.chat.id, "./ciphers/lebowski_hidden_cipher.jpg", {
                        caption: text,
                        parse_mode: "HTML"
                    })];
            case 4:
                _a.sent();
                return [3 /*break*/, 11];
            case 5:
                if (!isBotAdmin) return [3 /*break*/, 9];
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Вы далеко зашли, и вами движет любопытство, что же ответит бот в общем чате на этот раз. А отвечу я 'notredame'")];
            case 6:
                send_7 = _a.sent();
                return [4 /*yield*/, bot.deleteMessage(msg.chat.id, msg.message_id.toString())];
            case 7:
                _a.sent();
                return [4 /*yield*/, setTimeout(function () {
                        bot.deleteMessage(msg.chat.id, send_7.message_id.toString());
                    }, 7000)];
            case 8:
                _a.sent();
                return [3 /*break*/, 11];
            case 9: return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Будь я админом, я дал бы вам крайне важную подсказку по квесту, а так фиг вам))")];
            case 10:
                _a.sent();
                _a.label = 11;
            case 11: return [3 /*break*/, 14];
            case 12:
                err_12 = _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Похоже что-то случилось с соединением, или вы звбыли сделать бота админом в групповом чате, или у вас руки кривые))) сообщите саппорту о проблеме")];
            case 13:
                _a.sent();
                return [3 /*break*/, 14];
            case 14: return [2 /*return*/];
        }
    });
}); });
/**
 *  Это последняя на данный момент команда для победителя, более шифров нет, просто поздравления и просьба сообщить саппортам
 *  о своей победе))) Подумать о призах, может скидку тому, кто первый решит?
 */
bot.onText(/\/iamthechampion/, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var isBotAdmin, botId, isPrivate, text, textWinnerToGroup, err_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isBotAdmin = false;
                return [4 /*yield*/, bot.getMe()];
            case 1:
                botId = _a.sent();
                return [4 /*yield*/, bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
                        if (c.status == "administrator") {
                            isBotAdmin = true;
                        }
                    })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _a.trys.push([3, 11, , 13]);
                isPrivate = msg.chat.type === "private";
                if (!isPrivate) return [3 /*break*/, 5];
                text = "\n                                    <b>&#9812; \u0412\u044B \u043F\u043E\u0431\u0435\u0434\u0438\u043B\u0438!!!&#127881;&#127881;&#127881;</b>\n    <b>&#9812; \u041E\u0442\u043B\u0438\u0447\u043D\u0430\u044F \u0440\u0430\u0431\u043E\u0442\u0430 " + msg.chat.first_name + "&#127881;&#127881;&#127881;</b>\n    <b>&#9812; \u0421\u043E\u043E\u0431\u0449\u0438\u0442\u0435 \u043E \u0441\u0432\u043E\u0435\u0439 \u043F\u043E\u0431\u0435\u0434\u0435 \u0441\u0430\u043F\u043F\u043E\u0440\u0442\u0443&#127881;&#127881;&#127881;</b>\n    <b>&#9812; \u041C\u044B \u043F\u0440\u0438\u0434\u0443\u043C\u0430\u0435\u043C \u043A\u0430\u043A \u0432\u0430\u0441 \u043D\u0430\u0433\u0440\u0430\u0434\u0438\u0442\u044C)))&#127881;&#127881;&#127881;</b>\n    <b>&#9812; \u0412\u044B \u0441\u0443\u043F\u0435\u0440!&#127881;&#127881;&#127881;</b>\n            ";
                return [4 /*yield*/, bot.sendPhoto(msg.chat.id, "./ciphers/winner.jpg", {
                        caption: text,
                        parse_mode: 'HTML'
                    })];
            case 4:
                _a.sent();
                return [3 /*break*/, 10];
            case 5:
                if (!isBotAdmin) return [3 /*break*/, 8];
                textWinnerToGroup = "\n    <b>&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;</b>\n                    <b>&#9812; \u0421\u043C\u043E\u0442\u0440\u0438\u0442\u0435 \u0432\u0441\u0435, " + msg.from.first_name + " \u0440\u0435\u0448\u0438\u043B \u0433\u043E\u043B\u043E\u0432\u043E\u043B\u043E\u043C\u043A\u0443! &#9812;</b>\n    <b>&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;</b>\n    ";
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, textWinnerToGroup, {
                        parse_mode: "HTML"
                    })];
            case 6:
                _a.sent();
                return [4 /*yield*/, bot.deleteMessage(msg.chat.id, msg.message_id.toString())];
            case 7:
                _a.sent();
                return [3 /*break*/, 10];
            case 8: return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Я бы сказал кто здесь победитель, со смайликами всякими, но я не админ... и как вы дошли до этой команды без бота админа? Удалите команду, чтобы не спойлерить решение")];
            case 9:
                _a.sent();
                _a.label = 10;
            case 10: return [3 /*break*/, 13];
            case 11:
                err_13 = _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Похоже что-то случилось с соединением, или вы звбыли сделать бота админом в групповом чате, или у вас руки кривые))) сообщите саппорту о проблеме")];
            case 12:
                _a.sent();
                return [3 /*break*/, 13];
            case 13: return [2 /*return*/];
        }
    });
}); });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Функции для составления необходимых сообщений
 */
/**
 * Функция для составления базового сообщения, и вебинарного сообщения (возникла из-за частых переносов дат и времени вебинара), как о контрольной (но есть и другие сообщения о контрольной), так и о занятиях
 */
function buildTheMessage(chatId, typeOfLesson, lessonOrExamNumber, time, date, additionalText) {
    return __awaiter(this, void 0, void 0, function () {
        var text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    text = "\u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435 #\u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u043C, \u0441\u0435\u0433\u043E\u0434\u043D\u044F (" + date + ") \u0443 \u0432\u0430\u0441 \u0441\u043E\u0441\u0442\u043E\u0438\u0442\u0441\u044F " + typeOfLesson + " \u043D\u043E\u043C\u0435\u0440 #" + lessonOrExamNumber + " \u0432 " + time + ", " + additionalText;
                    return [4 /*yield*/, bot.sendMessage(chatId, text)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function buildTheWebinarMessage(chatId, typeOfLesson, date, additionalText) {
    return __awaiter(this, void 0, void 0, function () {
        var text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    text = "\u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435 #\u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u043C, \u0441\u0435\u0433\u043E\u0434\u043D\u044F (" + date + ") \u0443 \u0432\u0430\u0441 \u0441\u043E\u0441\u0442\u043E\u0438\u0442\u0441\u044F " + typeOfLesson + ", " + additionalText;
                    return [4 /*yield*/, bot.sendMessage(chatId, text)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Функция для определения какое именно будет сообщение, идет проверка на день недели и вечернюю или дневную группу
 */
function buildTheMessageWithConditions(lesson, day) {
    return __awaiter(this, void 0, void 0, function () {
        var date, i, holiday;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    date = moment_1.default().format("DD-MM-YYYY");
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < lesson.length)) return [3 /*break*/, 7];
                    holiday = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo);
                    if (holiday)
                        return [3 /*break*/, 6];
                    if (!(lesson[i].lessonDayOne === day || lesson[i].lessonDayTwo === day)) return [3 /*break*/, 6];
                    if (!(lesson[i].time === 'evening')) return [3 /*break*/, 3];
                    return [4 /*yield*/, buildTheMessage(lesson[i].chatId, "Занятие", lesson[i].lessonNumber + "", "19:30", date, "читайте раздатку перед занятием")];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    if (!(lesson[i].time === 'lunch')) return [3 /*break*/, 5];
                    return [4 /*yield*/, buildTheMessage(lesson[i].chatId, "Занятие", lesson[i].lessonNumber + "", "16:00", date, "читайте раздатку перед занятием")];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    lesson[i].lessonNumber += 1;
                    lesson[i].dateOfLastLesson = date;
                    // @ts-ignore
                    lesson[i].save();
                    _a.label = 6;
                case 6:
                    i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Функция для составления сообщения о вебинаре, проверяет на среду и пятницу, время зашито как 19:30
 */
function buildWebinarMessage(lesson, day) {
    return __awaiter(this, void 0, void 0, function () {
        var date, i, holiday;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    date = moment_1.default().format("DD-MM-YYYY");
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < lesson.length)) return [3 /*break*/, 4];
                    holiday = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo);
                    if (holiday)
                        return [3 /*break*/, 3];
                    if (!(lesson[i].webinarOne === day || lesson[i].webinarTwo === day)) return [3 /*break*/, 3];
                    if ((lesson[i].webinarOne === "3" || lesson[i].webinarOne === "2") && lesson[i].lessonNumber % 8 === 1) {
                        return [3 /*break*/, 3];
                    }
                    return [4 /*yield*/, buildTheWebinarMessage(lesson[i].chatId, "Вебинар", date, "\u041F\u0438\u0448\u0438\u0442\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B \u0441 \u0445\u044D\u0448\u0442\u044D\u0433\u043E\u043C #\u041D\u0430\u0432\u0435\u0431\u0438\u043D\u0430\u0440")];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Функция для сообщения о контрольной в день контрольной
 */
function buildExamMessage(lesson) {
    return __awaiter(this, void 0, void 0, function () {
        var date, i, holiday;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    date = moment_1.default().format("DD-MM-YYYY");
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < lesson.length)) return [3 /*break*/, 5];
                    holiday = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo);
                    if (holiday)
                        return [3 /*break*/, 4];
                    if (!((lesson[i].lessonNumber - 1) % 8 === 0 && lesson[i].lessonNumber >= 8)) return [3 /*break*/, 3];
                    return [4 /*yield*/, buildTheMessage(lesson[i].chatId, "Контрольная", lesson[i].examNumber + "", "11:00", date, "\u0433\u043E\u0442\u043E\u0432\u044C\u0442\u0435 \u0442\u0440\u0435\u043A\u043A\u0435\u0440 \u0435\u0441\u043B\u0438 \u0432\u044B \u0441\u0434\u0430\u0435\u0442\u0435 \u043E\u043D\u043B\u0430\u0439\u043D, \u0432\u043A\u043B\u044E\u0447\u0430\u0439\u0442\u0435 \u0437\u0443\u043C, \u043F\u0440\u0438\u0433\u043E\u0442\u043E\u0432\u044C\u0442\u0435 \u0440\u0443\u0447\u043A\u0443 \u0438 \u0431\u0443\u043C\u0430\u0433\u0443, \u043B\u0438\u0448\u043D\u0438\u043C\u0438 \u043D\u0435 \u0431\u0443\u0434\u0443\u0442))")];
                case 2:
                    _a.sent();
                    lesson[i].examNumber += 1;
                    _a.label = 3;
                case 3:
                    // @ts-ignore
                    lesson[i].save();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Функция для сообщения о контролльной в течение недели до контрольной с указанием даты контрольной
 */
function buildExamMessageBeforeActualDate(lesson, date) {
    return __awaiter(this, void 0, void 0, function () {
        var i, holiday, text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < lesson.length)) return [3 /*break*/, 4];
                    holiday = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo);
                    if (holiday)
                        return [3 /*break*/, 3];
                    if (!(lesson[i].lessonNumber % 8 === 0 || (lesson[i].lessonNumber + 1) % 8 === 0)) return [3 /*break*/, 3];
                    text = "\u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435 #\u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u043C, \u0432 \u044D\u0442\u0443 \u0441\u0443\u0431\u0431\u043E\u0442\u0443 (" + date + ") \u0443 \u0432\u0430\u0441 \u0441\u043E\u0441\u0442\u043E\u0438\u0442\u0441\u044F \u041A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u0430\u044F \u043D\u043E\u043C\u0435\u0440 #" + lesson[i].examNumber + " c 11:00 \u0434\u043E 19:00, \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u0432\u0441\u0435 \u0442\u0435\u043C\u044B \u044D\u0442\u043E\u0433\u043E \u043C\u0435\u0441\u044F\u0446\u0430";
                    return [4 /*yield*/, bot.sendMessage(lesson[i].chatId, text)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Функция для напоминания об оплате, отрабатывает после первого первого занятия после контрольной
 * И для сообщения о дедлайне оплвты, отрабатывает в пятницу следующей недели после контрольной, не отрабатывает во время каникул
 */
function buildPaymentNotificationMessage(lesson, date) {
    return __awaiter(this, void 0, void 0, function () {
        var months, todayDate, i, holiday, text, text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    months = ["noFirstMonth", "второй", "третий", "четвертый", "пятый", "шестой", "седьмой", "восьмой", "девятый", "десятый", "одиннадцатый", "двенадцатый", "тринадцатый", "четырнадцатый", "пятнадцатый"];
                    todayDate = moment_1.default().format("DD-MM-YYYY");
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < lesson.length)) return [3 /*break*/, 6];
                    holiday = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo);
                    if (holiday)
                        return [3 /*break*/, 5];
                    if (!(todayDate === date && (lesson[i].lessonNumber % 8 === 2 || lesson[i].lessonNumber % 8 === 3) && lesson[i].lessonNumber > 8)) return [3 /*break*/, 3];
                    text = "\u0412\u0441\u0435\u043C \u043F\u0440\u0438\u0432\u0435\u0442, #\u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u043C \u043E\u0431 \u043E\u043F\u043B\u0430\u0442\u0435 \u0437\u0430 " + months[lesson[i].examNumber - 1] + " \u0443\u0447\u0435\u0431\u043D\u044B\u0439 \u043C\u0435\u0441\u044F\u0446. \u0421\u0435\u0433\u043E\u0434\u043D\u044F - " + date + ", \u043A\u0440\u0430\u0439\u043D\u0438\u0439 \u0434\u0435\u043D\u044C \u0432\u043D\u0435\u0441\u0435\u043D\u0438\u044F  \u043E\u043F\u043B\u0430\u0442\u044B.";
                    return [4 /*yield*/, bot.sendMessage(lesson[i].chatId, text)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    if (!(lesson[i].lessonNumber % 8 === 1 && lesson[i].lessonNumber > 8)) return [3 /*break*/, 5];
                    text = "\u0412\u0441\u0435\u043C \u043F\u0440\u0438\u0432\u0435\u0442, \u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u043C \u043E\u0431 \u043E\u043F\u043B\u0430\u0442\u0435 \u0437\u0430 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u043C\u0435\u0441\u044F\u0446, \u0434\u0435\u0434\u043B\u0430\u0439\u043D \u0434\u043E \u043F\u044F\u0442\u043D\u0438\u0446\u044B (" + date + ")";
                    return [4 /*yield*/, bot.sendMessage(lesson[i].chatId, text)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Функция для проверки идут ли каникулы или нет, пропускает оповещения, счетчики занятий не растут. Возвращает булевое значение, и каждый раз перед отправкой
 * сообщения мы проверяем каникулы ли или нет.
 * Важно помнить, что если не поставить эту проверку в оповещение об оплате, то есть риск, что во время каникул людей будут дергать сообщениями об оплате
 */
function isHoliday(dateOne, dateTwo) {
    var checkDateOne = moment_1.default(dateOne, "DD-MM-YYYY");
    var checkDateTwo = moment_1.default(dateTwo, "DD-MM-YYYY");
    for (var i = 0; i < 7; i++) {
        if (checkDateOne.add(i, "days").format("DD-MM-YYYY") === moment_1.default().format("DD-MM-YYYY") ||
            checkDateTwo.add(i, "days").format("DD-MM-YYYY") === moment_1.default().format("DD-MM-YYYY")) {
            return true;
        }
    }
    return false;
}
