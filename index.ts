import express from 'express'
import TelegramBot from 'node-telegram-bot-api'
import cors from "cors"
import mongoose from 'mongoose'
import {config} from "./app/config";
import {Group} from "./app/models/group_model";
import schedule from 'node-schedule'
import moment from 'moment'
import {GroupInterface} from './app/interfaces/group_interface'


/**
 СДЕЛАНО 1) TODO В SHOW И ALLGROUPS Отлов каникул и учет если каникулы то дата контрольной плюс 7 дней
 СДЕЛАНО 2) TODO Активировать и деактивировать группы если каникулы
 СДЕЛАНО 3) TODO Каждый понедельник в начале дня прибавлять недели счетчик +1
 СДЕЛАНО 4) TODO Удаление групп
 СДЕЛАНО 5) TODO Базовые сообщения от админимстрации
 СДЕЛАНО 6) TODO Инструкцию написать
 7) TODO Подумать может еще что добавить...
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
 * Здесь мы получаем сегодняшнюю дату в нужном формате, плюс создаем переменные для остлеживания даты субботы и пятницы (для контрольной и дедлайна оплаты)
 * Затем проверяем каждый день недели для отправки необходимых сообщений подходящим по параметрам группам
 */
let dateOfNextSaturday;
let dateOnFriday;

/**
 * Понедельник
 */
schedule.scheduleJob("1 0 13 * * 1", async () => {
    const groups = await Group.find()
    dateOnFriday = moment().add(4, "days").format("DD-MM-YYYY")
    dateOfNextSaturday = moment().add(5, "days").format("DD-MM-YYYY")
    await buildLessonMessage(groups, 1)
    await buildWebinarMessage(groups, 1)
    await buildComingExamMessage(groups, dateOfNextSaturday)
    await buildPaySoonMessage(groups, dateOnFriday)
    await buildEndOfTestPeriodMessage(groups)
    await buildMessageAboutDiscountAndDeadlines(groups)
    await buildCongratulationMessageAfterFirstExam(groups)
    await buildCheatingIsBadMessage(groups)

})

// Здесь идет прибаление недель, в самом начале понедельника, в 00:00 00минут 01 секунд и проверка на каникулы, если каникулы, то группа деактивируется и все
schedule.scheduleJob("1 0 0 * * 1", async () => {
    const groups = await Group.find()
    await incrementWeek(groups)
    for (let i = 0; i < groups.length; i++) {
        await isHoliday(groups[i])
    }
})

/**
 * Вторник
 */
schedule.scheduleJob("1 0 13 * * 2", async () => {
    const groups = await Group.find()
    dateOnFriday = moment().add(4, "days").format("DD-MM-YYYY")
    dateOfNextSaturday = moment().add(4, "days").format("DD-MM-YYYY")
    await buildLessonMessage(groups, 2)
    await buildWebinarMessage(groups, 2)
    await buildComingExamMessage(groups, dateOfNextSaturday)
    await buildPaySoonMessage(groups, dateOnFriday)
    await buildVisitAttractorMessage(groups)
})
/**
 * Среда
 */
schedule.scheduleJob("1 0 13 * * 3", async () => {
    const groups = await Group.find()
    dateOnFriday = moment().add(4, "days").format("DD-MM-YYYY")
    dateOfNextSaturday = moment().add(3, "days").format("DD-MM-YYYY")
    await buildLessonMessage(groups, 3)
    await buildWebinarMessage(groups, 3)
    await buildComingExamMessage(groups, dateOfNextSaturday)
    await buildPaySoonMessage(groups, dateOnFriday)
})
/**
 * Четверг
 */
schedule.scheduleJob("1 0 13 * * 4", async () => {
    const groups = await Group.find()
    dateOnFriday = moment().add(4, "days").format("DD-MM-YYYY")
    dateOfNextSaturday = moment().add(2, "days").format("DD-MM-YYYY")
    await buildLessonMessage(groups, 4)
    await buildWebinarMessage(groups, 4)
    await buildComingExamMessage(groups, dateOfNextSaturday)
    await buildPaySoonMessage(groups, dateOnFriday)
    await buildIndividualLessonsAnnounce(groups)
})
/**
 * Пятница
 */
schedule.scheduleJob("1 0 13 * * 5", async () => {
    const groups = await Group.find()
    dateOfNextSaturday = moment().add(1, "days").format("DD-MM-YYYY")
    await buildLessonMessage(groups, 5)
    await buildWebinarMessage(groups, 5)
    await buildComingExamMessage(groups, dateOfNextSaturday)
    await buildPayTodayMessage(groups)
    await buildEndOfTestPeriodFinalLastMessage(groups)
})

schedule.scheduleJob("1 0 18 * * 5", async () => {
    const groups = await Group.find()
    await buildWishGoodLuckMessageForFirstExam(groups)
})
/**
 * Суббота
 */
schedule.scheduleJob("1 0 10 * * 6", async () => {
    const groups = await Group.find()
    await buildLessonMessage(groups, 6)
    await buildWebinarMessage(groups, 6)
    await buildTodayExamMessage(groups)
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
                const oldGroup = await Group.findOne({chatId: msg.chat.id})
                if (oldGroup) {
                    oldGroup.delete()
                }
                const ii = arr[1].replace(/\s+/g,' ').trim().split(" ")
                // 2-19:30/5-19:30
                const lessons = ii[1].split('/')
                for (let i = 0; i < lessons.length; i++) {
                    lessons[i] = {[lessons[i].split("-")[0]]: lessons[i].split("-")[1]}
                }
                const webinars = ii[2].split('/')
                for (let i = 0; i < webinars.length; i++) {
                    webinars[i] = {[webinars[i].split("-")[0]]: webinars[i].split("-")[1]}
                }
                const holidays = ii[3].split('/')
                const holidayWeeksNumbers = []
                for (let i = 0; i < holidays.length; i++) {
                    // @ts-ignore
                    const currentMonday = moment().startOf('isoweek')
                    const momentDateHoliday = buildMomentDate(holidays[i])
                    for (let j = 1; j < 78; j++) {
                        if (currentMonday.add(7, "days").format("DD-MM-YYYY") === momentDateHoliday.format("DD-MM-YYYY")) {
                            holidayWeeksNumbers.push(j + parseInt(ii[4]))
                            break;
                        }
                    }
                }

                const group = await new Group({
                    chatId: msg.chat.id,
                    groupName: ii[0],
                    currentWeek: ii[4] - 1,
                    lessons: lessons,
                    webinars: webinars,
                    holidays: holidays,
                    holidayWeeksNumbers: holidayWeeksNumbers
                })


                await group.save()
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
 * Внесение изменений в нумерацию тущей недели
 */
bot.onText(/\/setweek_(.+)/, async (msg, arr: any) => {
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
                const group = await Group.findOne({chatId: msg.chat.id})
                const holidays = group.holidays
                const holidayWeeksNumbers = []
                for (let i = 0; i < holidays.length; i++) {
                    // @ts-ignore
                    const currentMonday = moment().startOf('isoweek')
                    const momentDateHoliday = buildMomentDate(holidays[i])
                    for (let j = 1; j < 78; j++) {
                        if (currentMonday.add(7, "days").format("DD-MM-YYYY") === momentDateHoliday.format("DD-MM-YYYY")) {
                            holidayWeeksNumbers.push(j + parseInt(arr[1]))
                            break;
                        }
                    }
                }
                group.currentWeek = arr[1]
                group.holidayWeeksNumbers = holidayWeeksNumbers
                await group.save()
                const send = await bot.sendMessage(msg.chat.id, `Номер текущей недели изменен на ${arr[1]}, сообщение удалится через 10 секунд`)

                setTimeout(() => {
                    bot.deleteMessage(msg.chat.id, send.message_id.toString())
                    bot.deleteMessage(msg.chat.id, msg.message_id.toString())
                }, 10000)


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
                const group = await Group.findOne({chatId: msg.chat.id})
                group.groupAdmin = arr[1]
                await group.save()
                const send = await bot.sendMessage(msg.chat.id, `Админ этой группы ${arr[1]}, сообщение удалится через 10 секунд`)

                setTimeout(() => {
                    bot.deleteMessage(msg.chat.id, send.message_id.toString())
                    bot.deleteMessage(msg.chat.id, msg.message_id.toString())
                }, 10000)

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
        <pre>Все что нужно сделать это ввести <b>/build_</b> затем не ставя пробел ввести первый параметр, и затем уже через пробелы все остальные параметры.</pre>
        <pre>Чтобы смотреть данные по группе можно ввести <b>/show</b> в чате группы и посмотреть что к чему.</pre>
        <pre>Всего параметров 5 штук. Но не пугайтесь, вы всегда можете проверить данные вашей группы и перезаписать ее; то есть при повторении команды <b>/build_</b> со всеми парметрами удалит старую запись и создаст новую</pre>
        
        <b>Какие есть параметры:</b>
        
        <b>Имя группы:</b><pre>Пишите имя без пробелов в названии</pre>
        <b>Дни и время занятий:</b><pre>Пишите числом день недели, где 1 это понедельник, затем тире (-) и пишите время занятий в любом формате без пробела, далее слэш (/) и другой день занятий и время, так сколько угодно дней</pre>
        <b>Дни и время вебинаров:</b><pre>Тоже самое, что и для занятий, точно также пишите дни и время через тире (-) и слэши (/)</pre>
        <b>Даты каникул:</b><pre>Пишите в формате dd-mm-yyyy и ставьте слэш (/) между датами, дат каникул может быть сколько угодно</pre>
        <b>Номер текущей недели:</b><pre>Если вы заранее создаете группу, то укажите 0, чтобы с понедельника началась первая неделя учебы))</pre>
        
        <b>Например мы создаем группу JS-5 с занятиями по понедельникам в 16:00 и четвергам в 19:30, вебинарами по вторникам в 11:00 и по субботам в 17:00, каникулами на новый год и неделей в августе (15 числа), и это первая неделя учебы</b>
        <pre>/build_JS-5 1-16:00/4-19:30 2-11:00/6-17:00 27-12-2020/15-08-2021 1</pre>
        
        <pre>Готово))</pre>
        
        <b>PS:</b>
        
        <pre>Вы также можете редактировать номер текущей недели, с помощью команды /setweek_.</pre>
        <pre>Например, /setweek_3 мы меняем текущую неделю на 3 (считать неделю просто, разделите номер занятия текущего на количество занятий в неделе, например занятие 22 при двух занятиях в неделю, это 11 неделя обучения)))</pre>
        
        <b>PPS:</b>
        
        <pre>Можно указать админа группы с помощью /setadmin_ </pre>
        <pre>Например, /setadmin_Nazira +7(777)777-77-77 @Nazira мы ставим админом группы Назиру с какими то контактными данными.</pre>
        
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
        const group = await Group.findOne({chatId: msg.chat.id})
        const thisWeekSaturday = moment().endOf('week')
        let diff = 4 - ((group.currentWeek + 1) % 4)
        for (let i = 0; i < group.holidayWeeksNumbers.length; i++) {
            if (group.holidayWeeksNumbers[i] - (group.currentWeek + 1) <= 4 || !group.isActive) {
                diff += 1
            }
        }
        const examSaturday = thisWeekSaturday.add(diff, "weeks").format("DD-MM-YYYY")
        const weekDays = ['понедельникам', 'вторникам', 'средам', 'четвергам', 'пятницам', 'субботам', 'воскресеньям',]

        let text = `
<b>----------------------------</b>

<b>Данные по вашей группе</b>

<b>Имя группы</b><pre>${group.groupName}</pre> 
<b>Следующая контрольная</b><pre>#${Math.floor(group.currentWeek / 4) + 1} будет ${examSaturday}</pre> 
<b>Админ вашей группы</b><pre>${group.groupAdmin}</pre> 
`
        text += `<b>----------------------------</b>
<b>Занятия по </b>
`
        for (let i = 0; i < group.lessons.length; i++) {
            text += Object.keys(group.lessons[i]).map(key => {
                return `<pre>${weekDays[parseInt(key) - 1]} в ${group.lessons[i][key]}</pre> 
`
            })
        }
        text += `<b>----------------------------</b>
<b>Вебинары по </b>
`
        for (let i = 0; i < group.webinars.length; i++) {
            text += Object.keys(group.webinars[i]).map(key => {
                return `<pre>${weekDays[parseInt(key) - 1]} в ${group.webinars[i][key]}</pre> 
`
            })
        }
        text += `<b>----------------------------</b>
<b>Даты каникул</b>
`
        for (let i = 0; i < group.holidays.length; i++) {
            text += `<pre>${group.holidays[i]}</pre> 
`
        }



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
    if (isPrivate) {
        try {
            const groups = await Group.find()
            for (let i = 0; i < groups.length; i++) {
                const group = groups[i]
                const thisWeekSaturday = moment().endOf('week')
                let diff = 4 - ((group.currentWeek + 1) % 4)
                for (let j = 0; j < group.holidayWeeksNumbers.length; j++) {
                    if (group.holidayWeeksNumbers[j] - (group.currentWeek + 1) <= 4 || !group.isActive) {
                        diff += 1
                    }
                }
                const examSaturday = thisWeekSaturday.add(diff, "weeks").format("DD-MM-YYYY")
                const weekDays = ['понедельникам', 'вторникам', 'средам', 'четвергам', 'пятницам', 'субботам', 'воскресеньям',]

                let text = `
<b>----------------------------</b>

<b>Данные по вашей группе</b>

<b>Имя группы</b><pre>${group.groupName}</pre> 
<b>Следующая контрольная</b><pre>#${Math.floor(group.currentWeek / 4) + 1} будет ${examSaturday}</pre> 
<b>Админ вашей группы</b><pre>${group.groupAdmin}</pre> 
`
                text += `<b>----------------------------</b>
<b>Занятия по </b>
`
                for (let j = 0; j < group.lessons.length; j++) {
                    text += Object.keys(group.lessons[j]).map(key => {
                        return `<pre>${weekDays[parseInt(key) - 1]} в ${group.lessons[j][key]}</pre> 
`
                    })
                }
                text += `<b>----------------------------</b>
<b>Вебинары по </b>
`
                for (let j = 0; j < group.webinars.length; j++) {
                    text += Object.keys(group.webinars[j]).map(key => {
                        return `<pre>${weekDays[parseInt(key) - 1]} в ${group.webinars[j][key]}</pre> 
`
                    })
                }
                text += `<b>----------------------------</b>
<b>Даты каникул</b>
`
                for (let j = 0; j < group.holidays.length; j++) {
                    text += `<pre>${group.holidays[j]}</pre> 
`
                }
                text += `
<b>ID группы</b> <pre>${group._id}</pre>
                `
                const numbersDividers = `
<b>----------------------------</b>
<b>${i + 1}</b>
<b>----------------------------</b>
                `
                await bot.sendMessage(msg.chat.id, numbersDividers, {
                    parse_mode: "HTML"
                })

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
            const group = await Group.findOne({_id: ii[0]})
            if (ii[1] === "coolPasha") {
                await group.delete()
                await bot.sendMessage(msg.chat.id, `Группа ${group.groupName} успешно удалена из базы`)
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
            <b>Как команду напиши мне что ты слышишь в этом файле (если звука нет, то скачайте файл и запустите через проигрыватель)</b>
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

const buildLessonMessage = async (groups: Array<GroupInterface>, day: any) => {
    for (let i = 0; i < groups.length; i++) {
        for (let j = 0; j < groups[i].lessons.length; j++) {
            const isExamToday = day === 6 && (groups[i].currentWeek + 1) % 4 === 0
            if (isExamToday) continue
            // @ts-ignore
            const checkKeyAndGetTime = groups[i].lessons[j][day]
            if (checkKeyAndGetTime && groups[i].isActive) {
                const lessonNum = (groups[i].currentWeek) * groups[i].lessons.length + j + 1
                await bot.sendMessage(groups[i].chatId, `Внимание #напоминаем, сегодня (${moment().format("DD-MM-YYYY")}) у вас состоится занятие номер #${lessonNum} в ${checkKeyAndGetTime}, читайте раздатку перед занятием`, {
                    parse_mode: "HTML"
                })
            }
        }
    }
}

const buildWebinarMessage = async (groups: Array<GroupInterface>, day: any) => {
    for (let i = 0; i < groups.length; i++) {
        for (let j = 0; j < groups[i].webinars.length; j++) {
            const isExamToday = day === 6 && (groups[i].currentWeek + 1) % 4 === 0
            if (isExamToday) continue
            // @ts-ignore
            const checkKeyAndGetTime = groups[i].webinars[j][day]
            if (checkKeyAndGetTime && groups[i].isActive) {
                await bot.sendMessage(groups[i].chatId, `Внимание #напоминаем, сегодня (${moment().format("DD-MM-YYYY")}) у вас состоится вебинар в ${checkKeyAndGetTime}, пишите вопросы с хэштэгом #Навебинар`, {
                    parse_mode: "HTML"
                })
            }
        }
    }
}

/**
 * Составление сообщения о наступающей контрольной
 */
const buildComingExamMessage = async (groups: Array<GroupInterface>, date: string) => {
    for (let i = 0; i < groups.length; i++) {
        if ((groups[i].currentWeek + 1) % 4 === 0 && groups[i].isActive) {
            await bot.sendMessage(groups[i].chatId, `Внимание #напоминаем, в эту субботу (${date}) у вас состоится контрольная работа номер #${(groups[i].currentWeek + 1) / 4} c 11:00 до 19:00, повторите все пройденные темы этого месяца`, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Составление сообщения о контрольной сегодня
 */
const buildTodayExamMessage = async (groups: Array<GroupInterface>) => {
    for (let i = 0; i < groups.length; i++) {
        if ((groups[i].currentWeek + 1) % 4 === 0 && groups[i].isActive) {
            await bot.sendMessage(groups[i].chatId, `Внимание #напоминаем, сегодня (${moment().format("DD-MM-YYYY")}) у вас состоится контрольная работа номер #${(groups[i].currentWeek + 1) / 4} c 11:00 до 19:00, подготовьте треккеры если пишите онлайн, подготовьте все необходимые по вашему мнению инструменты`, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Составление сообщения о предстоящей оплате
 */
const buildPaySoonMessage = async (groups: Array<GroupInterface>, date: string) => {
    for (let i = 0; i < groups.length; i++) {
        if ((groups[i].currentWeek + 1) % 4 === 1 && groups[i].isActive && groups[i].currentWeek > 3) {
            await bot.sendMessage(groups[i].chatId, `Всем привет, напоминаем об оплате за текущий месяц, дедлайн до пятницы (${date})`, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Составление сообщения об оплате сегодня
 */
const buildPayTodayMessage = async (groups: Array<GroupInterface>) => {
    const months = ["noFirstMonth", "второй", "третий","четвертый","пятый","шестой","седьмой","восьмой","девятый","десятый","одиннадцатый","двенадцатый","тринадцатый","четырнадцатый","пятнадцатый"]
    for (let i = 0; i < groups.length; i++) {
        if ((groups[i].currentWeek + 1) % 4 === 1 && groups[i].isActive && groups[i].currentWeek > 3) {
            await bot.sendMessage(groups[i].chatId, `Всем привет, #напоминаем об оплате за ${months[(groups[i].currentWeek) / 4]} учебный месяц. Сегодня - ${moment().format("DD-MM-YYYY")}, крайний день внесения  оплаты.`, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Прибавление недели, обычшый счетчик, срабаьывает раз в неделю, скорее всего в понедельник  самом начале дня ночью.
 */
const incrementWeek = async (groups: Array<GroupInterface>) => {
    for (let i = 0; i < groups.length; i++) {
        groups[i].currentWeek++
        // @ts-ignore
        groups[i].save()
    }
}

/**
 * Проверка на каникулы, переключает isActive группы на false либо наоборот обратно на true
 */
const isHoliday = async (group: GroupInterface) => {
    for (let i = 0; i < group.holidayWeeksNumbers.length; i++) {
        if (group.holidayWeeksNumbers[i] === (group.currentWeek + 1)) {
            group.holidayWeeksNumbers.splice(i, 1)
            group.isActive = false
            group.currentWeek -= 1
            // @ts-ignore
            group.save()
            return
        }
    }
    group.isActive = true
    // @ts-ignore
    group.save()
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Функция для информирования о посещении школы
 */
async function buildVisitAttractorMessage(groups: Array<GroupInterface>) {
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].currentWeek === 0 && groups[i].isActive) {
            const text = `

<b>#Важнаяинформация</b> 

Уважаемые студенты!

Образовательный центр Аттрактор Скул всегда рад видеть каждого из вас в нашем офисе. Вы можете приходить к нам для самостоятельной работы для выполнения домашних заданий. Мы работаем с Понедельника по Пятницу с 13-00 до 22-00, независимо от государственных, религиозных и прочих нерабочих праздничных дней.

Школа отдыхает два раза в год - летние каникулы и новогодние каникулы (расписание есть у вас в файле Ориентация).

Желаем всем вам успехов в учебе! 🤓

            `
            await bot.sendMessage(groups[i].chatId, text, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Функция для информирования об индивидуальных занятиях
 */
async function buildIndividualLessonsAnnounce(groups: Array<GroupInterface>) {
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].currentWeek === 0 && groups[i].isActive) {
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
            await bot.sendMessage(groups[i].chatId, text, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Функция для информирования об окончании тестогого периода
 */
async function buildEndOfTestPeriodMessage(groups: Array<GroupInterface>) {
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].currentWeek === 1 && groups[i].isActive) {
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

В пятницу после 18-00 мы отключаем доступ ребятам кто решил не продолжать обучение. О своем решении приостановить обучение как можно раньше напишите пожалуйста в личку Администратору вашей группы ${groups[i].groupAdmin}.

Все вопросы, касающиеся остатков по оплате, способах оплаты и прочие вопросы, не касающиеся программирования, задавайте в личку ${config.accountant}.

            `
            await bot.sendMessage(groups[i].chatId, text, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Функция для напоминания об оплате, отрабатывает после первого первого занятия после контрольной
 * И для сообщения о дедлайне оплвты, отрабатывает в пятницу следующей недели после контрольной, не отрабатывает во время каникул
 */
async function buildEndOfTestPeriodFinalLastMessage(groups: Array<GroupInterface>) {
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].currentWeek === 1 && groups[i].isActive) {
            const text = `

<b>#Важноеобъявление</b> 
            
Сегодня после 18-00 мы отключаем доступ ребятам кто решил не продолжать обучение. 
Все вопросы, касающиеся остатков по оплате, способах оплаты и прочие вопросы, не касающиеся программирования, задавайте в личку ${config.accountant}.

            `
            await bot.sendMessage(groups[i].chatId, text, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Функция для информирования о важности сдавать домашки в срок и что скидку получают те, кто набирает свыше 95 баллов
 */
async function buildMessageAboutDiscountAndDeadlines(groups: Array<GroupInterface>) {
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].currentWeek === 2 && groups[i].isActive) {
            const text = `
            
<b>#Напоминаем</b>
Пожалуйста, 📣обязательно📣 делайте и сдавайте в срок домашние задания (ДЗ) , т.к ваша итоговая оценка за месяц формируется из 40% от оценок за ДЗ + 50% от оценки за контрольную + 10% от посещаемости. 
Не забывайте о скидке 🤩 за отличную учебу вы получите в том случае, когда ваша итоговая оценка - "отлично" более 95 баллов.


            `
            await bot.sendMessage(groups[i].chatId, text, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Функция для пожелания удачи перед первой контрольной
 */
async function buildWishGoodLuckMessageForFirstExam(groups: Array<GroupInterface>) {
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].currentWeek === 3 && groups[i].isActive) {
            const text = `
<b>Уважаемые студенты!</b>
Хотим пожелать вам успеха на завтрашней контрольной! Вы справитесь!

Обращаем ваше внимание на то, что на контрольную у вас выделяется строго определенное время с 11-00 до 19-00, то есть 8 часов. 
В 19-00 вы должны сдать вашу работу, вне зависимости от того, закончили вы проект или нет. Работы сданные после дедлайна будут штрафоваться существенным снижением баллов.

            `
            await bot.sendMessage(groups[i].chatId, text, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Функция для поздравлений после первой контрольной
 */
async function buildCongratulationMessageAfterFirstExam(groups: Array<GroupInterface>) {
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].currentWeek === 4 && groups[i].isActive) {
            const text = `
<b>#Объявление</b>
Всем привет!
В прошедшую субботу вы написали свою первую контрольную, даже не верится, что уже прошел целый месяц вашего продуктивного и насыщенного обучения.
Вы большие молодцы, и мы надеемся, что вы все хорошо справились☺️

            `
            await bot.sendMessage(groups[i].chatId, text, {
                parse_mode: "HTML"
            })
        }
    }
}

/**
 * Функция напоминание об академической честности
 */
async function buildCheatingIsBadMessage(groups: Array<GroupInterface>) {
    for (let i = 0; i < groups.length; i++) {
        if ((groups[i].currentWeek === 4 || groups[i].currentWeek === 8) && groups[i].isActive) {
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
            await bot.sendMessage(groups[i].chatId, text, {
                parse_mode: "HTML"
            })
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Функция для составления даты под moment
 */
function buildMomentDate(date: string) {
    const parts = date.split("-")
    const dt = new Date(parts[2] + "-" + parts[1] + "-" + parts[0])
    return moment(dt)
}