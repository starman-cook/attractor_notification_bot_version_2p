import express from 'express'
import TelegramBot from 'node-telegram-bot-api'
import cors from "cors"
import mongoose from 'mongoose'
import {config} from "./app/config";
import {Lesson} from "./app/models/lesson_model";
import schedule from 'node-schedule'
import moment from 'moment'
import {LessonInterface} from './app/interfaces/lesson_interface'


/**
 8. Создать функционал логирования ошибок работы бота
 9. Реализовать функционал отправки логов ошибок по расписанию *****
 */

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Подключение Mongoose
 */
mongoose.connect(config.mongoUrl.url + config.mongoUrl.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("Mongo connected")
    })
    .catch(err => {
        console.log(err)
    })

/**
 * Подключение express
 */
const app: express.Application = express();
app.use(cors())
app.use(express.json())
app.listen(config.telegramPort, () => {
    console.log('connected to port ' + config.telegramPort)
})

/**
 * Подключение телеграм бота
 */
const bot = new TelegramBot(config.telegramToken, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Необходимые переменные
 */
const weekDays: any = {
    "1": "понедельникам",
    "2": "вторникам",
    "3": "средам",
    "4": "четвергам",
    "5": "пятницам",
    "6": "субботам",
    "7": "воскресеньям",
}
const lessonTime: any = {
    "evening": "19:30 до 21:30",
    "lunch": "16:00 до 18:00"
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Здесь мы получаем сегодняшнюю дату в нужном формате, плюс создаем переменные для остлеживания даты субботы и пятницы (для контрольной и дедлайна оплаты)
 * Затем проверяем каждый день недели для отправки необходимых сообщений подходящим по параметрам группам
 */
let dateOfNextSaturday;
let dateOnFriday;

/**
 * Понедельник
 */
schedule.scheduleJob("1 0 13 * * 1", async () => {
    const lesson = await Lesson.find()
    await buildEndOfTestPeriodMessage(lesson)
    await buildCongratulationMessageAfterFirstExam(lesson)
    await buildMessageAboutDiscountAndDeadlines(lesson)
    await buildCheatingIsBadMessage(lesson)
    dateOnFriday = moment().add(4, "days").format("DD-MM-YYYY")
    await buildPaymentNotificationMessage(lesson, dateOnFriday)
    dateOfNextSaturday = moment().add(5, "days").format("DD-MM-YYYY")
    await buildExamMessageBeforeActualDate(lesson, dateOfNextSaturday)
    await buildTheMessageWithConditions(lesson, "1")
})
/**
 * Вторник
 */
schedule.scheduleJob("1 0 13 * * 2", async () => {
    const lesson = await Lesson.find()
    await buildVisitAttractorMessage(lesson)
    await buildWebinarMessage(lesson, "2")
    dateOnFriday = moment().add(3, "days").format("DD-MM-YYYY")
    await buildPaymentNotificationMessage(lesson, dateOnFriday)
    dateOfNextSaturday = moment().add(4, "days").format("DD-MM-YYYY")
    await buildExamMessageBeforeActualDate(lesson, dateOfNextSaturday)
    await buildTheMessageWithConditions(lesson, "2")
})
/**
 * Среда
 */
schedule.scheduleJob("1 0 13 * * 3", async () => {
    const lesson = await Lesson.find()
    await buildWebinarMessage(lesson, "3")
    dateOnFriday = moment().add(2, "days").format("DD-MM-YYYY")
    await buildPaymentNotificationMessage(lesson, dateOnFriday)
    dateOfNextSaturday = moment().add(3, "days").format("DD-MM-YYYY")
    await buildExamMessageBeforeActualDate(lesson, dateOfNextSaturday)
    await buildTheMessageWithConditions(lesson, "3")
})
/**
 * Четверг
 */
schedule.scheduleJob("1 0 13 * * 4", async () => {
    const lesson = await Lesson.find()
    await buildIndividualLessonsAnnounce(lesson)
    dateOnFriday = moment().add(1, "days").format("DD-MM-YYYY")
    await buildPaymentNotificationMessage(lesson, dateOnFriday)
    dateOfNextSaturday = moment().add(2, "days").format("DD-MM-YYYY")
    await buildExamMessageBeforeActualDate(lesson, dateOfNextSaturday)
    await buildTheMessageWithConditions(lesson, "4")
})
/**
 * Пятница
 */
schedule.scheduleJob("1 0 13 * * 5", async () => {
    const lesson = await Lesson.find()
    await buildWebinarMessage(lesson, "5")
    dateOnFriday = moment().format("DD-MM-YYYY")
    dateOfNextSaturday = moment().add(1, "days").format("DD-MM-YYYY")
    await buildExamMessageBeforeActualDate(lesson, dateOfNextSaturday)
    await buildTheMessageWithConditions(lesson, "5")
    await buildPaymentNotificationMessage(lesson, dateOnFriday)
    await buildEndOfTestPeriodFinalLastMessage(lesson)
})

schedule.scheduleJob("1 0 18 * * 5", async () => {
    const lesson = await Lesson.find()
    await buildWishGoodLuckMessageForFirstExam(lesson)
})
/**
 * Суббота
 */
schedule.scheduleJob("1 0 10 * * 6", async () => {
    const lesson = await Lesson.find()
    await buildExamMessage(lesson)
    await buildTheMessageWithConditions(lesson, "6")
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Здесь мы создаем группу, указывая по каким дням занятия, когда вебинары, когда каникулы, какое текущее занятие и контрольная,
 * если вызвать функцию вновь, то предыдущая модель группы с данными будет удалена и на ее место встанет новая
 */
bot.onText(/\/build_(.+)/, async (msg, arr: any) => {
    let isBotAdmin: boolean = false;
    const botId: any = await bot.getMe()
    await bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
        if (c.status == "administrator") {
            isBotAdmin = true
        }
    });
    if (isBotAdmin) {
        const admins = await  bot.getChatAdministrators(msg.chat.id)
        let admin = false;
        for (let i = 0; i < admins.length; i++) {
            if (admins[i].user.id === msg.from!.id) {
                admin = true
            }
        }
        if (admin) {
            try {

                const ii = arr[1].replace(/\s+/g,' ').trim().split(" ")
                const oldLesson = await Lesson.findOne({chatId: msg.chat.id})
                if (oldLesson) {
                    oldLesson.delete()
                }
                const lesson = await new Lesson({
                    chatId: msg.chat.id,
                    groupName: ii[0],
                    lessonDayOne: ii[1],
                    lessonDayTwo: ii[2],
                    webinarOne: ii[3],
                    webinarTwo: ii[4],
                    time: ii[5],
                    holidayOne: ii[6], // DateTime format DD-MM-YYYY
                    holidayTwo: ii[7], // DateTime format DD-MM-YYYY
                    lessonNumber: parseInt(ii[8]),
                    examNumber: ii[9]
                })
                lesson.save()
                const send = await bot.sendMessage(msg.chat.id, "Регистрация прошла успешно, ваше сообщение будет удалено автоматически через 20 секунд")

                setTimeout(() => {
                    bot.deleteMessage(msg.chat.id, send.message_id.toString())
                    bot.deleteMessage(msg.chat.id, msg.message_id.toString())
                }, 20000)
            } catch(err) {
                await bot.sendMessage(msg.chat.id, "Неверный ввод")
            }
        } else {
            const funnyResponse = `
<b>Катаны звуки</b>
<b>Самурай промахнулся</b>
<b>Сэппуку выход</b>
        `
            const send = await bot.sendMessage(msg.chat.id, funnyResponse, {
                parse_mode: "HTML"
            })
            setTimeout(() => {
                bot.deleteMessage(msg.chat.id, msg.message_id.toString())
                bot.deleteMessage(msg.chat.id, send.message_id.toString())
            }, 30000) // 30 секунд до удаления сообщения
        }
    } else {
        await bot.sendMessage(msg.chat.id, "Ничего я не создам, пока я не админ")
    }

})

/**
 * Внесение изменений в нумерацию, можно поменять номер следующего занятия и следующей контрольной
 * НАПОМИНАНИЕ: добавить данное описание в инструкцию
 */
bot.onText(/\/setup_(.+)/, async (msg, arr: any) => {
    let isBotAdmin: boolean = false;
    const botId: any = await bot.getMe()
    await bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
        if (c.status == "administrator") {
            isBotAdmin = true
        }
    });
    if (isBotAdmin) {
        const admins = await bot.getChatAdministrators(msg.chat.id)
        let admin = false;
        for (let i = 0; i < admins.length; i++) {
            if (admins[i].user.id === msg.from!.id) {
                admin = true
            }
        }
        if (admin) {
            try {
                const typeAndNumber = arr[1].replace(/\s+/g, ' ').trim().split(" ")
                const lesson = await Lesson.findOne({chatId: msg.chat.id})
                if (typeAndNumber[0] === "lesson" && typeAndNumber.length === 2) {
                    lesson.lessonNumber = typeAndNumber[1]
                    lesson.save()
                    await bot.sendMessage(msg.chat.id, `Номер следующего занятия изменен на ${typeAndNumber[1]}`)
                } else if (typeAndNumber[0] === "exam" && typeAndNumber.length === 2) {
                    lesson.examNumber = typeAndNumber[1]
                    lesson.save()
                    await bot.sendMessage(msg.chat.id, `Номер следующей контрольной изменен на ${typeAndNumber[1]}`)
                } else {
                    await bot.sendMessage(msg.chat.id, "Неверный ввод")
                }
            } catch (err) {
                await bot.sendMessage(msg.chat.id, "Неверный ввод")
            }
        } else {
            const funnyResponse = `
<b>Править данные</b>
<b>Сёгунату дано лишь</b>
<b>Ступай человек</b>
        `
            const send = await bot.sendMessage(msg.chat.id, funnyResponse, {
                parse_mode: "HTML"
            })
            setTimeout(() => {
                bot.deleteMessage(msg.chat.id, msg.message_id.toString())
                bot.deleteMessage(msg.chat.id, send.message_id.toString())
            }, 30000) // 30 секунд до удаления сообщения
        }
    } else {
        await bot.sendMessage(msg.chat.id, "Ничего я не поменяю, пока я не админ")
    }
})

/**
 * Установка даты последнего занятия, эта дата нужна для определения следующей контрольной, и эта дата сама устанавливается автоматически после оповещения о предстоящем занятии
 * Но этой функцией нужно установить дату Первого занятия новой группы в самом начале только для того, чтобы продемонстрировать группе
 * что можно проверять данные своей группы, с датой следующей контрольной, датами каникул, номеров занятий и контрольных и прочего
 */
bot.onText(/\/putdate_(.+)/, async (msg, arr: any) => {
    let isBotAdmin: boolean = false;
    const botId: any = await bot.getMe()
    await bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
        if (c.status == "administrator") {
            isBotAdmin = true
        }
    });
    if (isBotAdmin) {
        const admins = await bot.getChatAdministrators(msg.chat.id)
        let admin = false;
        for (let i = 0; i < admins.length; i++) {
            if (admins[i].user.id === msg.from!.id) {
                admin = true
            }
        }
        if (admin) {
            try {
                const lesson = await Lesson.findOne({chatId: msg.chat.id})
                lesson.dateOfLastLesson = arr[1]
                await lesson.save()
                await bot.sendMessage(msg.chat.id, `Дата последнего занятия изменена на ${arr[1]}`)
            } catch (err) {
                await bot.sendMessage(msg.chat.id, "Неверный ввод")
            }
        } else {
            const funnyResponse = `
<b>Числа меняешь</b>
<b>Урока первого ты</b>
<b>Лучше не надо</b>
        `
            const send = await bot.sendMessage(msg.chat.id, funnyResponse, {
                parse_mode: "HTML"
            })
            setTimeout(() => {
                bot.deleteMessage(msg.chat.id, msg.message_id.toString())
                bot.deleteMessage(msg.chat.id, send.message_id.toString())
            }, 30000) // 30 секунд до удаления сообщения
        }
    } else {
        await bot.sendMessage(msg.chat.id, "Ничего я не поменяю, пока я не админ")
    }
})

/**
 * Установка имени администратора группы, желательно добавлять с номером контактов и телефона, чтобы было информативнее для студентов
 * Функция принимает все что написано после нижнего подчеркивания, можно написать что-угодно и это созранится в поле groupAdmin в группе
 */
bot.onText(/\/setadmin_(.+)/, async (msg, arr: any) => {
    let isBotAdmin: boolean = false;
    const botId: any = await bot.getMe()
    await bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
        if (c.status == "administrator") {
            isBotAdmin = true
        }
    });
    if (isBotAdmin) {
        const admins = await bot.getChatAdministrators(msg.chat.id)
        let admin = false;
        for (let i = 0; i < admins.length; i++) {
            if (admins[i].user.id === msg.from!.id) {
                admin = true
            }
        }
        if (admin) {
            try {
                const lesson = await Lesson.findOne({chatId: msg.chat.id})
                lesson.groupAdmin = arr[1]
                await lesson.save()
                await bot.sendMessage(msg.chat.id, `Админ этой группы ${arr[1]}`)
            } catch (err) {
                await bot.sendMessage(msg.chat.id, "Неверный ввод")
            }
        } else {
            const funnyResponse = `
<b>Админа менять</b>
<b>Нельзя группы текущей </b>
<b>Уже решено</b>
        `
            const send = await bot.sendMessage(msg.chat.id, funnyResponse, {
                parse_mode: "HTML"
            })
            setTimeout(() => {
                bot.deleteMessage(msg.chat.id, msg.message_id.toString())
                bot.deleteMessage(msg.chat.id, send.message_id.toString())
            }, 30000) // 30 секунд до удаления сообщения
        }
    } else {
        await bot.sendMessage(msg.chat.id, "Ничего я не поменяю, пока я не админ")
    }
})

/**
 * Получение инструкций, команда скрыта, нужно писать ее через / без единой ошибки, если студенты получат к ней доступ, то могут сломать бота
 */
bot.onText(/\/givemetheinstructionsplease/, async (msg) => {
    let isBotAdmin: boolean = false;
    const botId: any = await bot.getMe()
    await bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
        if (c.status == "administrator") {
            isBotAdmin = true
        }
    });
    if (isBotAdmin) {
        const isPrivate = msg.chat.type === "private"
        if (!isPrivate) {
            const admins = await bot.getChatAdministrators(msg.chat.id)
            let admin = false;
            for (let i = 0; i < admins.length; i++) {
                if (admins[i].user.id === msg.from!.id) {
                    admin = true
                }
            }
            if (admin) {
                try {
                    const text: string = ` 
        <strong>----------------------------------------------------------------</strong>
        
        <b>Привет дорогой создатель группы!</b>

        
        <pre>Это инструкция по созданию группы для оповещения студентов о занятиях, контрольных, оплатах и каникулах</pre>
        <pre>Все что нужно сделать это ввести <b>/build_</b> затем не ставя пробел ввести первый параметр, и затем уже через пробелы все остальные пармаетры.</pre>
        <pre>Всего параметров 9 штук. Но не пугайтесь, вы всегда можете проверить данные вашей группы и перезаписать ее; то есть при повторении команды <b>/build_</b> со всеми парметрами удалит старую запись и создаст новую</pre>
        
        <b>Какие есть параметры:</b>
        
        <b>Имя группы:</b><pre>Пишите название без пробелов в названии</pre>
        <b>День занятия номер 1:</b><pre>Пишите числом 1 это понедельник, 2 вторник</pre>
        <b>День занятия номер 2:</b><pre>Также числом 4 это четверг, 5 пятница</pre>
        <b>День вебинара номер 1:</b><pre>Пишем номер дня, где 1 это понедельник, 2 вторник и тд, иначе пишем null</pre>
        <b>День вебинара номер 2:</b><pre>Тоже самое, что и для первого дня вебинара, ставим число соответсвенно дня недели, либо просто пишем null</pre>
        <b>Время занятий:</b><pre>Есть два варианта либо evening либо lunch, вечерняя и дневная группы соответсвенно</pre>
        <b>Дата первых каникул:</b><pre>Укажите дату в формате dd-mm-yyyy (от этой даты считается неделя каникул)</pre>
        <b>Дата вторых каникул:</b><pre>Также укажите дату в формате dd-mm-yyyy</pre>
        <b>Номер текущего следующего занятия:</b><pre>Просто номер укажите числом</pre>
        <b>Номер следующей контрольной:</b><pre>Также просто номер числом укажите</pre>
        
        <b>Например мы создаем группу JS-5 с занятиями по понедельникам и четвергам, вебинарами только по средам, учебой в дневное время, каникулами на новый год и неделей в августе (15 числа), с самым первым занятием и первой предстоящей контрольной:</b>
        <pre>/build_JS-5 1 4 3 null lunch 27-12-2020 15-08-2021 1 1</pre>
        
        <pre>Готово))</pre>
        
        <b>PS:</b>
        
        <pre>Вы также можете редактировать номер следующего занятия или контрольной, вводите команду /setup_ и затем exam или lesson и через пробел на какой номер вы хотите поменять.</pre>
        <pre>Например, /setup_lesson 83 мы меняем номер следующего занятия на 83, или /setup_exam 9 мы ставим номер следующей контрольной 9</pre>
        
        <b>PPS:</b>
        
        <pre>Еще можно менять дату текущего (последнего, следующего, это все одно и то же занятие на самом деле) занятия, это скорее всего понадобится сделать только один раз (и то, если этого не сделать все само собой поставится после первого уведомления) для демонстрации на ориентации</pre>
        <pre>Напишите команду /putdate_ и сразу без пробела напишите дату для последнего занятия. На ориентации это будет дата первого занятия кстати, так как счет идет с 1, и от этой даты и от этого занятия произойдет расчет даты следующей контрольной!</pre>
        <pre>Дату пишем в формате dd-mm-yyyy</pre>
        <pre>Например, /putdate_20-04-2021 значит, что дата "текущего" занятия 20 апреля 2021 года</pre>
        <pre>Короче, при создании группы мы же в команде /build_ в конце напишем 1 1 так как следующее занятие 1 и следующая контрольная 1. Так вот для вот этого 1 (первого) занятия нужно указать настоящую дату, когда это занятие будет и все)))</pre>
        
         <b>PPPS:</b>
         <pre>Чтобы посмотреть данные всех групп, введите команду /allgroups в личной переписке с ботом</pre>
         
         <b>PPPPS:</b>
         <pre>Чтобы удалить группу, напишите хоть лично, хоть в группе команду /delete_ затем id группы (можно получить с помощью /allgroups) и затем через пробел пароль, пароль знают админы</pre>
         <pre>Например, кто-то создал левую ненужную или тестовую группу с id 608ce9694d1311418c93ec9f</pre>
         <pre>Чтобы удалить эту группу напишите /delete_608ce9694d1311418c93ec9f ****** (где ****** это пароль)</pre>

                                            <pre>           &#9774; &#9774; &#9774; &#9774; &#9774; &#9774; &#9774; &#9774; &#9774;</pre>
        
        <strong>----------------------------------------------------------------</strong>
`
                    await bot.sendMessage(msg.chat.id, text, {
                        parse_mode: "HTML"
                    })
                } catch (err) {
                    await bot.sendMessage(msg.chat.id, "Что то рухнуло и сломалось")
                }
            } else {
                const funnyResponse = `
<b>Узреть желаешь</b>
<b>Инструкцию программы</b>
<b>Пустота кругом</b>
        `
                const send = await bot.sendMessage(msg.chat.id, funnyResponse, {
                    parse_mode: "HTML"
                })
                setTimeout(() => {
                    bot.deleteMessage(msg.chat.id, msg.message_id.toString())
                    bot.deleteMessage(msg.chat.id, send.message_id.toString())
                }, 15000) // 15 секунд до удаления сообщения
            }
        } else {
            await bot.sendMessage(msg.chat.id, "Лишь в групповом чате отвечаю я на данную команду")
        }
    } else {
        await bot.sendMessage(msg.chat.id, "Ничего я не покажу, пока я не админ")
    }
})

/**
 * Данная функция доступна всем (возможно добавим ее через BotFather в видимые команды), сообщение показывает данные по группе, текущему занятию, датой следующей контрольной
 * Сообщение автоматически удаляется спустя некоторое время
 */
bot.onText(/\/show/, async (msg) => {
    let isBotAdmin: boolean = false;
    const botId: any = await bot.getMe()
    await bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
        if (c.status == "administrator") {
            isBotAdmin = true
        }
    });
    if (isBotAdmin) {
    try {
        const lesson = await Lesson.findOne({chatId: msg.chat.id})
        let dif: number
        if (lesson.lessonNumber > 1) {
            dif = (lesson.lessonNumber - 1) % 8
        } else {
            dif = lesson.lessonNumber % 8
        }
        const arrWithRestDays = [{key: 1, value: 26}, {key: 2, value: 23}, {key: 3, value: 19}, {key: 4, value: 16}, {key: 5, value: 12}, {key: 6, value: 9}, {key: 7, value: 5},  {key: 0, value: 2}]
        let result = 0
        arrWithRestDays.forEach((el: any) => {
            if (el.key === dif) {
                result = el.value
            }
        })
        if (lesson.lessonDayOne === "2") result -= 1
        const nextSaturdaySimpleDate = buildMomentDate(lesson.dateOfLastLesson).add(result, "days")
        const monthBeforeExam = buildMomentDate(lesson.dateOfLastLesson).add(result, "days").subtract(28, 'days')
        const holidayOne = buildMomentDate(lesson.holidayOne)
        const holidayTwo = buildMomentDate(lesson.holidayTwo)
        if ((holidayOne < nextSaturdaySimpleDate && holidayOne >= monthBeforeExam) || (holidayTwo < nextSaturdaySimpleDate && holidayTwo >= monthBeforeExam)) {
            result += 7
        }
        dateOfNextSaturday = buildMomentDate(lesson.dateOfLastLesson).add(result, "days").format("DD-MM-YYYY")

        const text = `

<strong>--------------------------------------</strong>


<strong>Данные по вашей группе</strong>
        
        
<b>Ваша группа </b><pre>${lesson.groupName}</pre>

<b>Вы учитесь по </b><pre>${weekDays[lesson.lessonDayOne]} и ${weekDays[lesson.lessonDayTwo]}</pre>

<b>По времени c </b><pre>${lessonTime[lesson.time]}</pre>

<b>Вебинары по </b><pre>${weekDays[lesson.webinarOne]}  ${weekDays[lesson.webinarTwo] ? " и по " + weekDays[lesson.webinarTwo] : ""}</pre>

<b>Номер следующего занятия </b><pre>#${lesson.lessonNumber}</pre>

<b>Контрольная </b><pre>#${lesson.examNumber} будет в субботу ${dateOfNextSaturday}</pre>     

<b>Первые каникулы</b><pre>#${lesson.holidayOne}</pre> 
     
<b>Вторые каникулы</b><pre>#${lesson.holidayTwo}</pre> 

<b>Админ вашей группы</b><pre>#${lesson.groupAdmin}</pre> 
     
<strong>--------------------------------------</strong>
 
`

        const send = await bot.sendMessage(msg.chat.id, text, {
            parse_mode: "HTML"
        })
        setTimeout(() => {
            bot.deleteMessage(msg.chat.id, msg.message_id.toString())
            bot.deleteMessage(msg.chat.id, send.message_id.toString())
        }, 30000) // 30 секунд до удаления сообщения
    } catch(err) {
        await bot.sendMessage(msg.chat.id, "Группа еще не создана")
    }
    } else{
            await bot.sendMessage(msg.chat.id, "Хочу быть админом, иначе ничего не покажу")
    }
})

/**
 * Функции для выгрузки данных по всем группам
 * Доступно только при личной переписке с ботом, команда доступна всем
 * Подсказки данной команды нет, нужно вводить самому без ошибок, иначе не сработает
 */
bot.onText(/\/allgroups/, async (msg) => {
    const isPrivate = msg.chat.type === "private"
    const arrWithRestDays = [{key: 1, value: 26}, {key: 2, value: 23}, {key: 3, value: 19}, {key: 4, value: 16}, {key: 5, value: 12}, {key: 6, value: 9}, {key: 7, value: 5},  {key: 0, value: 2}]
    if (isPrivate) {
        try {
            const lesson = await Lesson.find()
            if (lesson.length === 0) {
                await bot.sendMessage(msg.chat.id, "Групп в наличии нет, какой кошмар")
            }
            for (let i = 0; i < lesson.length; i++) {
                const totalAmountOfUsers: number = await bot.getChatMembersCount(lesson[i].chatId)
                const admins = await bot.getChatAdministrators(lesson[i].chatId)
                const amountWithoutAdmins: number = totalAmountOfUsers - admins.length
                let dif: number
                if (lesson[i].lessonNumber > 1) {
                    dif = (lesson[i].lessonNumber - 1) % 8
                } else {
                    dif = lesson[i].lessonNumber % 8
                }

                let result = 0
                arrWithRestDays.map((el: any) => {
                    if (el.key === dif) {
                        result = el.value
                        return null
                    }
                })

                if (lesson[i].lessonDayOne === "2") result -= 1
                const nextSaturdaySimpleDate = buildMomentDate(lesson[i].dateOfLastLesson).add(result, "days")
                const monthBeforeExam = buildMomentDate(lesson[i].dateOfLastLesson).add(result, "days").subtract(28, 'days')
                const holidayOne = buildMomentDate(lesson[i].holidayOne)
                const holidayTwo = buildMomentDate(lesson[i].holidayTwo)
                if ((holidayOne < nextSaturdaySimpleDate && holidayOne >= monthBeforeExam) || (holidayTwo < nextSaturdaySimpleDate && holidayTwo >= monthBeforeExam)) {
                    result += 7
                }
                dateOfNextSaturday = buildMomentDate(lesson[i].dateOfLastLesson).add(result, "days").format("DD-MM-YYYY")

                const text = `

<strong>--------------------------------------</strong>

<b>Данные по группе </b><pre>${lesson[i].groupName}</pre>

<b>Людей в чате группы </b><pre>${totalAmountOfUsers}</pre>

<b>Людей в чате без админов </b><pre>${amountWithoutAdmins}</pre>

<b>Учебные дни по </b><pre>${weekDays[lesson[i].lessonDayOne]} и ${weekDays[lesson[i].lessonDayTwo]}</pre>

<b>По времени c </b><pre>${lessonTime[lesson[i].time]}</pre>

<b>Вебинары по </b><pre>${weekDays[lesson[i].webinarOne]}  ${weekDays[lesson[i].webinarTwo] ? " и по " + weekDays[lesson[i].webinarTwo] : ""}</pre>

<b>Номер следующего занятия </b><pre>#${lesson[i].lessonNumber}</pre>

<b>Контрольная </b><pre>#${lesson[i].examNumber} будет в субботу ${dateOfNextSaturday}</pre>

<b>Первые каникулы</b><pre>#${lesson[i].holidayOne}</pre>

<b>Вторые каникулы</b><pre>#${lesson[i].holidayTwo}</pre>

<b>Админ этой группы</b><pre>#${lesson[i].groupAdmin}</pre> 

<b>ID группы</b><pre>${lesson[i]._id}</pre>

<strong>--------------------------------------</strong>

`
                await bot.sendMessage(msg.chat.id, (i+1).toString())
                await bot.sendMessage(msg.chat.id, text, {
                    parse_mode: "HTML"
                })
            }
        } catch(err) {
            await bot.sendMessage(msg.chat.id, "Что то рухнуло и сломалось")
        }
    } else {
        await bot.sendMessage(msg.chat.id, "Напиши мне эту команду лично пожалуйста, я не могу когда все смотрят")
    }
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Функция для удаления группы, удалять можно любую группу, это сделано потому, что кто угодно может создать групповой чат с ботом и создать левую группу, которая будет падать в список групп и засорять его
 * Но вы наверное думаете, так и удалить кто угодно сможет, это ж капец. Но не бесспокойтесь, чтобы удалить группу, нужно ввести пароль
 * Вы вводите команду /delete_ затем id группы для удаления (id можно получить из списка всех групп, это нужно потому, что имена могут быть одиннаковыми) и затем через пробел пишите пароль
 * Пароль пока не придумал где хранить, пусть это будет coolPasha
 */
bot.onText(/\/delete_(.+)/, async (msg, arr: any) => {
    const funnyResponse = `
<b>Группу удалить</b>
<b>Оставить пустоту нам</b>
<b>Вам мало чести</b>
        `
        try {
            const ii = arr[1].replace(/\s+/g,' ').trim().split(" ")
            const lesson = await Lesson.findOne({_id: ii[0]})
            if (ii[1] === "coolPasha") {
                await lesson.delete()
                await bot.sendMessage(msg.chat.id, `Группа ${lesson.groupName} успешно удалена из базы`)
            } else {
                await bot.sendMessage(msg.chat.id, funnyResponse, {
                    parse_mode: "HTML"
                })
            }
        } catch (err) {
            await bot.sendMessage(msg.chat.id, funnyResponse, {
                parse_mode: "HTML"
            })
        }
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Квест, разные команды, которые ведут к новым задачам, ответы буду писать в описании к каждой команде
 */

/**
 * Первый шифр, азбука Морзе, отправляется аудиофайлом. Зашифрованная команда gotonext
 */
bot.onText(/\/letsplay/, async (msg) => {
    let isBotAdmin: boolean = false;
    const botId: any = await bot.getMe()
    await bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
        if (c.status == "administrator") {
            isBotAdmin =  true
        }
    });
    if (isBotAdmin) {
        try {
            const text = `
            <b>Как команду напиши мне что ты слышишь в этом файле</b>
        `
            const send = await bot.sendAudio(msg.chat.id, "./ciphers/guesswhat.wav", {
                caption: text,
                parse_mode: "HTML"
            })
            await setTimeout(() => {
                bot.deleteMessage(msg.chat.id, msg.message_id.toString())
                bot.deleteMessage(msg.chat.id, send.message_id.toString())
            }, 120000)
        } catch (err) {
            await bot.sendMessage(msg.chat.id, "Похоже что-то случилось с соединением, или вы звбыли сделать бота админом в групповом чате, или у вас руки кривые))) сообщите саппорту о проблеме")
        }
    } else {
        await bot.sendMessage(msg.chat.id, "Я бы с радостью показал и затем удалил квестовое сообщение, но я лишь обычный юзер, а не админ((((")
    }
})

/**
 *  Это обычный код цезаря, его можно получить только в личной переписке. Если кто-то напишет команду в общий чат, то команда сразу удалится
 *  чтобы никто не скопировал то, что смог найти другой. Шифр имеет отступ +7 символов, ведет к команде stepthree
 */
bot.onText(/\/gotonext/, async (msg) => {
    let isBotAdmin: boolean = false;
    const botId: any = await bot.getMe()
    await bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
        if (c.status == "administrator") {
            isBotAdmin = true
        }
    });
        try {
            const isPrivate = msg.chat.type === "private"
            if (isPrivate) {
                await bot.sendMessage(msg.chat.id, "dypal uvd wslhzl av tl aol jvtthuk zalwaoyll")
            } else {
                if (isBotAdmin) {
                    const send = await bot.sendMessage(msg.chat.id, "Напиши мне эту команду лично, я не могу при всех")
                    await bot.deleteMessage(msg.chat.id, msg.message_id.toString())
                    await setTimeout(() => {
                        bot.deleteMessage(msg.chat.id, send.message_id.toString())
                    }, 7000)
                } else {
                    await bot.sendMessage(msg.chat.id, "Как вы узнали эту команду при том, что я не админ?? Вы читер?")
                }
            }
        } catch (err) {
            await bot.sendMessage(msg.chat.id, "Похоже что-то случилось с соединением, или вы звбыли сделать бота админом в групповом чате, или у вас руки кривые))) сообщите саппорту о проблеме")
        }
})

/**
 *  Код перебора, в каждой группе букв берем сначала все первые буквы подряд, потом вторые и так далее, пока не получим предложение.
 *  Код ведет к команде website (исходное предложение you are on the right way my friend now write me the command website)
 */
bot.onText(/\/stepthree/, async (msg) => {
    let isBotAdmin: boolean = false;
    const botId: any = await bot.getMe()
    await bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
        if (c.status == "administrator") {
            isBotAdmin = true
        }
    });
        try {
            const isPrivate = msg.chat.type === "private"
            if (isPrivate) {
                await bot.sendMessage(msg.chat.id, "yhynen oemotd urywhw aifwee rgrrcb ehiios otetmi nwnemt tadmae")
            } else {
                if (isBotAdmin) {
                    const send = await bot.sendMessage(msg.chat.id, "Если второй шаг был в личной переписке, почему третий должен быть в общем чате?")
                    await bot.deleteMessage(msg.chat.id, msg.message_id.toString())
                    await setTimeout(() => {
                        bot.deleteMessage(msg.chat.id, send.message_id.toString())
                    }, 7000)
                } else {
                    await bot.sendMessage(msg.chat.id, "Похоже да, вы читер, фуууу")
                }
            }
        } catch (err) {
            await bot.sendMessage(msg.chat.id, "Похоже что-то случилось с соединением, или вы звбыли сделать бота админом в групповом чате, или у вас руки кривые))) сообщите саппорту о проблеме")

        }
})

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
bot.onText(/\/website/, async (msg) => {
    let isBotAdmin: boolean = false;
    const botId: any = await bot.getMe()
    await bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
        if (c.status == "administrator") {
            isBotAdmin = true
        }
    });
        try {
            const isPrivate = msg.chat.type === "private"
            if (isPrivate) {
                await bot.sendMessage(msg.chat.id, "https://starman-cook.github.io/cipher/html.html")
            } else {
                if (isBotAdmin) {
                    const send = await bot.sendMessage(msg.chat.id, "Вы издеваетесь))?")
                    await bot.deleteMessage(msg.chat.id, msg.message_id.toString())
                    await setTimeout(() => {
                        bot.deleteMessage(msg.chat.id, send.message_id.toString())
                    }, 7000)
                }   else {
                    await bot.sendMessage(msg.chat.id, "Я читеру бы написал 'Вы издеваетесь?', но я не админ, поэтому пишу всякую фигню... ")
                }
            }
        } catch (err) {
            await bot.sendMessage(msg.chat.id, "Похоже что-то случилось с соединением, или вы звбыли сделать бота админом в групповом чате, или у вас руки кривые))) сообщите саппорту о проблеме")

        }
})

/**
 *  Это финальная задача, довольно сложная. Код типа vigenere, который по ключу решается
 *  ключ спрятан в групповом чате, нужно написать эту команду сначала в группу, получить ключ
 *  отсальной шифр спрятан в картинке, нужно скачать картинку полученную по коду
 *  и поменять расширение на txt, тогда в самом низу будет шифр и подсказка, что нужен ключ для расшифровки
 *  ключ notredame
 *  код gvx cevt oszateh ls uezhavgkaytvcg
 *  команда итоговая iamthechampion
 */
bot.onText(/\/243256/, async (msg) => {
    let isBotAdmin: boolean = false;
    const botId: any = await bot.getMe()
    await bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
        if (c.status == "administrator") {
            isBotAdmin = true
        }
    });
        try {
            const isPrivate = msg.chat.type === "private"
            if (isPrivate) {
                const text: string = `
            <b>Не нужно ничего искать, нужно лишь скачать и что-то поменять</b>
            `
                await bot.sendDocument(msg.chat.id, "./ciphers/lebowski_hidden_cipher.jpg", {
                    caption: text,
                    parse_mode: "HTML"
                })
            } else {
                if (isBotAdmin) {
                    const send = await bot.sendMessage(msg.chat.id, "Вы далеко зашли, и вами движет любопытство, что же ответит бот в общем чате на этот раз. А отвечу я 'notredame'")
                    await bot.deleteMessage(msg.chat.id, msg.message_id.toString())
                    await setTimeout(() => {
                        bot.deleteMessage(msg.chat.id, send.message_id.toString())
                    }, 7000)
                } else {
                    await bot.sendMessage(msg.chat.id, "Будь я админом, я дал бы вам крайне важную подсказку по квесту, а так фиг вам))")
                }
            }
        } catch (err) {
            await bot.sendMessage(msg.chat.id, "Похоже что-то случилось с соединением, или вы звбыли сделать бота админом в групповом чате, или у вас руки кривые))) сообщите саппорту о проблеме")

        }
})

/**
 *  Это последняя на данный момент команда для победителя, более шифров нет, просто поздравления и просьба сообщить саппортам
 *  о своей победе))) Подумать о призах, может скидку тому, кто первый решит?
 */
bot.onText(/\/iamthechampion/, async (msg) => {
    let isBotAdmin: boolean = false;
    const botId: any = await bot.getMe()
    await bot.getChatMember(msg.chat.id, botId.id).then(function (c) {
        if (c.status == "administrator") {
            isBotAdmin = true
        }
    });
        try {
            const isPrivate = msg.chat.type === "private"
            if (isPrivate) {
                const text: string = `
                                    <b>&#9812; Вы победили!!!&#127881;&#127881;&#127881;</b>
    <b>&#9812; Отличная работа ${msg.chat.first_name}&#127881;&#127881;&#127881;</b>
    <b>&#9812; Сообщите о своей победе саппорту&#127881;&#127881;&#127881;</b>
    <b>&#9812; Мы придумаем как вас наградить)))&#127881;&#127881;&#127881;</b>
    <b>&#9812; Вы супер!&#127881;&#127881;&#127881;</b>
            `
                await bot.sendPhoto(msg.chat.id, "./ciphers/winner.jpg" , {
                    caption: text,
                    parse_mode: 'HTML'
                })
            } else {
                if (isBotAdmin) {
                    const textWinnerToGroup = `
    <b>&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;</b>
                    <b>&#9812; Смотрите все, ${msg.from!.first_name} решил головоломку! &#9812;</b>
    <b>&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;&#127881;</b>
    `
                    await bot.sendMessage(msg.chat.id, textWinnerToGroup, {
                        parse_mode: "HTML"
                    })
                    await bot.deleteMessage(msg.chat.id, msg.message_id.toString())
                }  else {
                    await bot.sendMessage(msg.chat.id, "Я бы сказал кто здесь победитель, со смайликами всякими, но я не админ... и как вы дошли до этой команды без бота админа? Удалите команду, чтобы не спойлерить решение")
                }
            }
        } catch (err) {
            await bot.sendMessage(msg.chat.id, "Похоже что-то случилось с соединением, или вы звбыли сделать бота админом в групповом чате, или у вас руки кривые))) сообщите саппорту о проблеме")

        }
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Функции для составления необходимых сообщений
 */

/**
 * Функция для составления базового сообщения, и вебинарного сообщения (возникла из-за частых переносов дат и времени вебинара), как о контрольной (но есть и другие сообщения о контрольной), так и о занятиях
 */
async function buildTheMessage(chatId: string, typeOfLesson: string, lessonOrExamNumber: string, time: string, date: string, additionalText: string) {
    const text: string = `Внимание #напоминаем, сегодня (${date}) у вас состоится ${typeOfLesson} номер #${lessonOrExamNumber} в ${time}, ${additionalText}`
    await bot.sendMessage(chatId, text)
}
async function buildTheWebinarMessage(chatId: string, typeOfLesson: string, date: string, additionalText: string) {
    const text: string = `Внимание #напоминаем, сегодня (${date}) у вас состоится ${typeOfLesson}, ${additionalText}`
    await bot.sendMessage(chatId, text)
}

/**
 * Функция для определения какое именно будет сообщение, идет проверка на день недели и вечернюю или дневную группу
 */
async function buildTheMessageWithConditions(lesson: Array<LessonInterface>, day: string) {
    const date = moment().format("DD-MM-YYYY")
    for (let i = 0; i < lesson.length; i++) {
        let holiday: boolean = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo)
        if (holiday) continue
        if (lesson[i].lessonDayOne === day || lesson[i].lessonDayTwo === day) {
            if (lesson[i].time === 'evening') {
                await buildTheMessage(lesson[i].chatId, "Занятие", lesson[i].lessonNumber+"", "19:30", date, "читайте раздатку перед занятием")
            } else if (lesson[i].time === 'lunch') {
                await buildTheMessage(lesson[i].chatId, "Занятие", lesson[i].lessonNumber+"", "16:00", date, "читайте раздатку перед занятием")
            }
            lesson[i].lessonNumber += 1
            lesson[i].dateOfLastLesson = date
            // @ts-ignore
            lesson[i].save()
        }
    }
}

/**
 * Функция для составления сообщения о вебинаре, проверяет на среду и пятницу, время зашито как 19:30
 */
async function buildWebinarMessage(lesson: Array<LessonInterface>, day: string) {
    const date = moment().format("DD-MM-YYYY")
    for (let i = 0; i < lesson.length; i++) {
        let holiday: boolean = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo)
        if (holiday) continue
        if (lesson[i].webinarOne === day || lesson[i].webinarTwo === day) {
            if ((lesson[i].webinarOne === "3" || lesson[i].webinarOne === "2") && lesson[i].lessonNumber % 8 === 1) {
                continue
            }
            await buildTheWebinarMessage(lesson[i].chatId, "Вебинар", date, `Пишите вопросы с хэштэгом #Навебинар`)
        }
    }
}

/**
 * Функция для сообщения о субботнем вебинаре
 */
async function buildWebinarSaturdayMessage(lesson: LessonInterface) {
    const date = moment().format("DD-MM-YYYY")
    if (lesson.webinarOne === "6" || lesson.webinarTwo === "6") {
        await buildTheWebinarMessage(lesson.chatId, "Вебинар", date, `Пишите вопросы с хэштэгом #Навебинар`)
    }
}

/**
 * Функция для сообщения о контрольной в день контрольной
 */
async function buildExamMessage(lesson: Array<LessonInterface>) {
    const date = moment().format("DD-MM-YYYY")
    for (let i = 0; i < lesson.length; i++) {
        let holiday: boolean = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo)
        if (holiday) continue
        if ((lesson[i].lessonNumber - 1) % 8 === 0 && lesson[i].lessonNumber >= 8) {
            await buildTheMessage(lesson[i].chatId, "Контрольная", lesson[i].examNumber + "", "11:00", date, `готовьте треккер если вы сдаете онлайн, включайте зум, приготовьте ручку и бумагу, лишними не будут))`)
            lesson[i].examNumber += 1
        } else {
            await buildWebinarSaturdayMessage(lesson[i])
        }
        // @ts-ignore
        lesson[i].save()
    }
}


/**
 * Функция для сообщения о контролльной в течение недели до контрольной с указанием даты контрольной
 */
async function buildExamMessageBeforeActualDate(lesson: Array<LessonInterface>, date: string) {
    for (let i = 0; i < lesson.length; i++) {
        let holiday: boolean = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo)
        if (holiday) continue
        if (lesson[i].lessonNumber % 8 === 0 || (lesson[i].lessonNumber + 1) % 8 === 0) {
            const text: string = `Внимание #напоминаем, в эту субботу (${date}) у вас состоится Контрольная номер #${lesson[i].examNumber} c 11:00 до 19:00, повторите все темы этого месяца`
            await bot.sendMessage(lesson[i].chatId, text)
        }
    }
}

/**
 * Функция для напоминания об оплате, отрабатывает после первого первого занятия после контрольной
 * И для сообщения о дедлайне оплвты, отрабатывает в пятницу следующей недели после контрольной, не отрабатывает во время каникул
 */
async function buildPaymentNotificationMessage(lesson: Array<LessonInterface>, date: string) {
    const months = ["noFirstMonth", "второй", "третий","четвертый","пятый","шестой","седьмой","восьмой","девятый","десятый","одиннадцатый","двенадцатый","тринадцатый","четырнадцатый","пятнадцатый"]
    const todayDate = moment().format("DD-MM-YYYY")
    for (let i = 0; i < lesson.length; i++) {
        let holiday: boolean = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo)
        if (holiday) continue
        if (todayDate === date && (lesson[i].lessonNumber % 8 === 2 || lesson[i].lessonNumber % 8 === 3) && lesson[i].lessonNumber > 8) {
            const text = `Всем привет, #напоминаем об оплате за ${months[lesson[i].examNumber - 1]} учебный месяц. Сегодня - ${date}, крайний день внесения  оплаты.`
            await bot.sendMessage(lesson[i].chatId, text)
        }
        else if ((lesson[i].lessonNumber % 8 === 1 || lesson[i].lessonNumber % 8 === 2) && lesson[i].lessonNumber > 8) {
            const text = `Всем привет, напоминаем об оплате за текущий месяц, дедлайн до пятницы (${date})`
            await bot.sendMessage(lesson[i].chatId, text)
        }
    }
}

/**
 * Функция для информирования о посещении школы
 */
async function buildVisitAttractorMessage(lesson: Array<LessonInterface>) {
    for (let i = 0; i < lesson.length; i++) {
        let holiday: boolean = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo)
        if (holiday) continue
        if (lesson[i].lessonNumber === 1 || lesson[i].lessonNumber === 2) {
            const text = `

<b>#Важнаяинформация</b> 

Уважаемые студенты!

Образовательный центр Аттрактор Скул всегда рад видеть каждого из вас в нашем офисе. Вы можете приходить к нам для самостоятельной работы для выполнения домашних заданий. Мы работаем с Понедельника по Пятницу с 13-00 до 22-00, независимо от государственных, религиозных и прочих нерабочих праздничных дней.

Школа отдыхает два раза в год - летние каникулы и новогодние каникулы (расписание есть у вас в файле Ориентация).

Желаем всем вам успехов в учебе! 🤓

            `
            await bot.sendMessage(lesson[i].chatId, text, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Функция для информирования об индивидуальных занятиях
 */
async function buildIndividualLessonsAnnounce(lesson: Array<LessonInterface>) {
    for (let i = 0; i < lesson.length; i++) {
        let holiday: boolean = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo)
        if (holiday) continue
        if (lesson[i].lessonNumber === 2) {
            const text = `

<b>#Важноеобъявление</b>

Добрый день, уважаемые студенты!
Напоминаем вам о том, что у вас есть индивидуальные и дополнительные занятия, которые вы можете использовать в любое рабочее время с Понедельника по Пятницу с 13-00 до 22-00. 

Индивидуальные занятия вы можете использовать только оффлайн.
Цель занятия помочь вам справиться с пройденной темой на основании подготовленных вами вопросов, которые возникли при выполнении домашнего задания. Под индивидуальным занятием оффлайн подразумевается работа с дежурным преподавателем в аудитории. С преподавателем может работать от 1-го и более студентов одновременно.

Дополнительные занятия вы можете использовать онлайн или оффлайн. Стоимость 1-го часа занятия - 3 000 тг. 
Под дополнительным занятием онлайн подразумевается разговор с преподавателем по видеосвязи, а занятие оффлайн проводится в аудитории. Цель дополнительного занятия помочь вам справиться с пройденной темой. Эти занятия проводятся по вашим вопросам, возникшим при выполнении домашнего задания. Дополнительное занятие не предусматривает объяснение темы урока заново, а только ответы на ваши вопросы и разбор сложных моментов при выполнении домашней работы. 

📌К занятию важно подготовить вопросы и/или ваши собственные варианты решения этих вопросов, которые вы применили, а они не сработали. Преподаватель направит вас на верный путь решения и вы на будущее поймете, в каком направлении вам двигаться;
📌 Одно дополнительное занятие продолжается не более одного часа в день, можно заниматься не более двух часов с перерывом минимум на час. 


‼️Если вы забыли о дополнительном занятии или опаздываете, то имейте ввиду, что преподаватель ждет вас не более 15-ти минут и если по истечении этого времени вы так и не появились, то преподаватель имеет полное право не выходить на связь, а ваше занятие будет считаться проведенным.


Перед посещением офиса вам нужно ознакомиться с правилами посещения центра и строго им следовать: 
https://docs.google.com/document/d/1UGUCYyg6RZh4WGBn7pncMyrOrfGrzQT_-LMFTvfXWKk/edit?usp=sharing 

При усилении карантинных мер в городе Алматы, мы будем вынуждены закрыть индивидуальные занятия в офисе.


Мы надеемся, что данные занятия помогут вам подтянуть знания, и учебный процесс пойдет более продуктивно.

Желаем Вам успехов!


            `
            await bot.sendMessage(lesson[i].chatId, text, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Функция для информирования об окончании тестогого периода
 */
async function buildEndOfTestPeriodMessage(lesson: Array<LessonInterface>) {
    for (let i = 0; i < lesson.length; i++) {
        let holiday: boolean = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo)
        if (holiday) continue
        if (lesson[i].lessonNumber === 3) {
            const text = `
            
<b>#Важноеобъявление</b> 
Уважаемые студенты!

Мы очень надеемся, что вам понравился наш формат обучения и вы твердо решили для себя, стать Рембо-разработчиками 😎
Напоминаем вам, что в эту пятницу, у вас заканчивается тестовый период и вам важно определить для себя, продолжаете ли вы учиться ☝🏻

Мы будем рады сотрудничеству с вами, и приглашаем вас в удивительный мир программирования. 
Мы подскажем вам как преодолеть все преграды, на пути к вашей цели!

Чтобы войти в нашу команду, важно до вечера пятницы до 18-00 внести доплату за первый учебный месяц. Оплату можно произвести через :
1. Через приложение Каспи банк - самый удобный вариант;
2. Через приложение Халык Банк;
3. Наличными в офисе;
4. Через мобильный платежный терминал Альфа pay в нашем офисе.


Важно❗️ 
После оплаты, пожалуйста, скиньте квитанцию об оплате ${config.accountant} , т.к. мы увидим вашу оплату в нашей выписке только на следующий рабочий день.

В пятницу после 18-00 мы отключаем доступ ребятам кто решил не продолжать обучение. О своем решении приостановить обучение как можно раньше напишите пожалуйста в личку Администратору вашей группы ${lesson[i].groupAdmin}.

Все вопросы, касающиеся остатков по оплате, способах оплаты и прочие вопросы, не касающиеся программирования, задавайте в личку ${config.accountant}.

            `
            await bot.sendMessage(lesson[i].chatId, text, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Функция для напоминания об оплате, отрабатывает после первого первого занятия после контрольной
 * И для сообщения о дедлайне оплвты, отрабатывает в пятницу следующей недели после контрольной, не отрабатывает во время каникул
 */
async function buildEndOfTestPeriodFinalLastMessage(lesson: Array<LessonInterface>) {
    for (let i = 0; i < lesson.length; i++) {
        let holiday: boolean = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo)
        if (holiday) continue
        if (lesson[i].lessonNumber === 5) {
            const text = `

<b>#Важноеобъявление</b> 
            
Сегодня после 18-00 мы отключаем доступ ребятам кто решил не продолжать обучение. 
Все вопросы, касающиеся остатков по оплате, способах оплаты и прочие вопросы, не касающиеся программирования, задавайте в личку ${config.accountant}.

            `
            await bot.sendMessage(lesson[i].chatId, text, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Функция для информирования о важности сдавать домашки в срок и что скидку получают те, кто набирает свыше 95 баллов
 */
async function buildMessageAboutDiscountAndDeadlines(lesson: Array<LessonInterface>) {
    for (let i = 0; i < lesson.length; i++) {
        let holiday: boolean = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo)
        if (holiday) continue
        if (lesson[i].lessonNumber === 5) {
            const text = `
            
<b>#Напоминаем</b>
Пожалуйста, 📣обязательно📣 делайте и сдавайте в срок домашние задания (ДЗ) , т.к ваша итоговая оценка за месяц формируется из 40% от оценок за ДЗ + 50% от оценки за контрольную + 10% от посещаемости. 
Не забывайте о скидке 🤩 за отличную учебу вы получите в том случае, когда ваша итоговая оценка - "отлично" более 95 баллов.


            `
            await bot.sendMessage(lesson[i].chatId, text, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Функция для пожелания удачи перед первой контрольной
 */
async function buildWishGoodLuckMessageForFirstExam(lesson: Array<LessonInterface>) {
    for (let i = 0; i < lesson.length; i++) {
        let holiday: boolean = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo)
        if (holiday) continue
        if (lesson[i].lessonNumber === 8 || lesson[i].lessonNumber === 9) {
            const text = `
<b>Уважаемые студенты!</b>
Хотим пожелать вам успеха на завтрашней контрольной! Вы справитесь!

Обращаем ваше внимание на то, что на контрольную у вас выделяется строго определенное время с 11-00 до 19-00, то есть 8 часов. 
В 19-00 вы должны сдать вашу работу, вне зависимости от того, закончили вы проект или нет. Работы сданные после дедлайна будут штрафоваться существенным снижением баллов.

            `
            await bot.sendMessage(lesson[i].chatId, text, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Функция для поздравлений после первой контрольной
 */
async function buildCongratulationMessageAfterFirstExam(lesson: Array<LessonInterface>) {
    for (let i = 0; i < lesson.length; i++) {
        let holiday: boolean = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo)
        if (holiday) continue
        if (lesson[i].lessonNumber === 9) {
            const text = `
<b>#Объявление</b>
Всем привет!
В прошедшую субботу вы написали свою первую контрольную, даже не верится, что уже прошел целый месяц вашего продуктивного и насыщенного обучения.
Вы большие молодцы, и мы надеемся, что вы все хорошо справились☺️

            `
            await bot.sendMessage(lesson[i].chatId, text, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Функция напоминание об академической честности
 */
async function buildCheatingIsBadMessage(lesson: Array<LessonInterface>) {
    for (let i = 0; i < lesson.length; i++) {
        let holiday: boolean = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo)
        if (holiday) continue
        if (lesson[i].lessonNumber === 9 || lesson[i].lessonNumber === 17) {
            const text = `
<b>#Важнаяинформация 😌</b>

🚨Напоминаем вам про Академическую честность
Мы очень серьезно относимся к академической честности и для нас списывание - это страшный грех❗️

У преподавателя есть полное право заподозрить студента в списывании и поставить 0 баллов. Также преподаватель обязательно сообщает об этом факте администрации, и студент может быть отчислен даже за единственный прецедент без права восстановления‼️

♦️ Если вы списали домашку / контрольную с Интернета - 0 баллов.

♦️ Если одинаковый код обнаруживается у двух студентов - оба получают одинаковое наказание - 0 баллов.

Тот кто списал, в будущем столкнувшись с задачей, не сможет самостоятельно ее решить.
Тот кто дал списать не сделал добро, он лишил возможности научиться  решать задачи своему коллеге. 

 Это нечестно по отношению к центру и остальным студентам, это формирует непрофессиональное поведение и мешает вам стать востребованным разработчиком в будущем.

            `
            await bot.sendMessage(lesson[i].chatId, text, {
                parse_mode: "HTML"
            })
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Функция для проверки идут ли каникулы или нет, пропускает оповещения, счетчики занятий не растут. Возвращает булевое значение, и каждый раз перед отправкой
 * сообщения мы проверяем каникулы ли или нет.
 * Важно помнить, что если не поставить эту проверку в оповещение об оплате, то есть риск, что во время каникул людей будут дергать сообщениями об оплате
 */
function isHoliday(dateOne: string, dateTwo: string) {
    const today = moment()
    let checkDateOne = buildMomentDate(dateOne)
    let checkDateTwo = buildMomentDate(dateTwo)
    if ((today > checkDateOne && today < checkDateOne.add(6, "days")) || (today > checkDateTwo && today < checkDateTwo.add(6, "days"))) {
        return true
    }
    return false
}

/**
 * Функция для составления даты под moment
 */
function buildMomentDate(date: string) {
    const parts = date.split("-")
    const dt = new Date(parts[2] + "-" + parts[1] + "-" + parts[0])
    return moment(dt)
}