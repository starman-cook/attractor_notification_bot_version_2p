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
 *   DONE********** Добавить возможность смены номера занятния и экзамена без удаления текущих данных, так, для быстрой коррекции на всякий случай
 *
 *
 *

 2.1 DONE********** Каникул (Убрать время у ввести даты) *****
 2.2

 2.5 DONE********** Исключить уведомления о вебинарах следующих после контрольной работы *****

 2.6

 Потестить добавление и удаление пользователей, чтобы бот не падал ****

 2.8 DONE********** добавить к уведомлениям номер вебинара *****

 5. Пофиксить проблему разлета времени для зоны +6 ****** (Это когда на сервер его выгрузим)


 8. Создать функционал логирования ошибок работы бота
 9. Реализовать функционал отправки логов ошибок по расписанию *****


Добавить команду выгрузки данных всех групп, со всеми их данными, когда учатся, какое занятие идет у них, какая контрольная и когда следующая
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
 * Здесь мы получаем сегодняшнюю дату в нужном формате, плюс создаем переменные для остлеживания даты субботы и пятницы (для контрольной и дедлайна оплаты)
 * Затем проверяем каждый день недели для отправки необходимых сообщений подходящим по параметрам группам
 */
var date = moment_1.default().format("DD-MM-YYYY");
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
                dateOfNextSaturday = moment_1.default().add(3, "days").format("DD-MM-YYYY");
                return [4 /*yield*/, buildExamMessageBeforeActualDate(lesson, dateOfNextSaturday)];
            case 3:
                _a.sent();
                return [4 /*yield*/, buildTheMessageWithConditions(lesson, "3")];
            case 4:
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
                dateOfNextSaturday = moment_1.default().add(2, "days").format("DD-MM-YYYY");
                return [4 /*yield*/, buildExamMessageBeforeActualDate(lesson, dateOfNextSaturday)];
            case 2:
                _a.sent();
                return [4 /*yield*/, buildTheMessageWithConditions(lesson, "4")];
            case 3:
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
                dateOfNextSaturday = moment_1.default().add(1, "days").format("DD-MM-YYYY");
                return [4 /*yield*/, buildExamMessageBeforeActualDate(lesson, dateOfNextSaturday)];
            case 3:
                _a.sent();
                return [4 /*yield*/, buildTheMessageWithConditions(lesson, "5")];
            case 4:
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
    var admins, admin, i, ii, oldLesson, lesson, err_1, funnyResponse;
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
                if (!admin) return [3 /*break*/, 9];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 6, , 8]);
                ii = arr[1].replace(/\s+/g, ' ').trim().split(" ");
                return [4 /*yield*/, lesson_model_1.Lesson.findOne({ chatId: msg.chat.id })];
            case 3:
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
            case 4:
                lesson = _a.sent();
                lesson.dateOfLastLesson = moment_1.default().toISOString();
                lesson.save();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Регистрация прошла успешно, ваше сообщение будет удалено автоматически через 20 секунд")];
            case 5:
                _a.sent();
                setTimeout(function () {
                    bot.deleteMessage(msg.chat.id, msg.message_id.toString());
                }, 20000);
                return [3 /*break*/, 8];
            case 6:
                err_1 = _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Неверный ввод")];
            case 7:
                _a.sent();
                return [3 /*break*/, 8];
            case 8: return [3 /*break*/, 11];
            case 9:
                funnyResponse = "\n        <b>\u041A\u0430\u0442\u0430\u043D\u044B \u0437\u0432\u0443\u043A\u0438</b>\n        <b>\u0441\u0430\u043C\u0443\u0440\u0430\u0439 \u043F\u0440\u043E\u043C\u0430\u0445\u043D\u0443\u043B\u0441\u044F</b>\n        <b>\u0441\u044D\u043F\u043F\u0443\u043A\u0443 \u0432\u044B\u0445\u043E\u0434</b>\n        ";
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, funnyResponse, {
                        parse_mode: "HTML"
                    })];
            case 10:
                _a.sent();
                _a.label = 11;
            case 11: return [2 /*return*/];
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
                funnyResponse = "\n        <b>\u041F\u0440\u0430\u0432\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435</b>\n        <b>\u0441\u0451\u0433\u0443\u043D\u0430\u0442\u0443 \u0434\u0430\u043D\u043E \u043B\u0438\u0448\u044C</b>\n        <b>\u0441\u0442\u0443\u043F\u0430\u0439 \u0447\u0435\u043B\u043E\u0432\u0435\u043A</b>\n        ";
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
 * Получение инструкций, команда скрыта, нужно писать ее через / без единой ошибки, если студенты получат к ней доступ, то могут сломать бота
 */
bot.onText(/\/givemetheinstructionsplease/, function (msg, arr) { return __awaiter(void 0, void 0, void 0, function () {
    var admins, admin, i, text, err_3, funnyResponse;
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
                if (!admin) return [3 /*break*/, 7];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 6]);
                text = " \n        <b>\u041F\u0440\u0438\u0432\u0435\u0442 \u0434\u043E\u0440\u043E\u0433\u043E\u0439 \u0441\u043E\u0437\u0434\u0430\u0442\u0435\u043B\u044C \u0433\u0440\u0443\u043F\u043F\u044B!</b>\n\n        \n        <pre>\u042D\u0442\u043E \u0438\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F \u043F\u043E \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044E \u0433\u0440\u0443\u043F\u043F\u044B \u0434\u043B\u044F \u043E\u043F\u043E\u0432\u0435\u0449\u0435\u043D\u0438\u044F \u0441\u0442\u0443\u0434\u0435\u043D\u0442\u043E\u0432 \u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F\u0445, \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u044B\u0445, \u043E\u043F\u043B\u0430\u0442\u0430\u0445 \u0438 \u043A\u0430\u043D\u0438\u043A\u0443\u043B\u0430\u0445</pre>\n        <pre>\u0412\u0441\u0435 \u0447\u0442\u043E \u043D\u0443\u0436\u043D\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u044D\u0442\u043E \u0432\u0432\u0435\u0441\u0442\u0438 <b>/build_</b> \u0437\u0430\u0442\u0435\u043C \u043D\u0435 \u0441\u0442\u0430\u0432\u044F \u043F\u0440\u043E\u0431\u0435\u043B \u0432\u0432\u0435\u0441\u0442\u0438 \u043F\u0435\u0440\u0432\u044B\u0439 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440, \u0438 \u0437\u0430\u0442\u0435\u043C \u0443\u0436\u0435 \u0447\u0435\u0440\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B\u044B \u0432\u0441\u0435 \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u043F\u0430\u0440\u043C\u0430\u0435\u0442\u0440\u044B.</pre>\n        <pre>\u0412\u0441\u0435\u0433\u043E \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u043E\u0432 9 \u0448\u0442\u0443\u043A. \u041D\u043E \u043D\u0435 \u043F\u0443\u0433\u0430\u0439\u0442\u0435\u0441\u044C, \u0432\u044B \u0432\u0441\u0435\u0433\u0434\u0430 \u043C\u043E\u0436\u0435\u0442\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 \u0432\u0430\u0448\u0435\u0439 \u0433\u0440\u0443\u043F\u043F\u044B \u0438 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u0435\u0435; \u0442\u043E \u0435\u0441\u0442\u044C \u043F\u0440\u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0435\u043D\u0438\u0438 \u043A\u043E\u043C\u0430\u043D\u0434\u044B <b>/build_</b> \u0441\u043E \u0432\u0441\u0435\u043C\u0438 \u043F\u0430\u0440\u043C\u0435\u0442\u0440\u0430\u043C\u0438 \u0443\u0434\u0430\u043B\u0438\u0442 \u0441\u0442\u0430\u0440\u0443\u044E \u0437\u0430\u043F\u0438\u0441\u044C \u0438 \u0441\u043E\u0437\u0434\u0430\u0441\u0442 \u043D\u043E\u0432\u0443\u044E</pre>\n        \n        <b>\u041A\u0430\u043A\u0438\u0435 \u0435\u0441\u0442\u044C \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B:</b>\n        \n        <b>\u0418\u043C\u044F \u0433\u0440\u0443\u043F\u043F\u044B:</b><pre>\u041F\u0438\u0448\u0438\u0442\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0431\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B\u043E\u0432 \u0432 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0438</pre>\n        <b>\u0414\u0435\u043D\u044C \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u043D\u043E\u043C\u0435\u0440 1:</b><pre>\u041F\u0438\u0448\u0438\u0442\u0435 \u0447\u0438\u0441\u043B\u043E\u043C 1 \u044D\u0442\u043E \u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A, 2 \u0432\u0442\u043E\u0440\u043D\u0438\u043A</pre>\n        <b>\u0414\u0435\u043D\u044C \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u043D\u043E\u043C\u0435\u0440 2:</b><pre>\u0422\u0430\u043A\u0436\u0435 \u0447\u0438\u0441\u043B\u043E\u043C 4 \u044D\u0442\u043E \u0447\u0435\u0442\u0432\u0435\u0440\u0433, 5 \u043F\u044F\u0442\u043D\u0438\u0446\u0430</pre>\n        <b>\u0414\u0435\u043D\u044C \u0432\u0435\u0431\u0438\u043D\u0430\u0440\u0430 \u043D\u043E\u043C\u0435\u0440 1:</b><pre>\u0415\u0441\u043B\u0438 \u0435\u0441\u0442\u044C \u0432\u0435\u0431\u0438\u043D\u0430\u0440\u044B \u043F\u043E \u0432\u0442\u043E\u0440\u043D\u0438\u043A\u0430\u043C, \u0442\u043E \u0441\u0442\u0430\u0432\u0438\u043C 2, \u043F\u043E \u0441\u0440\u0435\u0434\u0430\u043C 3, \u0438\u043D\u0430\u0447\u0435 \u043F\u0438\u0448\u0435\u043C null</pre>\n        <b>\u0414\u0435\u043D\u044C \u0432\u0435\u0431\u0438\u043D\u0430\u0440\u0430 \u043D\u043E\u043C\u0435\u0440 2:</b><pre>\u0415\u0441\u043B\u0438 \u0435\u0441\u0442\u044C \u0432\u0435\u0431\u0438\u043D\u0430\u0440\u044B \u043F\u043E \u043F\u044F\u0442\u043D\u0438\u0446\u0430\u043C, \u0442\u043E \u0441\u0442\u0430\u0432\u0438\u043C 5, \u0438\u043D\u0430\u0447\u0435 \u043F\u0438\u0448\u0435\u043C null</pre>\n        <b>\u0412\u0440\u0435\u043C\u044F \u0437\u0430\u043D\u044F\u0442\u0438\u0439:</b><pre>\u0435\u0441\u0442\u044C \u0434\u0432\u0430 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430 \u043B\u0438\u0431\u043E evening \u043B\u0438\u0431\u043E lunch, \u0432\u0435\u0447\u0435\u0440\u043D\u044F\u044F \u0438 \u0434\u043D\u0435\u0432\u043D\u0430\u044F \u0433\u0440\u0443\u043F\u043F\u044B \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0432\u0435\u043D\u043D\u043E</pre>\n        <b>\u0414\u0430\u0442\u0430 \u043F\u0435\u0440\u0432\u044B\u0445 \u043A\u0430\u043D\u0438\u043A\u0443\u043B:</b><pre>\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0434\u0430\u0442\u0443 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 dd-mm-yyyy (\u043E\u0442 \u044D\u0442\u043E\u0439 \u0434\u0430\u0442\u044B \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F \u043D\u0435\u0434\u0435\u043B\u044F \u043A\u0430\u043D\u0438\u043A\u0443\u043B)</pre>\n        <b>\u0414\u0430\u0442\u0430 \u0432\u0442\u043E\u0440\u044B\u0445 \u043A\u0430\u043D\u0438\u043A\u0443\u043B:</b><pre>\u0422\u0430\u043A\u0436\u0435 \u0443\u043A\u0430\u0436\u0438\u0442\u0435 \u0434\u0430\u0442\u0443 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 dd-mm-yyyy</pre>\n        <b>\u041D\u043E\u043C\u0435\u0440 \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F:</b><pre>\u041F\u0440\u043E\u0441\u0442\u043E \u043D\u043E\u043C\u0435\u0440 \u0443\u043A\u0430\u0436\u0438\u0442\u0435 \u0447\u0438\u0441\u043B\u043E\u043C</pre>\n        <b>\u041D\u043E\u043C\u0435\u0440 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u043E\u0439:</b><pre>\u0422\u0430\u043A\u0436\u0435 \u043F\u0440\u043E\u0441\u0442\u043E \u043D\u043E\u043C\u0435\u0440 \u0447\u0438\u0441\u043B\u043E\u043C \u0443\u043A\u0430\u0436\u0438\u0442\u0435</pre>\n        \n        <b>\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 \u043C\u044B \u0441\u043E\u0437\u0434\u0430\u0435\u043C \u0433\u0440\u0443\u043F\u043F\u0443 JS-5 \u0441 \u0437\u0430\u043D\u044F\u0442\u0438\u044F\u043C\u0438 \u043F\u043E \u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A\u0430\u043C \u0438 \u0447\u0435\u0442\u0432\u0435\u0440\u0433\u0430\u043C, \u0432\u0435\u0431\u0438\u043D\u0430\u0440\u0430\u043C\u0438 \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E \u0441\u0440\u0435\u0434\u0430\u043C, \u0443\u0447\u0435\u0431\u043E\u0439 \u0432 \u0434\u043D\u0435\u0432\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F, \u043A\u0430\u043D\u0438\u043A\u0443\u043B\u0430\u043C\u0438 \u043D\u0430 \u043D\u043E\u0432\u044B\u0439 \u0433\u043E\u0434 \u0438 \u043D\u0435\u0434\u0435\u043B\u0435\u0439 \u0432 \u0430\u0432\u0433\u0443\u0441\u0442\u0435 (15 \u0447\u0438\u0441\u043B\u0430), \u0441 \u0441\u0430\u043C\u044B\u043C \u043F\u0435\u0440\u0432\u044B\u043C \u0437\u0430\u043D\u044F\u0442\u0438\u0435\u043C \u0438 \u043F\u0435\u0440\u0432\u043E\u0439 \u043F\u0440\u0435\u0434\u0441\u0442\u043E\u044F\u0449\u0435\u0439 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u043E\u0439:</b>\n        <pre>/build_JS-5 1 4 3 null lunch 27-12-2020 15-08-2021 1 1</pre>\n        \n        <pre>\u0413\u043E\u0442\u043E\u0432\u043E))</pre>\n        \n        <b>PS:</b>\n        \n        <pre>\u0412\u044B \u0442\u0430\u043A\u0436\u0435 \u043C\u043E\u0436\u0435\u0442\u0435 \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043D\u043E\u043C\u0435\u0440 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u0438\u043B\u0438 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u043E\u0439, \u0432\u0432\u043E\u0434\u0438\u0442\u0435 \u043A\u043E\u043C\u0430\u043D\u0434\u0443 /setup_ \u0438 \u0437\u0430\u0442\u0435\u043C exam \u0438\u043B\u0438 lesson \u0438 \u0447\u0435\u0440\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B \u043D\u0430 \u043A\u0430\u043A\u043E\u0439 \u043D\u043E\u043C\u0435\u0440 \u0432\u044B \u0445\u043E\u0442\u0438\u0442\u0435 \u043F\u043E\u043C\u0435\u043D\u044F\u0442\u044C.</pre>\n        <pre>\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, /setup_lesson 83 \u043C\u044B \u043C\u0435\u043D\u044F\u0435\u043C \u043D\u043E\u043C\u0435\u0440 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u043D\u0430 83, \u0438\u043B\u0438 /setup_exam 9 \u043C\u044B \u0441\u0442\u0430\u0432\u0438\u043C \u043D\u043E\u043C\u0435\u0440 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u043E\u0439 9</pre>\n";
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, text, {
                        parse_mode: "HTML"
                    })];
            case 3:
                _a.sent();
                return [3 /*break*/, 6];
            case 4:
                err_3 = _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Что то рухнуло и сломалось")];
            case 5:
                _a.sent();
                return [3 /*break*/, 6];
            case 6: return [3 /*break*/, 9];
            case 7:
                funnyResponse = "\n        <b>\u0423\u0437\u0440\u0435\u0442\u044C \u0436\u0435\u043B\u0430\u0435\u0448\u044C</b>\n        <b>\u0438\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044E \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B</b>\n        <b>\u043F\u0443\u0441\u0442\u043E\u0442\u0430 \u043A\u0440\u0443\u0433\u043E\u043C</b>\n        ";
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, funnyResponse, {
                        parse_mode: "HTML"
                    })];
            case 8:
                _a.sent();
                _a.label = 9;
            case 9: return [2 /*return*/];
        }
    });
}); });
/**
 * Данная функция доступна всем (возможно добавим ее через BotFather в видимые команды), сообщение показывает данные по группе, текущему занятию, датой следующей контрольной
 * Сообщение автоматически удаляется спустя некоторое время
 */
bot.onText(/\/show/, function (msg, arr) { return __awaiter(void 0, void 0, void 0, function () {
    var lesson, dif_1, arrWithRestDays, result_1, text, send_1, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 5]);
                return [4 /*yield*/, lesson_model_1.Lesson.findOne({ chatId: msg.chat.id })];
            case 1:
                lesson = _a.sent();
                dif_1 = lesson.lessonNumber % 8;
                arrWithRestDays = [{ key: 1, value: 26 }, { key: 2, value: 23 }, { key: 3, value: 19 }, { key: 4, value: 16 }, { key: 5, value: 12 }, { key: 6, value: 9 }, { key: 7, value: 5 }, { key: 0, value: 2 }];
                result_1 = 0;
                arrWithRestDays.map(function (el) {
                    if (el.key === dif_1) {
                        result_1 = el.value;
                        return null;
                    }
                });
                if (lesson.lessonDayOne === "2")
                    result_1 -= 1;
                dateOfNextSaturday = moment_1.default(lesson.dateOfLastLesson).add(result_1, "days").format("DD-MM-YYYY");
                text = "\n\n<strong>--------------------------------------</strong>\n\n\n<strong>\u0414\u0430\u043D\u043D\u044B\u0435 \u043F\u043E \u0432\u0430\u0448\u0435\u0439 \u0433\u0440\u0443\u043F\u043F\u0435</strong>\n        \n        \n<b>\u0412\u0430\u0448\u0430 \u0433\u0440\u0443\u043F\u043F\u0430 </b><pre>" + lesson.groupName + "</pre>\n\n<b>\u0412\u044B \u0443\u0447\u0438\u0442\u0435\u0441\u044C \u043F\u043E </b><pre>" + (lesson.lessonDayOne === "1" ? "понедельникам" : lesson.lessonDayOne === "2" ? "вторникам" : "хрен знает каким дням") + " \u0438 " + (lesson.lessonDayTwo === "4" ? "четвергам" : lesson.lessonDayTwo === "5" ? "пятницам" : "хрен знает каким дням") + "</pre>\n\n<b>\u041F\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0438 c </b><pre>" + (lesson.time === "evening" ? "19:30 до 21:30" : lesson.time === "lunch" ? "16:00 до 18:00" : "хрен знает сколькт до не знаю скольки") + "</pre>\n\n<b>\u0412\u0435\u0431\u0438\u043D\u0430\u0440\u044B \u043F\u043E </b><pre>" + (lesson.webinarOne === "3" ? "средам в 19:30" : lesson.webinarOne === "5" ? "пятницам в 19:30" : lesson.webinarOne === "2" ? "вторникам в 19:30" : "") + "  " + (lesson.webinarTwo === "5" ? "и по пятницам в 19:30" : "") + "</pre>\n\n<b>\u043D\u043E\u043C\u0435\u0440 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F </b><pre>#" + lesson.lessonNumber + "</pre>\n\n<b>\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u0430\u044F </b><pre>#" + lesson.examNumber + " \u0431\u0443\u0434\u0435\u0442 \u0432 \u0441\u0443\u0431\u0431\u043E\u0442\u0443 " + dateOfNextSaturday + "</pre>     \n\n<b>\u041F\u0435\u0440\u0432\u044B\u0435 \u043A\u0430\u043D\u0438\u043A\u0443\u043B\u044B</b><pre>#" + lesson.holidayOne + "</pre> \n     \n<b>\u0412\u0442\u043E\u0440\u044B\u0435 \u043A\u0430\u043D\u0438\u043A\u0443\u043B\u044B</b><pre>#" + lesson.holidayTwo + "</pre> \n     \n<strong>--------------------------------------</strong>\n \n";
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, text, {
                        parse_mode: "HTML"
                    })];
            case 2:
                send_1 = _a.sent();
                setTimeout(function () {
                    bot.deleteMessage(msg.chat.id, msg.message_id.toString());
                    bot.deleteMessage(msg.chat.id, send_1.message_id.toString());
                }, 30000); // 30 секунд до удаления сообщения
                return [3 /*break*/, 5];
            case 3:
                err_4 = _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Что то рухнуло и сломалось")];
            case 4:
                _a.sent();
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Функции для составления необходимых сообщений
 */
/**
 * Функция для составления базового сообщения, как о контрольной (но есть и другие сообщения о контрольной), так и о занятиях
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
/**
 * Функция для определения какое именно будет сообщение, идет проверка на день недели и вечернюю или дневную группу
 */
function buildTheMessageWithConditions(lesson, day) {
    return __awaiter(this, void 0, void 0, function () {
        var i, holiday;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
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
                    lesson[i].dateOfLastLesson = moment_1.default().toISOString();
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
        var i, holiday, fakeNumber;
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
                    if (!(lesson[i].webinarOne === day || lesson[i].webinarTwo === day)) return [3 /*break*/, 3];
                    if ((lesson[i].webinarOne === "3" || lesson[i].webinarOne === "2") && lesson[i].lessonNumber % 8 === 1) {
                        return [3 /*break*/, 3];
                    }
                    fakeNumber = (lesson[i].lessonNumber - 1) + "";
                    return [4 /*yield*/, buildTheMessage(lesson[i].chatId, "Вебинар", fakeNumber, "19:30", date, "\u041F\u0438\u0448\u0438\u0442\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B \u0441 \u0445\u044D\u0448\u0442\u044D\u0433\u043E\u043C #\u041D\u0430\u0432\u0435\u0431\u0438\u043D\u0430\u0440" + fakeNumber)];
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
//9 1
/**
 * Функция для сообщения о контролльной в день контрольной
 */
function buildExamMessage(lesson) {
    return __awaiter(this, void 0, void 0, function () {
        var i, holiday;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < lesson.length)) return [3 /*break*/, 5];
                    holiday = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo);
                    if (holiday)
                        return [3 /*break*/, 4];
                    if (!((lesson[i].lessonNumber - 1) % 8 === 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, buildTheMessage(lesson[i].chatId, "Контрольная", lesson[i].examNumber + "", "11:00", date, "\u0433\u043E\u0442\u043E\u0432\u044C\u0442\u0435 \u0442\u0440\u0435\u043A\u043A\u0435\u0440 \u0435\u0441\u043B\u0438 \u0432\u044B \u0441\u0434\u0430\u0435\u0442\u0435 \u043E\u043D\u043B\u0430\u0439\u043D, \u0432\u043A\u043B\u044E\u0447\u0430\u0439\u0442\u0435 \u0437\u0443\u043C, \u043F\u0440\u0438\u0433\u043E\u0442\u043E\u0432\u044C\u0442\u0435 \u0440\u0443\u0447\u043A\u0443 \u0438 \u0431\u0443\u043C\u0430\u0433\u0443, \u043B\u0438\u0448\u043D\u0438\u043C\u0438 \u043D\u0435 \u0431\u0443\u0434\u0443\u0442))")];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    lesson[i].examNumber += 1;
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
 */
function buildPaymentNotificationMessage(lesson, date) {
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
                    if (!(lesson[i].lessonNumber % 8 === 1)) return [3 /*break*/, 3];
                    text = "\u0412\u0441\u0435\u043C \u043F\u0440\u0438\u0432\u0435\u0442, \u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u043C \u043E\u0431 \u043E\u043F\u043B\u0430\u0442\u0435 \u0437\u0430 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u043C\u0435\u0441\u044F\u0446, \u0434\u0435\u0434\u043B\u0430\u0439\u043D \u0434\u043E \u043F\u044F\u0442\u043D\u0438\u0446\u044B (" + date + ")";
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
