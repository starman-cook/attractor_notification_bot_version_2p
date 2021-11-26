"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var group_model_1 = require("./app/models/group_model");
var admin_message_model_1 = require("./app/models/admin_message_model");
var node_schedule_1 = __importDefault(require("node-schedule"));
var moment_1 = __importDefault(require("moment"));
var tslog_1 = require("tslog");
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
var lodash_1 = __importDefault(require("lodash"));
moment_1.default.updateLocale("en", { week: {
        dow: 1, // First day of week is Monday
    } });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Запись логгов в файлы, файлы записывыются в папки по датам, название папки идет как дата в формате DD_MM_YYYY
 * @param logObject
 */
function logToTransport(logObject) {
    var date = (0, moment_1.default)().format("DD_MM_YYYY");
    var dir = "./logs/".concat(date);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    else {
        fs.appendFileSync(path.join(__dirname, "/logs/".concat(date, "/logs.txt")), JSON.stringify(logObject) + "\n");
    }
}
var logger = new tslog_1.Logger();
logger.attachTransport({
    silly: logToTransport,
    debug: logToTransport,
    trace: logToTransport,
    info: logToTransport,
    warn: logToTransport,
    error: logToTransport,
    fatal: logToTransport,
}, "silly");
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
    logger.info("Mongo connected");
})
    .catch(function (err) {
    console.log(err);
    logger.fatal("Mongoose connection failed. " + err);
});
/**
 * Подключение express
 */
var app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static('logs'));
app.listen(config_1.config.telegramPort, function () {
    console.log('connected to port ' + config_1.config.telegramPort);
    logger.info('Express started on port ' + config_1.config.telegramPort);
});
/**
 * Подключение телеграм бота
 */
// @ts-ignore
var bot = new node_telegram_bot_api_1.default(config_1.config.telegramToken, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});
if (bot) {
    logger.info("Bot started, token is " + config_1.config.telegramToken);
}
else {
    logger.fatal("Bot didn't start, something went wrong");
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Здесь мы получаем сегодняшнюю дату в нужном формате, плюс создаем переменные для остлеживания даты субботы и пятницы (для контрольной и дедлайна оплаты)
 * Затем проверяем каждый день недели для отправки необходимых сообщений подходящим по параметрам группам
 */
var dateOfNextSaturday;
var dateOnFriday;
// данная переменая используется в show и allgroups
var weekDays = ['понедельникам', 'вторникам', 'средам', 'четвергам', 'пятницам', 'субботам', 'воскресеньям',];
var buildMainWeekSchedulers = function () {
    /**
     * Понедельник
     */
    node_schedule_1.default.scheduleJob("0 0 13 * * 1", function () { return __awaiter(void 0, void 0, void 0, function () {
        var groups;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info("Monday 13:00 start");
                    console.log("I AM MONDAY");
                    return [4 /*yield*/, group_model_1.Group.find()];
                case 1:
                    groups = _a.sent();
                    dateOnFriday = (0, moment_1.default)().add(4, "days").format("DD-MM-YYYY");
                    dateOfNextSaturday = (0, moment_1.default)().add(5, "days").format("DD-MM-YYYY");
                    return [4 /*yield*/, buildLessonMessage(groups, 1)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, buildWebinarMessage(groups, 1)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, buildComingExamMessage(groups, dateOfNextSaturday)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, buildPaySoonMessage(groups, dateOnFriday)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, buildVacationSoonMessage(groups)];
                case 6:
                    _a.sent();
                    logger.info("Monday 13:00 end");
                    return [2 /*return*/];
            }
        });
    }); });
    // Здесь идет прибавление недель, в самом начале понедельника, в 00:00 00минут 01 секунд и проверка на каникулы, если каникулы, то группа деактивируется и все
    node_schedule_1.default.scheduleJob("0 0 0 * * 1", function () { return __awaiter(void 0, void 0, void 0, function () {
        var groups, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info("Monday 00:00 start");
                    return [4 /*yield*/, group_model_1.Group.find()];
                case 1:
                    groups = _a.sent();
                    return [4 /*yield*/, incrementWeek(groups)];
                case 2:
                    _a.sent();
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < groups.length)) return [3 /*break*/, 6];
                    return [4 /*yield*/, isHoliday(groups[i])];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6:
                    logger.info("Monday 00:00 end");
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Вторник
     */
    node_schedule_1.default.scheduleJob("0 0 13 * * 2", function () { return __awaiter(void 0, void 0, void 0, function () {
        var groups;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info("Tuesday 13:00 start");
                    return [4 /*yield*/, group_model_1.Group.find()];
                case 1:
                    groups = _a.sent();
                    dateOnFriday = (0, moment_1.default)().add(3, "days").format("DD-MM-YYYY");
                    dateOfNextSaturday = (0, moment_1.default)().add(4, "days").format("DD-MM-YYYY");
                    return [4 /*yield*/, buildLessonMessage(groups, 2)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, buildWebinarMessage(groups, 2)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, buildComingExamMessage(groups, dateOfNextSaturday)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, buildPaySoonMessage(groups, dateOnFriday)];
                case 5:
                    _a.sent();
                    logger.info("Tuesday 13:00 end");
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Среда
     */
    node_schedule_1.default.scheduleJob("0 0 13 * * 3", function () { return __awaiter(void 0, void 0, void 0, function () {
        var groups;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info("Wednesday 13:00 start");
                    return [4 /*yield*/, group_model_1.Group.find()];
                case 1:
                    groups = _a.sent();
                    dateOnFriday = (0, moment_1.default)().add(2, "days").format("DD-MM-YYYY");
                    dateOfNextSaturday = (0, moment_1.default)().add(3, "days").format("DD-MM-YYYY");
                    return [4 /*yield*/, buildLessonMessage(groups, 3)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, buildWebinarMessage(groups, 3)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, buildComingExamMessage(groups, dateOfNextSaturday)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, buildPaySoonMessage(groups, dateOnFriday)];
                case 5:
                    _a.sent();
                    logger.info("Wednesday 13:00 end");
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Четверг
     */
    node_schedule_1.default.scheduleJob("0 0 13 * * 4", function () { return __awaiter(void 0, void 0, void 0, function () {
        var groups;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info("Thursday 13:00 start");
                    return [4 /*yield*/, group_model_1.Group.find()];
                case 1:
                    groups = _a.sent();
                    dateOnFriday = (0, moment_1.default)().add(1, "days").format("DD-MM-YYYY");
                    dateOfNextSaturday = (0, moment_1.default)().add(2, "days").format("DD-MM-YYYY");
                    return [4 /*yield*/, buildLessonMessage(groups, 4)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, buildWebinarMessage(groups, 4)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, buildComingExamMessage(groups, dateOfNextSaturday)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, buildPaySoonMessage(groups, dateOnFriday)];
                case 5:
                    _a.sent();
                    logger.info("Thursday 13:00 end");
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Пятница
     */
    node_schedule_1.default.scheduleJob("0 0 13 * * 5", function () { return __awaiter(void 0, void 0, void 0, function () {
        var groups;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info("Friday 13:00 start");
                    return [4 /*yield*/, group_model_1.Group.find()];
                case 1:
                    groups = _a.sent();
                    dateOfNextSaturday = (0, moment_1.default)().add(1, "days").format("DD-MM-YYYY");
                    return [4 /*yield*/, buildLessonMessage(groups, 5)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, buildWebinarMessage(groups, 5)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, buildComingExamMessage(groups, dateOfNextSaturday)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, buildPayTodayMessage(groups)];
                case 5:
                    _a.sent();
                    logger.info("Friday 13:00 end");
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Суббота
     */
    node_schedule_1.default.scheduleJob("0 0 10 * * 6", function () { return __awaiter(void 0, void 0, void 0, function () {
        var groups;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info("Saturday 13:00 start");
                    return [4 /*yield*/, group_model_1.Group.find()];
                case 1:
                    groups = _a.sent();
                    return [4 /*yield*/, buildLessonMessage(groups, 6)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, buildWebinarMessage(groups, 6)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, buildTodayExamMessage(groups)];
                case 4:
                    _a.sent();
                    logger.info("Saturday 13:00 end");
                    return [2 /*return*/];
            }
        });
    }); });
};
buildMainWeekSchedulers();
node_schedule_1.default.scheduleJob("0 1 0 * * 1", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger.info("Monday RELAUNCHSCHEDULERS 13:00 start");
                return [4 /*yield*/, relaunchSchedulers()];
            case 1:
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
    var userObj, user, admins, admin, i, oldGroup, ii, lessons, i, webinars, i, holidays, holidayWeeksNumbers, i, currentMonday, momentDateHoliday, j, group, send_1, err_1, funnyResponse, send_2;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                logger.info("Start of /build_ command to create new group");
                return [4 /*yield*/, bot.getChatMember(msg.chat.id, msg.from.id.toString())];
            case 1:
                userObj = _c.sent();
                user = userObj.user.username;
                return [4 /*yield*/, isBotAdmin(msg)];
            case 2:
                if (!_c.sent()) return [3 /*break*/, 15];
                return [4 /*yield*/, bot.getChatAdministrators(msg.chat.id)];
            case 3:
                admins = _c.sent();
                admin = false;
                for (i = 0; i < admins.length; i++) {
                    if (admins[i].user.id === msg.from.id) {
                        admin = true;
                    }
                }
                if (!admin) return [3 /*break*/, 12];
                _c.label = 4;
            case 4:
                _c.trys.push([4, 9, , 11]);
                logger.info("User " + user + " is using /build_ command");
                return [4 /*yield*/, group_model_1.Group.findOne({ chatId: msg.chat.id })];
            case 5:
                oldGroup = _c.sent();
                if (oldGroup) {
                    oldGroup.delete();
                }
                ii = arr[1].replace(/\s+/g, ' ').trim().split(" ");
                lessons = ii[1].split('/');
                for (i = 0; i < lessons.length; i++) {
                    lessons[i] = (_a = {}, _a[lessons[i].split("-")[0]] = lessons[i].split("-")[1], _a);
                }
                webinars = ii[2].split('/');
                for (i = 0; i < webinars.length; i++) {
                    webinars[i] = (_b = {}, _b[webinars[i].split("-")[0]] = webinars[i].split("-")[1], _b);
                }
                holidays = ii[3].split('/');
                holidayWeeksNumbers = [];
                for (i = 0; i < holidays.length; i++) {
                    currentMonday = (0, moment_1.default)().startOf('isoweek');
                    momentDateHoliday = buildMomentDate(holidays[i]);
                    for (j = 1; j < 78; j++) {
                        if (currentMonday.add(7, "days").format("DD-MM-YYYY") === momentDateHoliday.format("DD-MM-YYYY")) {
                            holidayWeeksNumbers.push(j + parseInt(ii[4]));
                            break;
                        }
                    }
                }
                return [4 /*yield*/, new group_model_1.Group({
                        chatId: msg.chat.id,
                        groupName: ii[0],
                        currentWeek: ii[4] - 1,
                        lessons: lessons,
                        webinars: webinars,
                        holidays: holidays,
                        holidayWeeksNumbers: holidayWeeksNumbers
                    })];
            case 6:
                group = _c.sent();
                return [4 /*yield*/, group.save()];
            case 7:
                _c.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Регистрация прошла успешно, ваше сообщение будет удалено автоматически через 20 секунд")];
            case 8:
                send_1 = _c.sent();
                setTimeout(function () {
                    bot.deleteMessage(msg.chat.id, send_1.message_id.toString());
                    bot.deleteMessage(msg.chat.id, msg.message_id.toString());
                }, 20000);
                return [3 /*break*/, 11];
            case 9:
                err_1 = _c.sent();
                logger.fatal("Something crashed in /build_ command, last user was " + user);
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Неверный ввод")];
            case 10:
                _c.sent();
                return [3 /*break*/, 11];
            case 11: return [3 /*break*/, 14];
            case 12:
                logger.info("User " + user + " is not admin, and is trying to use /build_ command");
                funnyResponse = "\n<b>\u041A\u0430\u0442\u0430\u043D\u044B \u0437\u0432\u0443\u043A\u0438</b>\n<b>\u0421\u0430\u043C\u0443\u0440\u0430\u0439 \u043F\u0440\u043E\u043C\u0430\u0445\u043D\u0443\u043B\u0441\u044F</b>\n<b>\u0421\u044D\u043F\u043F\u0443\u043A\u0443 \u0432\u044B\u0445\u043E\u0434</b>\n        ";
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, funnyResponse, {
                        parse_mode: "HTML"
                    })];
            case 13:
                send_2 = _c.sent();
                setTimeout(function () {
                    bot.deleteMessage(msg.chat.id, msg.message_id.toString());
                    bot.deleteMessage(msg.chat.id, send_2.message_id.toString());
                }, 30000); // 30 секунд до удаления сообщения
                _c.label = 14;
            case 14: return [3 /*break*/, 17];
            case 15:
                logger.info("User " + user + " is trying to use /build, but bot is not admin");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Ничего я не создам, пока я не админ")];
            case 16:
                _c.sent();
                _c.label = 17;
            case 17: return [2 /*return*/];
        }
    });
}); });
/**
 * Внесение изменений в нумерацию тущей недели
 */
bot.onText(/\/setweek_(.+)/, function (msg, arr) { return __awaiter(void 0, void 0, void 0, function () {
    var userObj, user, admins, admin, i, group, holidays, holidayWeeksNumbers, i, currentMonday, momentDateHoliday, j, send_3, err_2, funnyResponse, send_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bot.getChatMember(msg.chat.id, msg.from.id.toString())];
            case 1:
                userObj = _a.sent();
                user = userObj.user.username;
                return [4 /*yield*/, isBotAdmin(msg)];
            case 2:
                if (!_a.sent()) return [3 /*break*/, 14];
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
                return [4 /*yield*/, group_model_1.Group.findOne({ chatId: msg.chat.id })];
            case 5:
                group = _a.sent();
                logger.info("User " + user + " is using /setweek to change week in group " + group.groupName);
                holidays = group.holidays;
                holidayWeeksNumbers = [];
                for (i = 0; i < holidays.length; i++) {
                    currentMonday = (0, moment_1.default)().startOf('isoweek');
                    momentDateHoliday = buildMomentDate(holidays[i]);
                    for (j = 1; j < 78; j++) {
                        if (currentMonday.add(7, "days").format("DD-MM-YYYY") === momentDateHoliday.format("DD-MM-YYYY")) {
                            holidayWeeksNumbers.push(j + parseInt(arr[1]));
                            break;
                        }
                    }
                }
                group.currentWeek = arr[1];
                group.holidayWeeksNumbers = holidayWeeksNumbers;
                return [4 /*yield*/, group.save()];
            case 6:
                _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "\u041D\u043E\u043C\u0435\u0440 \u0442\u0435\u043A\u0443\u0449\u0435\u0439 \u043D\u0435\u0434\u0435\u043B\u0438 \u0438\u0437\u043C\u0435\u043D\u0435\u043D \u043D\u0430 ".concat(arr[1], ", \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0443\u0434\u0430\u043B\u0438\u0442\u0441\u044F \u0447\u0435\u0440\u0435\u0437 10 \u0441\u0435\u043A\u0443\u043D\u0434"))];
            case 7:
                send_3 = _a.sent();
                setTimeout(function () {
                    bot.deleteMessage(msg.chat.id, send_3.message_id.toString());
                    bot.deleteMessage(msg.chat.id, msg.message_id.toString());
                }, 10000);
                return [3 /*break*/, 10];
            case 8:
                err_2 = _a.sent();
                logger.fatal("Something crashed in /setweek command, last user was " + user);
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Неверный ввод")];
            case 9:
                _a.sent();
                return [3 /*break*/, 10];
            case 10: return [3 /*break*/, 13];
            case 11:
                logger.info("User " + user + " is trying to use /setweek, but user is not admin");
                funnyResponse = "\n<b>\u041F\u0440\u0430\u0432\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435</b>\n<b>\u0421\u0451\u0433\u0443\u043D\u0430\u0442\u0443 \u0434\u0430\u043D\u043E \u043B\u0438\u0448\u044C</b>\n<b>\u0421\u0442\u0443\u043F\u0430\u0439 \u0447\u0435\u043B\u043E\u0432\u0435\u043A</b>\n        ";
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, funnyResponse, {
                        parse_mode: "HTML"
                    })];
            case 12:
                send_4 = _a.sent();
                setTimeout(function () {
                    bot.deleteMessage(msg.chat.id, msg.message_id.toString());
                    bot.deleteMessage(msg.chat.id, send_4.message_id.toString());
                }, 30000); // 30 секунд до удаления сообщения
                _a.label = 13;
            case 13: return [3 /*break*/, 16];
            case 14:
                logger.info("User " + user + " is trying to use /setweek, but bot is not admin");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Ничего я не поменяю, пока я не админ")];
            case 15:
                _a.sent();
                _a.label = 16;
            case 16: return [2 /*return*/];
        }
    });
}); });
/**
 * Установка имени администратора группы, желательно добавлять с номером контактов и телефона, чтобы было информативнее для студентов
 * Функция принимает все что написано после нижнего подчеркивания, можно написать что-угодно и это созранится в поле groupAdmin в группе
 */
bot.onText(/\/setadmin_(.+)/, function (msg, arr) { return __awaiter(void 0, void 0, void 0, function () {
    var userObj, user, admins, admin, i, group, send_5, err_3, funnyResponse, send_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bot.getChatMember(msg.chat.id, msg.from.id.toString())];
            case 1:
                userObj = _a.sent();
                user = userObj.user.username;
                return [4 /*yield*/, isBotAdmin(msg)];
            case 2:
                if (!_a.sent()) return [3 /*break*/, 14];
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
                return [4 /*yield*/, group_model_1.Group.findOne({ chatId: msg.chat.id })];
            case 5:
                group = _a.sent();
                group.groupAdmin = arr[1];
                return [4 /*yield*/, group.save()];
            case 6:
                _a.sent();
                logger.info("User " + user + " is using /setadmin to change admin in group " + group.groupName);
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "\u0410\u0434\u043C\u0438\u043D \u044D\u0442\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u044B ".concat(arr[1], ", \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0443\u0434\u0430\u043B\u0438\u0442\u0441\u044F \u0447\u0435\u0440\u0435\u0437 10 \u0441\u0435\u043A\u0443\u043D\u0434"))];
            case 7:
                send_5 = _a.sent();
                setTimeout(function () {
                    bot.deleteMessage(msg.chat.id, send_5.message_id.toString());
                    bot.deleteMessage(msg.chat.id, msg.message_id.toString());
                }, 10000);
                return [3 /*break*/, 10];
            case 8:
                err_3 = _a.sent();
                logger.fatal("Something crashed in /setadmin command, last user was " + user);
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Неверный ввод")];
            case 9:
                _a.sent();
                return [3 /*break*/, 10];
            case 10: return [3 /*break*/, 13];
            case 11:
                logger.info("User " + user + " is trying to use /setadmin, but user is not admin");
                funnyResponse = "\n<b>\u0410\u0434\u043C\u0438\u043D\u0430 \u043C\u0435\u043D\u044F\u0442\u044C</b>\n<b>\u041D\u0435\u043B\u044C\u0437\u044F \u0433\u0440\u0443\u043F\u043F\u044B \u0442\u0435\u043A\u0443\u0449\u0435\u0439 </b>\n<b>\u0423\u0436\u0435 \u0440\u0435\u0448\u0435\u043D\u043E</b>\n        ";
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, funnyResponse, {
                        parse_mode: "HTML"
                    })];
            case 12:
                send_6 = _a.sent();
                setTimeout(function () {
                    bot.deleteMessage(msg.chat.id, msg.message_id.toString());
                    bot.deleteMessage(msg.chat.id, send_6.message_id.toString());
                }, 30000); // 30 секунд до удаления сообщения
                _a.label = 13;
            case 13: return [3 /*break*/, 16];
            case 14:
                logger.info("User " + user + " is trying to use /setadmin, but bot is not admin");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Ничего я не поменяю, пока я не админ")];
            case 15:
                _a.sent();
                _a.label = 16;
            case 16: return [2 /*return*/];
        }
    });
}); });
/**
 * Получение инструкций, команда скрыта, нужно писать ее через / без единой ошибки, если студенты получат к ней доступ, то могут сломать бота
 */
bot.onText(/\/givemetheinstructionsplease/, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var userObj, user, isPrivate, admins, admin, i, text, err_4, funnyResponse, send_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bot.getChatMember(msg.chat.id, msg.from.id.toString())];
            case 1:
                userObj = _a.sent();
                user = userObj.user.username;
                return [4 /*yield*/, isBotAdmin(msg)];
            case 2:
                if (!_a.sent()) return [3 /*break*/, 15];
                isPrivate = msg.chat.type === "private";
                if (!!isPrivate) return [3 /*break*/, 12];
                return [4 /*yield*/, bot.getChatAdministrators(msg.chat.id)];
            case 3:
                admins = _a.sent();
                admin = false;
                for (i = 0; i < admins.length; i++) {
                    if (admins[i].user.id === msg.from.id) {
                        admin = true;
                    }
                }
                if (!admin) return [3 /*break*/, 9];
                _a.label = 4;
            case 4:
                _a.trys.push([4, 6, , 8]);
                logger.info("User " + user + " is successfully using /givemetheinstructionsplease to see instructions");
                text = "\n                     <strong>----------------------------------------------------------------</strong>\n        \n        <b>\u041F\u0440\u0438\u0432\u0435\u0442 \u0434\u043E\u0440\u043E\u0433\u043E\u0439 \u0441\u043E\u0437\u0434\u0430\u0442\u0435\u043B\u044C \u0433\u0440\u0443\u043F\u043F\u044B!</b>\n\n        \n        <pre>\u042D\u0442\u043E \u0438\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F \u043F\u043E \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044E \u0433\u0440\u0443\u043F\u043F\u044B \u0434\u043B\u044F \u043E\u043F\u043E\u0432\u0435\u0449\u0435\u043D\u0438\u044F \u0441\u0442\u0443\u0434\u0435\u043D\u0442\u043E\u0432 \u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F\u0445, \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u044B\u0445, \u043E\u043F\u043B\u0430\u0442\u0430\u0445 \u0438 \u043A\u0430\u043D\u0438\u043A\u0443\u043B\u0430\u0445 \u0438 \u043F\u0440\u043E\u0447\u0435\u0435.</pre>\n        <pre>\u0412\u0441\u0435 \u0447\u0442\u043E \u043D\u0443\u0436\u043D\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u044D\u0442\u043E \u0432\u0432\u0435\u0441\u0442\u0438 <b>/build_</b> \u0437\u0430\u0442\u0435\u043C \u043D\u0435 \u0441\u0442\u0430\u0432\u044F \u043F\u0440\u043E\u0431\u0435\u043B \u0432\u0432\u0435\u0441\u0442\u0438 \u043F\u0435\u0440\u0432\u044B\u0439 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440, \u0438 \u0437\u0430\u0442\u0435\u043C \u0443\u0436\u0435 \u0447\u0435\u0440\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B\u044B \u0432\u0441\u0435 \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B.</pre>\n        <pre>\u0427\u0442\u043E\u0431\u044B \u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 \u043F\u043E \u0433\u0440\u0443\u043F\u043F\u0435 \u043C\u043E\u0436\u043D\u043E \u0432\u0432\u0435\u0441\u0442\u0438 <b>/show</b> \u0432 \u0447\u0430\u0442\u0435 \u0433\u0440\u0443\u043F\u043F\u044B \u0438 \u043F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0447\u0442\u043E \u043A \u0447\u0435\u043C\u0443.</pre>\n        <pre>\u0412\u0441\u0435\u0433\u043E \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u043E\u0432 5 \u0448\u0442\u0443\u043A. \u041D\u043E \u043D\u0435 \u043F\u0443\u0433\u0430\u0439\u0442\u0435\u0441\u044C, \u0432\u044B \u0432\u0441\u0435\u0433\u0434\u0430 \u043C\u043E\u0436\u0435\u0442\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 \u0432\u0430\u0448\u0435\u0439 \u0433\u0440\u0443\u043F\u043F\u044B \u0438 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u0435\u0435; \u0442\u043E \u0435\u0441\u0442\u044C \u043F\u0440\u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0435\u043D\u0438\u0438 \u043A\u043E\u043C\u0430\u043D\u0434\u044B <b>/build_</b> \u0441\u043E \u0432\u0441\u0435\u043C\u0438 \u043F\u0430\u0440\u043C\u0435\u0442\u0440\u0430\u043C\u0438 \u0443\u0434\u0430\u043B\u0438\u0442 \u0441\u0442\u0430\u0440\u0443\u044E \u0437\u0430\u043F\u0438\u0441\u044C \u0438 \u0441\u043E\u0437\u0434\u0430\u0441\u0442 \u043D\u043E\u0432\u0443\u044E</pre>\n        \n        <b>\u041A\u0430\u043A\u0438\u0435 \u0435\u0441\u0442\u044C \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B:</b>\n        \n        <b>\u0418\u043C\u044F \u0433\u0440\u0443\u043F\u043F\u044B:</b><pre>\u041F\u0438\u0448\u0438\u0442\u0435 \u0438\u043C\u044F \u0431\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B\u043E\u0432 \u0432 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0438</pre>\n        <b>\u0414\u043D\u0438 \u0438 \u0432\u0440\u0435\u043C\u044F \u0437\u0430\u043D\u044F\u0442\u0438\u0439:</b><pre>\u041F\u0438\u0448\u0438\u0442\u0435 \u0447\u0438\u0441\u043B\u043E\u043C \u0434\u0435\u043D\u044C \u043D\u0435\u0434\u0435\u043B\u0438, \u0433\u0434\u0435 1 \u044D\u0442\u043E \u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A, \u0437\u0430\u0442\u0435\u043C \u0442\u0438\u0440\u0435 (-) \u0438 \u043F\u0438\u0448\u0438\u0442\u0435 \u0432\u0440\u0435\u043C\u044F \u0437\u0430\u043D\u044F\u0442\u0438\u0439 \u0432 \u043B\u044E\u0431\u043E\u043C \u0444\u043E\u0440\u043C\u0430\u0442\u0435 \u0431\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B\u0430, \u0434\u0430\u043B\u0435\u0435 \u0441\u043B\u044D\u0448 (/) \u0438 \u0434\u0440\u0443\u0433\u043E\u0439 \u0434\u0435\u043D\u044C \u0437\u0430\u043D\u044F\u0442\u0438\u0439 \u0438 \u0432\u0440\u0435\u043C\u044F, \u0442\u0430\u043A \u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0443\u0433\u043E\u0434\u043D\u043E \u0434\u043D\u0435\u0439</pre>\n        <b>\u0414\u043D\u0438 \u0438 \u0432\u0440\u0435\u043C\u044F \u0432\u0435\u0431\u0438\u043D\u0430\u0440\u043E\u0432:</b><pre>\u0422\u043E\u0436\u0435 \u0441\u0430\u043C\u043E\u0435, \u0447\u0442\u043E \u0438 \u0434\u043B\u044F \u0437\u0430\u043D\u044F\u0442\u0438\u0439, \u0442\u043E\u0447\u043D\u043E \u0442\u0430\u043A\u0436\u0435 \u043F\u0438\u0448\u0438\u0442\u0435 \u0434\u043D\u0438 \u0438 \u0432\u0440\u0435\u043C\u044F \u0447\u0435\u0440\u0435\u0437 \u0442\u0438\u0440\u0435 (-) \u0438 \u0441\u043B\u044D\u0448\u0438 (/)</pre>\n        <b>\u0414\u0430\u0442\u044B \u043A\u0430\u043D\u0438\u043A\u0443\u043B:</b><pre>\u041F\u0438\u0448\u0438\u0442\u0435 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 dd-mm-yyyy \u0438 \u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0441\u043B\u044D\u0448 (/) \u043C\u0435\u0436\u0434\u0443 \u0434\u0430\u0442\u0430\u043C\u0438, \u0434\u0430\u0442 \u043A\u0430\u043D\u0438\u043A\u0443\u043B \u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0443\u0433\u043E\u0434\u043D\u043E</pre>\n        <b>\u041D\u043E\u043C\u0435\u0440 \u0442\u0435\u043A\u0443\u0449\u0435\u0439 \u043D\u0435\u0434\u0435\u043B\u0438:</b><pre>\u0415\u0441\u043B\u0438 \u0432\u044B \u0437\u0430\u0440\u0430\u043D\u0435\u0435 \u0441\u043E\u0437\u0434\u0430\u0435\u0442\u0435 \u0433\u0440\u0443\u043F\u043F\u0443 (\u0432\u043E \u0432\u0440\u0435\u043C\u044F \u043E\u0440\u0438\u0435\u043D\u0442\u0430\u0446\u0438\u0438), \u0442\u043E \u0443\u043A\u0430\u0436\u0438\u0442\u0435 0, \u0447\u0442\u043E\u0431\u044B \u0441 \u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A\u0430 \u043D\u0430\u0447\u0430\u043B\u0430\u0441\u044C \u043F\u0435\u0440\u0432\u0430\u044F \u043D\u0435\u0434\u0435\u043B\u044F \u0443\u0447\u0435\u0431\u044B))</pre>\n        \n        <b>\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 \u043C\u044B \u0441\u043E\u0437\u0434\u0430\u0435\u043C \u0433\u0440\u0443\u043F\u043F\u0443 JS-5 \u0441 \u0437\u0430\u043D\u044F\u0442\u0438\u044F\u043C\u0438 \u043F\u043E \u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A\u0430\u043C \u0432 16:00 \u0438 \u0447\u0435\u0442\u0432\u0435\u0440\u0433\u0430\u043C \u0432 19:30, \u0432\u0435\u0431\u0438\u043D\u0430\u0440\u0430\u043C\u0438 \u043F\u043E \u0432\u0442\u043E\u0440\u043D\u0438\u043A\u0430\u043C \u0432 11:00 \u0438 \u043F\u043E \u0441\u0443\u0431\u0431\u043E\u0442\u0430\u043C \u0432 17:00, \u043A\u0430\u043D\u0438\u043A\u0443\u043B\u0430\u043C\u0438 \u043D\u0430 \u043D\u043E\u0432\u044B\u0439 \u0433\u043E\u0434 \u0438 \u043D\u0435\u0434\u0435\u043B\u0435\u0439 \u0432 \u0430\u0432\u0433\u0443\u0441\u0442\u0435 (15 \u0447\u0438\u0441\u043B\u0430), \u0438 \u044D\u0442\u043E \u043F\u0435\u0440\u0432\u0430\u044F \u043D\u0435\u0434\u0435\u043B\u044F \u0443\u0447\u0435\u0431\u044B</b>\n        <pre>/build_JS-5 1-16:00/4-19:30 2-11:00/6-17:00 27-12-2020/15-08-2021 1</pre>\n        \n        <pre>\u0413\u043E\u0442\u043E\u0432\u043E))</pre>\n        \n        <b>PS:</b>\n        \n        <pre>\u0412\u044B \u0442\u0430\u043A\u0436\u0435 \u043C\u043E\u0436\u0435\u0442\u0435 \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043D\u043E\u043C\u0435\u0440 \u0442\u0435\u043A\u0443\u0449\u0435\u0439 \u043D\u0435\u0434\u0435\u043B\u0438, \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u043A\u043E\u043C\u0430\u043D\u0434\u044B /setweek_.</pre>\n        <pre>\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, /setweek_3 \u043C\u044B \u043C\u0435\u043D\u044F\u0435\u043C \u0442\u0435\u043A\u0443\u0449\u0443\u044E \u043D\u0435\u0434\u0435\u043B\u044E \u043D\u0430 3 (\u0441\u0447\u0438\u0442\u0430\u0442\u044C \u043D\u0435\u0434\u0435\u043B\u044E \u043F\u0440\u043E\u0441\u0442\u043E, \u0440\u0430\u0437\u0434\u0435\u043B\u0438\u0442\u0435 \u043D\u043E\u043C\u0435\u0440 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u044D\u0442\u043E\u0439 \u043D\u0435\u0434\u0435\u043B\u0438 \u043D\u0430 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u0439 \u0432 \u043D\u0435\u0434\u0435\u043B\u0435, \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 \u0437\u0430\u043D\u044F\u0442\u0438\u0435 21 \u043F\u0440\u0438 \u0434\u0432\u0443\u0445 \u0437\u0430\u043D\u044F\u0442\u0438\u044F\u0445 \u0432 \u043D\u0435\u0434\u0435\u043B\u044E, \u044D\u0442\u043E 10 \u043D\u0435\u0434\u0435\u043B\u044F \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u044F (\u043E\u043A\u0440\u0443\u0433\u043B\u044F\u0442\u044C \u0432\u043D\u0438\u0437 \u0435\u0441\u043B\u0438 \u0447\u0442\u043E))))</pre>\n        \n        <b>PPS:</b>\n        \n        <pre>\u041C\u043E\u0436\u043D\u043E \u0443\u043A\u0430\u0437\u0430\u0442\u044C \u0430\u0434\u043C\u0438\u043D\u0430 \u0433\u0440\u0443\u043F\u043F\u044B \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E /setadmin_ </pre>\n        <pre>\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, /setadmin_Nazira +7(777)777-77-77 @Nazira \u043C\u044B \u0441\u0442\u0430\u0432\u0438\u043C \u0430\u0434\u043C\u0438\u043D\u043E\u043C \u0433\u0440\u0443\u043F\u043F\u044B \u041D\u0430\u0437\u0438\u0440\u0443 \u0441 \u043A\u0430\u043A\u0438\u043C\u0438 \u0442\u043E \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u043D\u044B\u043C\u0438 \u0434\u0430\u043D\u043D\u044B\u043C\u0438.</pre>\n        \n        <b>PPPS:</b>\n        <pre>\u0427\u0442\u043E\u0431\u044B \u043F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 \u0432\u0441\u0435\u0445 \u0433\u0440\u0443\u043F\u043F, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u043C\u0430\u043D\u0434\u0443 /allgroups \u0432 \u043B\u0438\u0447\u043D\u043E\u0439 \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0435 \u0441 \u0431\u043E\u0442\u043E\u043C</pre>\n         \n        <b>PPPPS:</b>\n        <pre>\u0427\u0442\u043E\u0431\u044B \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u0433\u0440\u0443\u043F\u043F\u0443, \u043D\u0430\u043F\u0438\u0448\u0438\u0442\u0435 \u0445\u043E\u0442\u044C \u043B\u0438\u0447\u043D\u043E, \u0445\u043E\u0442\u044C \u0432 \u0433\u0440\u0443\u043F\u043F\u0435 \u043A\u043E\u043C\u0430\u043D\u0434\u0443 /delete_ \u0437\u0430\u0442\u0435\u043C id \u0433\u0440\u0443\u043F\u043F\u044B (\u043C\u043E\u0436\u043D\u043E \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E /allgroups) \u0438 \u0437\u0430\u0442\u0435\u043C \u0447\u0435\u0440\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B \u043F\u0430\u0440\u043E\u043B\u044C, \u043F\u0430\u0440\u043E\u043B\u044C \u0437\u043D\u0430\u044E\u0442 \u0430\u0434\u043C\u0438\u043D\u044B</pre>\n        <pre>\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u043A\u0442\u043E-\u0442\u043E \u0441\u043E\u0437\u0434\u0430\u043B \u043B\u0435\u0432\u0443\u044E \u043D\u0435\u043D\u0443\u0436\u043D\u0443\u044E \u0438\u043B\u0438 \u0442\u0435\u0441\u0442\u043E\u0432\u0443\u044E \u0433\u0440\u0443\u043F\u043F\u0443 \u0441 id 608ce9694d1311418c93ec9f</pre>\n        <pre>\u0427\u0442\u043E\u0431\u044B \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u044D\u0442\u0443 \u0433\u0440\u0443\u043F\u043F\u0443 \u043D\u0430\u043F\u0438\u0448\u0438\u0442\u0435 /delete_608ce9694d1311418c93ec9f ****** (\u0433\u0434\u0435 ****** \u044D\u0442\u043E \u043F\u0430\u0440\u043E\u043B\u044C)</pre>\n\n                                            <pre>           &#9774; &#9774; &#9774; &#9774; &#9774; &#9774; &#9774; &#9774; &#9774;</pre>\n        \n        <strong>----------------------------------------------------------------</strong>\n                    ";
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, text, {
                        parse_mode: "HTML"
                    })];
            case 5:
                _a.sent();
                return [3 /*break*/, 8];
            case 6:
                err_4 = _a.sent();
                logger.fatal("Something crashed in /givemetheinstructionsplease command, last user was " + user);
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Что то рухнуло и сломалось")];
            case 7:
                _a.sent();
                return [3 /*break*/, 8];
            case 8: return [3 /*break*/, 11];
            case 9:
                logger.info("User " + user + " is trying to use /givemetheinstructionsplease, but user is not admin");
                funnyResponse = "\n<b>\u0423\u0437\u0440\u0435\u0442\u044C \u0436\u0435\u043B\u0430\u0435\u0448\u044C</b>\n<b>\u0418\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044E \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B</b>\n<b>\u041F\u0443\u0441\u0442\u043E\u0442\u0430 \u043A\u0440\u0443\u0433\u043E\u043C</b>\n        ";
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, funnyResponse, {
                        parse_mode: "HTML"
                    })];
            case 10:
                send_7 = _a.sent();
                setTimeout(function () {
                    bot.deleteMessage(msg.chat.id, msg.message_id.toString());
                    bot.deleteMessage(msg.chat.id, send_7.message_id.toString());
                }, 15000); // 15 секунд до удаления сообщения
                _a.label = 11;
            case 11: return [3 /*break*/, 14];
            case 12: return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Лишь в групповом чате отвечаю я на данную команду")];
            case 13:
                _a.sent();
                _a.label = 14;
            case 14: return [3 /*break*/, 17];
            case 15:
                logger.info("User " + user + " is trying to use /givemetheinstructionsplease, but bot is not admin");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Ничего я не покажу, пока я не админ")];
            case 16:
                _a.sent();
                _a.label = 17;
            case 17: return [2 /*return*/];
        }
    });
}); });
/**
 * Данная функция доступна всем (возможно добавим ее через BotFather в видимые команды), сообщение показывает данные по группе, текущему занятию, датой следующей контрольной
 * Сообщение автоматически удаляется спустя некоторое время
 */
bot.onText(/\/show/, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var userObj, user, group_1, examSaturday, text, _loop_1, i, _loop_2, i, i, send_8, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bot.getChatMember(msg.chat.id, msg.from.id.toString())];
            case 1:
                userObj = _a.sent();
                user = userObj.user.username;
                return [4 /*yield*/, isBotAdmin(msg)];
            case 2:
                if (!_a.sent()) return [3 /*break*/, 9];
                _a.label = 3;
            case 3:
                _a.trys.push([3, 6, , 8]);
                return [4 /*yield*/, group_model_1.Group.findOne({ chatId: msg.chat.id })];
            case 4:
                group_1 = _a.sent();
                logger.info("User " + user + " is using /show, to see info about group " + group_1.groupName);
                examSaturday = getDateOfNextExam(group_1);
                text = "\n<b>----------------------------</b>\n\n<b>\u0414\u0430\u043D\u043D\u044B\u0435 \u043F\u043E \u0432\u0430\u0448\u0435\u0439 \u0433\u0440\u0443\u043F\u043F\u0435</b>\n\n<b>\u0418\u043C\u044F \u0433\u0440\u0443\u043F\u043F\u044B</b><pre>".concat(group_1.groupName, "</pre> \n<b>\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0430\u044F \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u0430\u044F</b><pre>#").concat(Math.floor(group_1.currentWeek / 4) + 1, " \u0431\u0443\u0434\u0435\u0442 ").concat(examSaturday, "</pre> \n<b>\u0410\u0434\u043C\u0438\u043D \u0432\u0430\u0448\u0435\u0439 \u0433\u0440\u0443\u043F\u043F\u044B</b><pre>").concat(group_1.groupAdmin, "</pre> \n");
                text += "<b>----------------------------</b>\n<b>\u0417\u0430\u043D\u044F\u0442\u0438\u044F \u043F\u043E </b>\n";
                _loop_1 = function (i) {
                    text += Object.keys(group_1.lessons[i]).map(function (key) {
                        return "<pre>".concat(weekDays[parseInt(key) - 1], " \u0432 ").concat(group_1.lessons[i][key], "</pre> \n");
                    });
                };
                for (i = 0; i < group_1.lessons.length; i++) {
                    _loop_1(i);
                }
                text += "<b>----------------------------</b>\n<b>\u0412\u0435\u0431\u0438\u043D\u0430\u0440\u044B \u043F\u043E </b>\n";
                _loop_2 = function (i) {
                    text += Object.keys(group_1.webinars[i]).map(function (key) {
                        return "<pre>".concat(weekDays[parseInt(key) - 1], " \u0432 ").concat(group_1.webinars[i][key], "</pre> \n");
                    });
                };
                for (i = 0; i < group_1.webinars.length; i++) {
                    _loop_2(i);
                }
                text += "<b>----------------------------</b>\n<b>\u0414\u0430\u0442\u044B \u043A\u0430\u043D\u0438\u043A\u0443\u043B</b>\n";
                for (i = 0; i < group_1.holidays.length; i++) {
                    text += "<pre>".concat(group_1.holidays[i], "</pre> \n");
                }
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, text, {
                        parse_mode: "HTML"
                    })];
            case 5:
                send_8 = _a.sent();
                setTimeout(function () {
                    bot.deleteMessage(msg.chat.id, msg.message_id.toString());
                    bot.deleteMessage(msg.chat.id, send_8.message_id.toString());
                }, 30000); // 30 секунд до удаления сообщения
                return [3 /*break*/, 8];
            case 6:
                err_5 = _a.sent();
                logger.info("User " + user + " is trying to use /show, but group doesn't exist");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Группа еще не создана")];
            case 7:
                _a.sent();
                return [3 /*break*/, 8];
            case 8: return [3 /*break*/, 11];
            case 9:
                logger.info("User " + user + " is trying to use /show, but bot is not admin");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Хочу быть админом, иначе ничего не покажу")];
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
    var userObj, user, isPrivate, groups, _loop_3, i, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bot.getChatMember(msg.chat.id, msg.from.id.toString())];
            case 1:
                userObj = _a.sent();
                user = userObj.user.username;
                isPrivate = msg.chat.type === "private";
                if (!isPrivate) return [3 /*break*/, 11];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 8, , 10]);
                logger.info("User " + user + " is watching /allgroups");
                return [4 /*yield*/, group_model_1.Group.find()];
            case 3:
                groups = _a.sent();
                _loop_3 = function (i) {
                    var group, examSaturday, text, _loop_4, j, _loop_5, j, j, numbersDividers;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                group = groups[i];
                                examSaturday = getDateOfNextExam(group);
                                text = "\n<b>----------------------------</b>\n\n<b>\u0414\u0430\u043D\u043D\u044B\u0435 \u043F\u043E \u0432\u0430\u0448\u0435\u0439 \u0433\u0440\u0443\u043F\u043F\u0435</b>\n\n<b>\u0418\u043C\u044F \u0433\u0440\u0443\u043F\u043F\u044B</b><pre>".concat(group.groupName, "</pre> \n<b>\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0430\u044F \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u0430\u044F</b><pre>#").concat(Math.floor(group.currentWeek / 4) + 1, " \u0431\u0443\u0434\u0435\u0442 ").concat(examSaturday, "</pre> \n<b>\u0410\u0434\u043C\u0438\u043D \u0432\u0430\u0448\u0435\u0439 \u0433\u0440\u0443\u043F\u043F\u044B</b><pre>").concat(group.groupAdmin, "</pre> \n");
                                text += "<b>----------------------------</b>\n<b>\u0417\u0430\u043D\u044F\u0442\u0438\u044F \u043F\u043E </b>\n";
                                _loop_4 = function (j) {
                                    text += Object.keys(group.lessons[j]).map(function (key) {
                                        return "<pre>".concat(weekDays[parseInt(key) - 1], " \u0432 ").concat(group.lessons[j][key], "</pre> \n");
                                    });
                                };
                                for (j = 0; j < group.lessons.length; j++) {
                                    _loop_4(j);
                                }
                                text += "<b>----------------------------</b>\n<b>\u0412\u0435\u0431\u0438\u043D\u0430\u0440\u044B \u043F\u043E </b>\n";
                                _loop_5 = function (j) {
                                    text += Object.keys(group.webinars[j]).map(function (key) {
                                        return "<pre>".concat(weekDays[parseInt(key) - 1], " \u0432 ").concat(group.webinars[j][key], "</pre> \n");
                                    });
                                };
                                for (j = 0; j < group.webinars.length; j++) {
                                    _loop_5(j);
                                }
                                text += "<b>----------------------------</b>\n<b>\u0414\u0430\u0442\u044B \u043A\u0430\u043D\u0438\u043A\u0443\u043B</b>\n";
                                for (j = 0; j < group.holidays.length; j++) {
                                    text += "<pre>".concat(group.holidays[j], "</pre> \n");
                                }
                                text += "\n<b>ID \u0433\u0440\u0443\u043F\u043F\u044B</b> <pre>".concat(group._id, "</pre>\n                ");
                                numbersDividers = "\n<b>----------------------------</b>\n<b>".concat(i + 1, "</b>\n<b>----------------------------</b>\n                ");
                                return [4 /*yield*/, bot.sendMessage(msg.chat.id, numbersDividers, {
                                        parse_mode: "HTML"
                                    })];
                            case 1:
                                _b.sent();
                                return [4 /*yield*/, bot.sendMessage(msg.chat.id, text, {
                                        parse_mode: "HTML"
                                    })];
                            case 2:
                                _b.sent();
                                return [2 /*return*/];
                        }
                    });
                };
                i = 0;
                _a.label = 4;
            case 4:
                if (!(i < groups.length)) return [3 /*break*/, 7];
                return [5 /*yield**/, _loop_3(i)];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6:
                i++;
                return [3 /*break*/, 4];
            case 7: return [3 /*break*/, 10];
            case 8:
                err_6 = _a.sent();
                logger.fatal("User " + user + " tried /allgroups and bot crashed");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Что то рухнуло и сломалось")];
            case 9:
                _a.sent();
                return [3 /*break*/, 10];
            case 10: return [3 /*break*/, 13];
            case 11:
                logger.info("User " + user + " wrote /allgroups in group chat");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Напиши мне эту команду лично пожалуйста, я не могу когда все смотрят")];
            case 12:
                _a.sent();
                _a.label = 13;
            case 13: return [2 /*return*/];
        }
    });
}); });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Функция для удаления группы, удалять можно любую группу, это сделано потому, что кто угодно может создать групповой чат с ботом и создать левую группу, которая будет падать в список групп и засорять его
 * Но вы наверное думаете, так и удалить кто угодно сможет, это ж капец. Но не бесспокойтесь, чтобы удалить группу, нужно ввести пароль
 * Вы вводите команду /delete_ затем id группы для удаления (id можно получить из списка всех групп, это нужно потому, что имена могут быть одиннаковыми) и затем через пробел пишите пароль
 * Пароль пока не придумал где хранить, пусть это будет ****** (но скорее всего его поменяют в будущем)))
 */
bot.onText(/\/delete_(.+)/, function (msg, arr) { return __awaiter(void 0, void 0, void 0, function () {
    var userObj, user, funnyResponse, ii, group, err_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bot.getChatMember(msg.chat.id, msg.from.id.toString())];
            case 1:
                userObj = _a.sent();
                user = userObj.user.username;
                funnyResponse = "\n<b>\u0413\u0440\u0443\u043F\u043F\u0443 \u0443\u0434\u0430\u043B\u0438\u0442\u044C</b>\n<b>\u041E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u043F\u0443\u0441\u0442\u043E\u0442\u0443 \u043D\u0430\u043C</b>\n<b>\u0412\u0430\u043C \u043C\u0430\u043B\u043E \u0447\u0435\u0441\u0442\u0438</b>\n        ";
                _a.label = 2;
            case 2:
                _a.trys.push([2, 9, , 11]);
                ii = arr[1].replace(/\s+/g, ' ').trim().split(" ");
                return [4 /*yield*/, group_model_1.Group.findOne({ _id: ii[0] })];
            case 3:
                group = _a.sent();
                if (!(ii[1] === config_1.config.password)) return [3 /*break*/, 6];
                logger.warn("User " + user + " delete group " + group.groupName);
                return [4 /*yield*/, group.delete()];
            case 4:
                _a.sent();
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "\u0413\u0440\u0443\u043F\u043F\u0430 ".concat(group.groupName, " \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0443\u0434\u0430\u043B\u0435\u043D\u0430 \u0438\u0437 \u0431\u0430\u0437\u044B"))];
            case 5:
                _a.sent();
                return [3 /*break*/, 8];
            case 6:
                logger.warn("User " + user + " is trying to delete group " + group.groupName + " but password is incorrect");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, funnyResponse, {
                        parse_mode: "HTML"
                    })];
            case 7:
                _a.sent();
                _a.label = 8;
            case 8: return [3 /*break*/, 11];
            case 9:
                err_7 = _a.sent();
                logger.fatal("User " + user + " used command /delete and bot crashed because not all parameters of command were present");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, funnyResponse, {
                        parse_mode: "HTML"
                    })];
            case 10:
                _a.sent();
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
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
    var isPrivate, userObj, user, text, err_8, send_9, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isPrivate = msg.chat.type === "private";
                return [4 /*yield*/, bot.getChatMember(msg.chat.id, msg.from.id.toString())];
            case 1:
                userObj = _a.sent();
                user = userObj.user.username;
                if (!isPrivate) return [3 /*break*/, 7];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 6]);
                logger.silly("User " + user + " started cipher game by command /letsplay");
                text = "\n            <b>\u041A\u0430\u043A \u043A\u043E\u043C\u0430\u043D\u0434\u0443 \u043D\u0430\u043F\u0438\u0448\u0438 \u043C\u043D\u0435 \u0447\u0442\u043E \u0442\u044B \u0441\u043B\u044B\u0448\u0438\u0448\u044C \u0432 \u044D\u0442\u043E\u043C \u0444\u0430\u0439\u043B\u0435 (\u0435\u0441\u043B\u0438 \u0437\u0432\u0443\u043A\u0430 \u043D\u0435\u0442, \u0442\u043E \u0441\u043A\u0430\u0447\u0430\u0439\u0442\u0435 \u0444\u0430\u0439\u043B \u0438 \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435 \u0447\u0435\u0440\u0435\u0437 \u043F\u0440\u043E\u0438\u0433\u0440\u044B\u0432\u0430\u0442\u0435\u043B\u044C)</b>\n        ";
                return [4 /*yield*/, bot.sendAudio(msg.chat.id, "./ciphers/guesswhat.wav", {
                        caption: text,
                        parse_mode: "HTML"
                    })];
            case 3:
                _a.sent();
                return [3 /*break*/, 6];
            case 4:
                err_8 = _a.sent();
                logger.fatal("User " + user + " crashed bot with /letsplay command");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Похоже что-то случилось с соединением")];
            case 5:
                _a.sent();
                return [3 /*break*/, 6];
            case 6: return [3 /*break*/, 11];
            case 7:
                _a.trys.push([7, 10, , 11]);
                logger.info("User " + user + " tries to play /letsplay but bot is in public chat");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Я бы с радостью показал и затем удалил квестовое сообщение, но студенты говорят, что я спамю, так что пишите мне эту команду лично")];
            case 8:
                send_9 = _a.sent();
                return [4 /*yield*/, setTimeout(function () {
                        bot.deleteMessage(msg.chat.id, msg.message_id.toString());
                        bot.deleteMessage(msg.chat.id, send_9.message_id.toString());
                    }, 15000)];
            case 9:
                _a.sent();
                return [3 /*break*/, 11];
            case 10:
                e_1 = _a.sent();
                logger.fatal("User " + user + " crashed bot with /letsplay command when deleting group answer message");
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); });
/**
 *  Это обычный код цезаря, его можно получить только в личной переписке. Если кто-то напишет команду в общий чат, то команда сразу удалится
 *  чтобы никто не скопировал то, что смог найти другой. Шифр имеет отступ +7 символов, ведет к команде stepthree
 */
bot.onText(/\/gotonext/, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var userObj, user, isPrivate, send_10, err_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bot.getChatMember(msg.chat.id, msg.from.id.toString())];
            case 1:
                userObj = _a.sent();
                user = userObj.user.username;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 12, , 14]);
                isPrivate = msg.chat.type === "private";
                if (!isPrivate) return [3 /*break*/, 4];
                logger.silly("User " + user + " wrote /gotonext in private chat as it should be");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "dypal uvd wslhzl av tl aol jvtthuk zalwaoyll")];
            case 3:
                _a.sent();
                return [3 /*break*/, 11];
            case 4: return [4 /*yield*/, isBotAdmin(msg)];
            case 5:
                if (!_a.sent()) return [3 /*break*/, 9];
                logger.silly("User " + user + " wrote /gotonext in group chat");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Напиши мне эту команду лично, я не могу при всех")];
            case 6:
                send_10 = _a.sent();
                return [4 /*yield*/, bot.deleteMessage(msg.chat.id, msg.message_id.toString())];
            case 7:
                _a.sent();
                return [4 /*yield*/, setTimeout(function () {
                        bot.deleteMessage(msg.chat.id, send_10.message_id.toString());
                    }, 7000)];
            case 8:
                _a.sent();
                return [3 /*break*/, 11];
            case 9:
                logger.silly("User " + user + " wrote /gotonext when bot is not admin, its cheating");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Как вы узнали эту команду при том, что я не админ?? Вы читер?")];
            case 10:
                _a.sent();
                _a.label = 11;
            case 11: return [3 /*break*/, 14];
            case 12:
                err_9 = _a.sent();
                logger.fatal("User " + user + " crashed bot with /gotonext command");
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
    var userObj, user, isPrivate, send_11, err_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bot.getChatMember(msg.chat.id, msg.from.id.toString())];
            case 1:
                userObj = _a.sent();
                user = userObj.user.username;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 12, , 14]);
                isPrivate = msg.chat.type === "private";
                if (!isPrivate) return [3 /*break*/, 4];
                logger.silly("User " + user + " wrote /stepthree in private chat as it should be");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "yhynen oemotd urywhw aifwee rgrrcb ehiios otetmi nwnemt tadmae")];
            case 3:
                _a.sent();
                return [3 /*break*/, 11];
            case 4: return [4 /*yield*/, isBotAdmin(msg)];
            case 5:
                if (!_a.sent()) return [3 /*break*/, 9];
                logger.silly("User " + user + " wrote /stepthree in group chat");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Если второй шаг был в личной переписке, почему третий должен быть в общем чате?")];
            case 6:
                send_11 = _a.sent();
                return [4 /*yield*/, bot.deleteMessage(msg.chat.id, msg.message_id.toString())];
            case 7:
                _a.sent();
                return [4 /*yield*/, setTimeout(function () {
                        bot.deleteMessage(msg.chat.id, send_11.message_id.toString());
                    }, 7000)];
            case 8:
                _a.sent();
                return [3 /*break*/, 11];
            case 9:
                logger.silly("User " + user + " wrote /stepthree when bot is not admin, its cheating");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Похоже да, вы читер, фуууу")];
            case 10:
                _a.sent();
                _a.label = 11;
            case 11: return [3 /*break*/, 14];
            case 12:
                err_10 = _a.sent();
                logger.fatal("User " + user + " crashed bot with /stepthree command");
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
    var userObj, user, isPrivate, send_12, err_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bot.getChatMember(msg.chat.id, msg.from.id.toString())];
            case 1:
                userObj = _a.sent();
                user = userObj.user.username;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 12, , 14]);
                isPrivate = msg.chat.type === "private";
                if (!isPrivate) return [3 /*break*/, 4];
                logger.silly("User " + user + " wrote /website in private chat as it should be");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "https://starman-cook.github.io/cipher/html.html")];
            case 3:
                _a.sent();
                return [3 /*break*/, 11];
            case 4: return [4 /*yield*/, isBotAdmin(msg)];
            case 5:
                if (!_a.sent()) return [3 /*break*/, 9];
                logger.silly("User " + user + " wrote /website in group chat");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Вы издеваетесь))?")];
            case 6:
                send_12 = _a.sent();
                return [4 /*yield*/, bot.deleteMessage(msg.chat.id, msg.message_id.toString())];
            case 7:
                _a.sent();
                return [4 /*yield*/, setTimeout(function () {
                        bot.deleteMessage(msg.chat.id, send_12.message_id.toString());
                    }, 7000)];
            case 8:
                _a.sent();
                return [3 /*break*/, 11];
            case 9:
                logger.silly("User " + user + " wrote /website when bot is not admin, its cheating");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Я читеру бы написал 'Вы издеваетесь?', но я не админ, поэтому пишу всякую фигню... ")];
            case 10:
                _a.sent();
                _a.label = 11;
            case 11: return [3 /*break*/, 14];
            case 12:
                err_11 = _a.sent();
                logger.fatal("User " + user + " crashed bot with /website command");
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
    var userObj, user, isPrivate, text, send_13, err_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bot.getChatMember(msg.chat.id, msg.from.id.toString())];
            case 1:
                userObj = _a.sent();
                user = userObj.user.username;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 12, , 14]);
                isPrivate = msg.chat.type === "private";
                if (!isPrivate) return [3 /*break*/, 4];
                logger.silly("User " + user + " wrote /243256 in private chat and got a file with hidden cipher");
                text = "\n            <b>\u041D\u0435 \u043D\u0443\u0436\u043D\u043E \u043D\u0438\u0447\u0435\u0433\u043E \u0438\u0441\u043A\u0430\u0442\u044C, \u043D\u0443\u0436\u043D\u043E \u043B\u0438\u0448\u044C \u0441\u043A\u0430\u0447\u0430\u0442\u044C \u0438 \u0447\u0442\u043E-\u0442\u043E \u043F\u043E\u043C\u0435\u043D\u044F\u0442\u044C</b>\n            ";
                return [4 /*yield*/, bot.sendDocument(msg.chat.id, "./ciphers/lebowski_hidden_cipher.jpg", {
                        caption: text,
                        parse_mode: "HTML"
                    })];
            case 3:
                _a.sent();
                return [3 /*break*/, 11];
            case 4: return [4 /*yield*/, isBotAdmin(msg)];
            case 5:
                if (!_a.sent()) return [3 /*break*/, 9];
                logger.silly("User " + user + " wrote /243256 in group chat");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Вы далеко зашли, и вами движет любопытство, что же ответит бот в общем чате на этот раз. А отвечу я 'notredame'")];
            case 6:
                send_13 = _a.sent();
                return [4 /*yield*/, bot.deleteMessage(msg.chat.id, msg.message_id.toString())];
            case 7:
                _a.sent();
                return [4 /*yield*/, setTimeout(function () {
                        bot.deleteMessage(msg.chat.id, send_13.message_id.toString());
                    }, 7000)];
            case 8:
                _a.sent();
                return [3 /*break*/, 11];
            case 9:
                logger.silly("User " + user + " wrote /243256 when bot is not admin, its cheating");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Будь я админом, я дал бы вам крайне важную подсказку по квесту, а так фиг вам))")];
            case 10:
                _a.sent();
                _a.label = 11;
            case 11: return [3 /*break*/, 14];
            case 12:
                err_12 = _a.sent();
                logger.fatal("User " + user + " crashed bot with /243256 command");
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
    var userObj, user, isPrivate, text, textWinnerToGroup, err_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bot.getChatMember(msg.chat.id, msg.from.id.toString())];
            case 1:
                userObj = _a.sent();
                user = userObj.user.username;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 11, , 13]);
                isPrivate = msg.chat.type === "private";
                if (!isPrivate) return [3 /*break*/, 4];
                logger.silly("User " + user + " wrote /iamthechampion in private chat, we have a winner");
                text = "\n                                    <b>&#9812; \u0412\u044B \u043F\u043E\u0431\u0435\u0434\u0438\u043B\u0438!!!&#127881;&#127881;&#127881;</b>\n    <b>&#9812; \u041E\u0442\u043B\u0438\u0447\u043D\u0430\u044F \u0440\u0430\u0431\u043E\u0442\u0430 ".concat(msg.chat.first_name, "&#127881;&#127881;&#127881;</b>\n    <b>&#9812; \u0421\u043E\u043E\u0431\u0449\u0438\u0442\u0435 \u043E \u0441\u0432\u043E\u0435\u0439 \u043F\u043E\u0431\u0435\u0434\u0435 \u0441\u0430\u043F\u043F\u043E\u0440\u0442\u0443&#127881;&#127881;&#127881;</b>\n    <b>&#9812; \u041C\u044B \u043F\u0440\u0438\u0434\u0443\u043C\u0430\u0435\u043C \u043A\u0430\u043A \u0432\u0430\u0441 \u043D\u0430\u0433\u0440\u0430\u0434\u0438\u0442\u044C)))&#127881;&#127881;&#127881;</b>\n    <b>&#9812; \u0412\u044B \u0441\u0443\u043F\u0435\u0440!&#127881;&#127881;&#127881;</b>\n            ");
                return [4 /*yield*/, bot.sendPhoto(msg.chat.id, "./ciphers/winner.jpg", {
                        caption: text,
                        parse_mode: 'HTML'
                    })];
            case 3:
                _a.sent();
                return [3 /*break*/, 10];
            case 4: return [4 /*yield*/, isBotAdmin(msg)];
            case 5:
                if (!_a.sent()) return [3 /*break*/, 8];
                logger.silly("User " + user + " wrote /iamthechampion in group chat, we have a winner");
                textWinnerToGroup = "\n    <b>&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;</b>\n                    <b>&#9812; \u0421\u043C\u043E\u0442\u0440\u0438\u0442\u0435 \u0432\u0441\u0435, ".concat(msg.from.first_name, " \u0440\u0435\u0448\u0438\u043B \u0433\u043E\u043B\u043E\u0432\u043E\u043B\u043E\u043C\u043A\u0443! &#9812;</b>\n    <b>&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;</b>\n    ");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, textWinnerToGroup, {
                        parse_mode: "HTML"
                    })];
            case 6:
                _a.sent();
                return [4 /*yield*/, bot.deleteMessage(msg.chat.id, msg.message_id.toString())];
            case 7:
                _a.sent();
                return [3 /*break*/, 10];
            case 8:
                logger.silly("User " + user + " wrote /iamthechampion when bot is not admin, its cheating");
                return [4 /*yield*/, bot.sendMessage(msg.chat.id, "Я бы сказал кто здесь победитель, со смайликами всякими, но я не админ... и как вы дошли до этой команды без бота админа? Удалите команду, чтобы не спойлерить решение")];
            case 9:
                _a.sent();
                _a.label = 10;
            case 10: return [3 /*break*/, 13];
            case 11:
                err_13 = _a.sent();
                logger.fatal("User " + user + " crashed bot with /iamthechampion command");
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
var buildLessonMessage = function (groups, day) { return __awaiter(void 0, void 0, void 0, function () {
    var i, j, isExamToday, checkKeyAndGetTime, lessonNum;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger.trace("LESSON: Start of Building Lesson Message function");
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < groups.length)) return [3 /*break*/, 6];
                j = 0;
                _a.label = 2;
            case 2:
                if (!(j < groups[i].lessons.length)) return [3 /*break*/, 5];
                logger.trace("LESSON: Groups in cycle, group " + (i + 1) + " " + groups[i].groupName);
                isExamToday = day === 6 && (groups[i].currentWeek + 1) % 4 === 0;
                if (isExamToday)
                    return [3 /*break*/, 4];
                checkKeyAndGetTime = groups[i].lessons[j][day];
                if (!(checkKeyAndGetTime && groups[i].isActive)) return [3 /*break*/, 4];
                lessonNum = (groups[i].currentWeek) * groups[i].lessons.length + j + 1;
                logger.trace("LESSON: Groups in cycle, group " + (i + 1) + " " + groups[i].groupName + " got the message about lesson today, lesson number is " + lessonNum);
                return [4 /*yield*/, bot.sendMessage(groups[i].chatId, "\u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435 #\u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u043C, \u0441\u0435\u0433\u043E\u0434\u043D\u044F (".concat((0, moment_1.default)().format("DD-MM-YYYY"), ") \u0443 \u0432\u0430\u0441 \u0441\u043E\u0441\u0442\u043E\u0438\u0442\u0441\u044F \u0437\u0430\u043D\u044F\u0442\u0438\u0435 \u043D\u043E\u043C\u0435\u0440 #").concat(lessonNum, " \u0432 ").concat(checkKeyAndGetTime, ", \u0447\u0438\u0442\u0430\u0439\u0442\u0435 \u0440\u0430\u0437\u0434\u0430\u0442\u043A\u0443 \u043F\u0435\u0440\u0435\u0434 \u0437\u0430\u043D\u044F\u0442\u0438\u0435\u043C"), {
                        parse_mode: "HTML"
                    })];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                j++;
                return [3 /*break*/, 2];
            case 5:
                i++;
                return [3 /*break*/, 1];
            case 6: return [2 /*return*/];
        }
    });
}); };
var buildWebinarMessage = function (groups, day) { return __awaiter(void 0, void 0, void 0, function () {
    var i, j, isExamToday, checkKeyAndGetTime;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger.trace("WEBINAR: Start of Building Webinar Message function");
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < groups.length)) return [3 /*break*/, 6];
                j = 0;
                _a.label = 2;
            case 2:
                if (!(j < groups[i].webinars.length)) return [3 /*break*/, 5];
                logger.trace("WEBINAR: Groups in cycle, group " + (i + 1) + " " + groups[i].groupName);
                isExamToday = day === 6 && (groups[i].currentWeek + 1) % 4 === 0;
                if (isExamToday)
                    return [3 /*break*/, 4];
                checkKeyAndGetTime = groups[i].webinars[j][day];
                if (!(checkKeyAndGetTime && groups[i].isActive)) return [3 /*break*/, 4];
                logger.trace("WEBINAR: Groups in cycle, group " + (i + 1) + " " + groups[i].groupName + " got the message about webinar today");
                return [4 /*yield*/, bot.sendMessage(groups[i].chatId, "\u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435 #\u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u043C, \u0441\u0435\u0433\u043E\u0434\u043D\u044F (".concat((0, moment_1.default)().format("DD-MM-YYYY"), ") \u0443 \u0432\u0430\u0441 \u0441\u043E\u0441\u0442\u043E\u0438\u0442\u0441\u044F \u0432\u0435\u0431\u0438\u043D\u0430\u0440 \u0432 ").concat(checkKeyAndGetTime, ", \u043F\u0438\u0448\u0438\u0442\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B \u0441 \u0445\u044D\u0448\u0442\u044D\u0433\u043E\u043C #\u041D\u0430\u0432\u0435\u0431\u0438\u043D\u0430\u0440"), {
                        parse_mode: "HTML"
                    })];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                j++;
                return [3 /*break*/, 2];
            case 5:
                i++;
                return [3 /*break*/, 1];
            case 6: return [2 /*return*/];
        }
    });
}); };
/**
 * Составление сообщения о наступающей контрольной
 */
var buildComingExamMessage = function (groups, date) { return __awaiter(void 0, void 0, void 0, function () {
    var i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger.trace("EXAM: Start of Building Upcoming Exam Message function");
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < groups.length)) return [3 /*break*/, 4];
                logger.trace("EXAM: Groups in cycle, group " + (i + 1) + " " + groups[i].groupName);
                if (!((groups[i].currentWeek + 1) % 4 === 0 && groups[i].isActive)) return [3 /*break*/, 3];
                logger.trace("EXAM: Groups in cycle, group " + (i + 1) + " " + groups[i].groupName + " got the message about upcoming exam number " + (groups[i].currentWeek + 1) / 4);
                return [4 /*yield*/, bot.sendMessage(groups[i].chatId, "\u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435 #\u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u043C, \u0432 \u044D\u0442\u0443 \u0441\u0443\u0431\u0431\u043E\u0442\u0443 (".concat(date, ") \u0443 \u0432\u0430\u0441 \u0441\u043E\u0441\u0442\u043E\u0438\u0442\u0441\u044F \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u0430\u044F \u0440\u0430\u0431\u043E\u0442\u0430 \u043D\u043E\u043C\u0435\u0440 #").concat((groups[i].currentWeek + 1) / 4, " c 11:00 \u0434\u043E 19:00, \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u0432\u0441\u0435 \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u043D\u044B\u0435 \u0442\u0435\u043C\u044B \u044D\u0442\u043E\u0433\u043E \u043C\u0435\u0441\u044F\u0446\u0430"), {
                        parse_mode: "HTML"
                    })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Составление сообщения о контрольной сегодня
 */
var buildTodayExamMessage = function (groups) { return __awaiter(void 0, void 0, void 0, function () {
    var i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger.trace("EXAM_TODAY: Start of Building Exam Message function");
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < groups.length)) return [3 /*break*/, 4];
                logger.trace("EXAM_TODAY: Groups in cycle, group " + (i + 1) + " " + groups[i].groupName);
                if (!((groups[i].currentWeek + 1) % 4 === 0 && groups[i].isActive)) return [3 /*break*/, 3];
                logger.trace("EXAM_TODAY: Groups in cycle, group " + (i + 1) + " " + groups[i].groupName + " got the message about today's exam number " + (groups[i].currentWeek + 1) / 4);
                return [4 /*yield*/, bot.sendMessage(groups[i].chatId, "\u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435 #\u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u043C, \u0441\u0435\u0433\u043E\u0434\u043D\u044F (".concat((0, moment_1.default)().format("DD-MM-YYYY"), ") \u0443 \u0432\u0430\u0441 \u0441\u043E\u0441\u0442\u043E\u0438\u0442\u0441\u044F \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u0430\u044F \u0440\u0430\u0431\u043E\u0442\u0430 \u043D\u043E\u043C\u0435\u0440 #").concat((groups[i].currentWeek + 1) / 4, " c 11:00 \u0434\u043E 19:00, \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u044C\u0442\u0435 \u0442\u0440\u0435\u043A\u043A\u0435\u0440\u044B \u0435\u0441\u043B\u0438 \u043F\u0438\u0448\u0438\u0442\u0435 \u043E\u043D\u043B\u0430\u0439\u043D, \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u044C\u0442\u0435 \u0432\u0441\u0435 \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u044B\u0435 \u043F\u043E \u0432\u0430\u0448\u0435\u043C\u0443 \u043C\u043D\u0435\u043D\u0438\u044E \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u044B"), {
                        parse_mode: "HTML"
                    })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Составление сообщения о предстоящей оплате
 */
var buildPaySoonMessage = function (groups, date) { return __awaiter(void 0, void 0, void 0, function () {
    var i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger.trace("PAY: Start of Building Upcoming Pay Message function");
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < groups.length)) return [3 /*break*/, 4];
                logger.trace("PAY: Groups in cycle, group " + (i + 1) + " " + groups[i].groupName);
                if (!(groups[i].currentWeek > 3 && (groups[i].currentWeek + 1) % 4 === 1 && groups[i].isActive)) return [3 /*break*/, 3];
                logger.trace("PAY: Groups in cycle, group " + (i + 1) + " " + groups[i].groupName + " got the message about upcoming payment");
                return [4 /*yield*/, bot.sendMessage(groups[i].chatId, "\u0412\u0441\u0435\u043C \u043F\u0440\u0438\u0432\u0435\u0442, \u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u043C \u043E\u0431 \u043E\u043F\u043B\u0430\u0442\u0435 \u0437\u0430 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u043C\u0435\u0441\u044F\u0446, \u0434\u0435\u0434\u043B\u0430\u0439\u043D \u0434\u043E \u043F\u044F\u0442\u043D\u0438\u0446\u044B (".concat(date, ")"), {
                        parse_mode: "HTML"
                    })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Составление сообщения об оплате сегодня
 */
var buildPayTodayMessage = function (groups) { return __awaiter(void 0, void 0, void 0, function () {
    var months, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger.trace("PAY_TODAY: Start of Building Pay Today Message function");
                months = ["noFirstMonth", "второй", "третий", "четвертый", "пятый", "шестой", "седьмой", "восьмой", "девятый", "десятый", "одиннадцатый", "двенадцатый", "тринадцатый", "четырнадцатый", "пятнадцатый"];
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < groups.length)) return [3 /*break*/, 4];
                logger.trace("PAY_TODAY: Groups in cycle, group " + (i + 1) + " " + groups[i].groupName);
                if (!(groups[i].currentWeek > 3 && (groups[i].currentWeek + 1) % 4 === 1 && groups[i].isActive)) return [3 /*break*/, 3];
                logger.trace("PAY_TODAY: Groups in cycle, group " + (i + 1) + " " + groups[i].groupName + " got the message about today's payment");
                return [4 /*yield*/, bot.sendMessage(groups[i].chatId, "\u0412\u0441\u0435\u043C \u043F\u0440\u0438\u0432\u0435\u0442, #\u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u043C \u043E\u0431 \u043E\u043F\u043B\u0430\u0442\u0435 \u0437\u0430 ".concat(months[(groups[i].currentWeek) / 4], " \u0443\u0447\u0435\u0431\u043D\u044B\u0439 \u043C\u0435\u0441\u044F\u0446. \u0421\u0435\u0433\u043E\u0434\u043D\u044F - ").concat((0, moment_1.default)().format("DD-MM-YYYY"), ", \u043A\u0440\u0430\u0439\u043D\u0438\u0439 \u0434\u0435\u043D\u044C \u0432\u043D\u0435\u0441\u0435\u043D\u0438\u044F  \u043E\u043F\u043B\u0430\u0442\u044B."), {
                        parse_mode: "HTML"
                    })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Прибавление недели, обычшый счетчик, срабаьывает раз в неделю, скорее всего в понедельник  самом начале дня ночью.
 */
var incrementWeek = function (groups) { return __awaiter(void 0, void 0, void 0, function () {
    var i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger.trace("INCR_WEEK: Start of Increment Week Number function");
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < groups.length)) return [3 /*break*/, 4];
                logger.trace("INCR_WEEK: Groups in cycle, group " + (i + 1) + " " + groups[i].groupName);
                groups[i].currentWeek++;
                // @ts-ignore
                return [4 /*yield*/, groups[i].save()];
            case 2:
                // @ts-ignore
                _a.sent();
                _a.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Проверка на каникулы, переключает isActive группы на false либо наоборот обратно на true
 */
var isHoliday = function (group) { return __awaiter(void 0, void 0, void 0, function () {
    var i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger.trace("IS_HOLIDAY: Start of Holiday Check function");
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < group.holidayWeeksNumbers.length)) return [3 /*break*/, 4];
                logger.trace("IS_HOLIDAY: Groups in cycle, group  " + group.groupName);
                if (!(group.holidayWeeksNumbers[i] === (group.currentWeek + 1))) return [3 /*break*/, 3];
                logger.trace("IS_HOLIDAY: Groups " + group.groupName + " has holiday");
                group.holidayWeeksNumbers.splice(i, 1);
                group.isActive = false;
                group.currentWeek -= 1;
                // @ts-ignore
                return [4 /*yield*/, group.save()];
            case 2:
                // @ts-ignore
                _a.sent();
                return [2 /*return*/];
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4:
                logger.trace("IS_HOLIDAY: Groups " + group.groupName + " does not have holiday");
                group.isActive = true;
                // @ts-ignore
                return [4 /*yield*/, group.save()];
            case 5:
                // @ts-ignore
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Функция для информирования о наступающих через неделю каникулах
 */
function buildVacationSoonMessage(groups) {
    return __awaiter(this, void 0, void 0, function () {
        var i, j, months, holiday, parts, day, month, holidayEnd, partsEnd, dayEnd, monthEnd, text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < groups.length)) return [3 /*break*/, 6];
                    j = 0;
                    _a.label = 2;
                case 2:
                    if (!(j < groups[i].holidayWeeksNumbers.length)) return [3 /*break*/, 5];
                    if (!(groups[i].holidayWeeksNumbers[j] - 1 === (groups[i].currentWeek + 1))) return [3 /*break*/, 4];
                    months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
                    holiday = (0, moment_1.default)().add(1, "weeks").format("DD-MM-YYYY");
                    parts = holiday.split("-");
                    day = parseInt(parts[0]);
                    month = months[parseInt(parts[1]) - 1];
                    holidayEnd = (0, moment_1.default)().add(2, "weeks").format("DD-MM-YYYY");
                    partsEnd = holidayEnd.split("-");
                    dayEnd = parseInt(partsEnd[0]);
                    monthEnd = months[parseInt(partsEnd[1]) - 1];
                    text = "\n                #\u0412\u0430\u0436\u043D\u0430\u044F\u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \n\n\u0423\u0432\u0430\u0436\u0430\u0435\u043C\u044B\u0435 \u0441\u0442\u0443\u0434\u0435\u043D\u0442\u044B!\n\u0421 ".concat(day, " ").concat(month, " \u043F\u043E ").concat(dayEnd, " ").concat(monthEnd, ", \u0443 \u0432\u0430\u0441 \u0431\u0443\u0434\u0435\u0442 \u043D\u0435\u0434\u0435\u043B\u044F \u043A\u0430\u043D\u0438\u043A\u0443\u043B \uD83C\uDF89\n\u0425\u043E\u0440\u043E\u0448\u0435\u043D\u044C\u043A\u043E \u043E\u0442\u0434\u043E\u0445\u043D\u0438\u0442\u0435 \u0437\u0430 \u044D\u0442\u0443 \u043D\u0435\u0434\u0435\u043B\u044E \u0438 \u043D\u0430\u0431\u0435\u0440\u0438\u0442\u0435\u0441\u044C \u0441\u0438\u043B \uD83D\uDE0E\uD83D\uDE34\uD83E\uDDD8\n\n\u0412\u0441\u0435 \u0432\u0430\u0448\u0438 \u043F\u0440\u0435\u043F\u043E\u0434\u0430\u0432\u0430\u0442\u0435\u043B\u0438 \u0443\u0445\u043E\u0434\u044F\u0442 \u0432 \u043E\u0442\u043F\u0443\u0441\u043A. \u0421\u0430\u043F\u043F\u043E\u0440\u0442 \u0438 \u043B\u0435\u043A\u0446\u0438\u0438 \u0432 \u044D\u0442\u0443 \u043D\u0435\u0434\u0435\u043B\u044E \u043F\u0440\u043E\u0432\u043E\u0434\u0438\u0442\u044C\u0441\u044F \u043D\u0435 \u0431\u0443\u0434\u0443\u0442. \u041D\u0430 \u0432\u043E\u043F\u0440\u043E\u0441\u044B \u0432 \u0447\u0430\u0442\u0435 \u043F\u0440\u0435\u043F\u043E\u0434\u0430\u0432\u0430\u0442\u0435\u043B\u0438 \u043E\u0442\u0432\u0435\u0447\u0430\u0442\u044C \u043D\u0435 \u0431\u0443\u0434\u0443\u0442 (\u043D\u043E \u043C\u043E\u0433\u0443\u0442, \u043F\u043E \u043B\u0438\u0447\u043D\u043E\u0439 \u0438\u043D\u0438\u0446\u0438\u0430\u0442\u0438\u0432\u0435), \u0442\u0430\u043A \u0447\u0442\u043E \u0435\u0441\u043B\u0438 \u0432\u044B \u0437\u043D\u0430\u0435\u0442\u0435 \u043E\u0442\u0432\u0435\u0442 \u043D\u0430 \u0437\u0430\u0434\u0430\u043D\u043D\u044B\u0439 \u043E\u0434\u043D\u043E\u0433\u0440\u0443\u043F\u043F\u043D\u0438\u043A\u043E\u043C \u0432\u043E\u043F\u0440\u043E\u0441, \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u043E\u0442\u0432\u0435\u0447\u0430\u0439\u0442\u0435. \n\u0422\u0430\u043A \u0436\u0435 \u0432\u0430\u0436\u043D\u043E \u043F\u043E\u0434\u0442\u044F\u043D\u0443\u0442\u044C \u0443\u0441\u043F\u0435\u0432\u0430\u0435\u043C\u043E\u0441\u0442\u044C \u0438 \u0437\u0430\u043A\u0440\u044B\u0442\u044C \u043F\u0440\u043E\u0431\u0435\u043B\u044B, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u043E\u0441\u0442\u0430\u043B\u0438\u0441\u044C \u0441 \u043F\u0440\u043E\u0448\u043B\u044B\u0445 \u043F\u0435\u0440\u0438\u043E\u0434\u043E\u0432. \u041F\u043E \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u043C \u0432\u043E\u043F\u0440\u043E\u0441\u0430\u043C \u043F\u0438\u0448\u0438\u0442\u0435 \u0432 \u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044E.\n\n\u0421 ").concat(dayEnd, " ").concat(monthEnd, " \u0432\u0430\u0448\u0438 \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u0432\u043E\u0437\u043E\u0431\u043D\u043E\u0432\u044F\u0442\u0441\u044F \u0432 \u043E\u0431\u044B\u0447\u043D\u043E\u043C \u0440\u0435\u0436\u0438\u043C\u0435\u261D\uD83C\uDFFB\n\n\uD83C\uDFD6\u0425\u043E\u0440\u043E\u0448\u0435\u0433\u043E \u0432\u0441\u0435\u043C \u043E\u0442\u0434\u044B\u0445\u0430!\uD83D\uDC83\uD83D\uDD7A\n                ");
                    return [4 /*yield*/, bot.sendMessage(groups[i].chatId, text, {
                            parse_mode: "HTML"
                        })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    j++;
                    return [3 /*break*/, 2];
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
 * Функция для составления даты под moment
 */
function buildMomentDate(date) {
    var parts = date.split("-");
    var dt = new Date(parts[2] + "-" + parts[1] + "-" + parts[0]);
    return (0, moment_1.default)(dt);
}
var getDateOfNextExam = function (group) {
    var thisWeekSunday = (0, moment_1.default)().endOf('week');
    var diff = 4 - (((group.currentWeek + 1) % 4 ? (group.currentWeek + 1) % 4 : 4));
    for (var i = 0; i < group.holidayWeeksNumbers.length; i++) {
        if ((group.holidayWeeksNumbers[i] - group.currentWeek + 1) < diff || !group.isActive) {
            diff += 1;
        }
    }
    return thisWeekSunday.add(diff, "weeks").subtract(1, "days").format("DD-MM-YYYY");
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Проверка если бот админ или нет
 */
var isBotAdmin = function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var botId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bot.getMe()];
            case 1:
                botId = _a.sent();
                return [4 /*yield*/, bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
                        return c.status == "administrator";
                    })];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Блок по отправке сообщений от администрации, которые админы могут настраивать через сайт (админку)
 * Возможны ошибки, тестировал буквально один день, есть вероятность, что где-то что-то упустил.
 */
var buildSchedulersForAdminMessages = function () { return __awaiter(void 0, void 0, void 0, function () {
    var adm, groups, _loop_6, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger.info("Building ADMIN MESSAGES START");
                return [4 /*yield*/, admin_message_model_1.AdminMessage.find()];
            case 1:
                adm = _a.sent();
                return [4 /*yield*/, group_model_1.Group.find()];
            case 2:
                groups = _a.sent();
                _loop_6 = function (i) {
                    var _loop_7 = function (j) {
                        logger.info("Building started for message week and time (week) ".concat(adm[i].weeksAndTime[j].week, " - (min) ").concat(adm[i].weeksAndTime[j].time.minutes, " - (hours) ").concat(adm[i].weeksAndTime[j].time.hour));
                        node_schedule_1.default.scheduleJob("0 ".concat(adm[i].weeksAndTime[j].time.minutes, " ").concat(adm[i].weeksAndTime[j].time.hour, " * * ").concat(adm[i].weeksAndTime[j].time.day), function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, sendAdminMessages(groups, adm[i].message, adm[i].weeksAndTime[j].week)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    };
                    for (var j = 0; j < adm[i].weeksAndTime.length; j++) {
                        _loop_7(j);
                    }
                };
                for (i = 0; i < adm.length; i++) {
                    _loop_6(i);
                }
                return [2 /*return*/];
        }
    });
}); };
var sendAdminMessages = function (groups, message, week) { return __awaiter(void 0, void 0, void 0, function () {
    var j;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                j = 0;
                _a.label = 1;
            case 1:
                if (!(j < groups.length)) return [3 /*break*/, 4];
                logger.info("Checking ADMINMESSAGES group ".concat(groups[j].groupName, " whos week is ").concat(groups[j].currentWeek));
                if (!(week - 1 === groups[j].currentWeek)) return [3 /*break*/, 3];
                logger.info("SUCCESS ADMINMESSAGES group ".concat(groups[j].groupName, " whos week is ").concat(groups[j].currentWeek));
                return [4 /*yield*/, bot.sendMessage(groups[j].chatId, "".concat(message), {
                        parse_mode: "HTML"
                    })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                j++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
var relaunchSchedulers = function () { return __awaiter(void 0, void 0, void 0, function () {
    var jobNames, _i, jobNames_1, name_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                jobNames = lodash_1.default.keys(node_schedule_1.default.scheduledJobs);
                for (_i = 0, jobNames_1 = jobNames; _i < jobNames_1.length; _i++) {
                    name_1 = jobNames_1[_i];
                    node_schedule_1.default.cancelJob(name_1);
                }
                buildMainWeekSchedulers();
                return [4 /*yield*/, buildSchedulersForAdminMessages()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Пути чтобы создавать сообщения, менять, удалять и получать логи
 */
app.get("/adminMessages", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var adm, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, admin_message_model_1.AdminMessage.find()];
            case 1:
                adm = _a.sent();
                res.send(adm);
                return [3 /*break*/, 3];
            case 2:
                e_2 = _a.sent();
                res.status(500).send({ message: "Nothing was found" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post("/adminMessages", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var adminMessage, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                if (!(config_1.config.password === req.headers.pass)) return [3 /*break*/, 3];
                adminMessage = new admin_message_model_1.AdminMessage(req.body);
                return [4 /*yield*/, adminMessage.save()];
            case 1:
                _a.sent();
                return [4 /*yield*/, relaunchSchedulers()];
            case 2:
                _a.sent();
                res.send(adminMessage);
                return [3 /*break*/, 4];
            case 3:
                res.status(403).send({ message: "unauthorized" });
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                e_3 = _a.sent();
                res.status(400).send({ message: "Wrong data provided" });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.post("/updateAdminMessage/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var adminMessage, e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                if (!(config_1.config.password === req.headers.pass)) return [3 /*break*/, 3];
                return [4 /*yield*/, admin_message_model_1.AdminMessage.findOneAndUpdate({ _id: req.params.id }, req.body, {
                        new: true
                    })];
            case 1:
                adminMessage = _a.sent();
                return [4 /*yield*/, relaunchSchedulers()];
            case 2:
                _a.sent();
                res.send(adminMessage);
                return [3 /*break*/, 4];
            case 3:
                res.status(403).send({ message: "unauthorized" });
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                e_4 = _a.sent();
                res.status(400).send({ message: "Wrong data provided" });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.delete("/delete/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                if (!(config_1.config.password === req.headers.pass)) return [3 /*break*/, 3];
                return [4 /*yield*/, admin_message_model_1.AdminMessage.findOneAndDelete({ _id: req.params.id })];
            case 1:
                _a.sent();
                return [4 /*yield*/, relaunchSchedulers()];
            case 2:
                _a.sent();
                res.send({ message: "delete success" });
                return [3 /*break*/, 4];
            case 3:
                res.status(403).send({ message: "unauthorized" });
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                e_5 = _a.sent();
                res.status(400).send({ message: "Wrong data provided" });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.get("/logs/:date", function (req, res) {
    try {
        var date = req.params.date;
        var logs = fs.readFileSync(path.join(__dirname, "/logs/".concat(date, "/logs.txt")), 'utf8');
        var arr = logs.split("\n");
        res.send(arr);
    }
    catch (e) {
        res.status(404).send({ message: "Nothing was found" });
    }
});
//# sourceMappingURL=index.js.map