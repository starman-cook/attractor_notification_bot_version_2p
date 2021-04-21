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
 *   DONE********** Добавить возможность смены номера занятния и экзамена без удаления текущих данных, так, для быстрой коррекции на всякий случай
 *
 *   DONE********** Добавить сообщение о крайней дате оплаты, в пятницу на неделе после контрольной, чтобы напомнить тем, кто еще не оплатил
 *

 2.1 DONE********** Каникул (Убрать время у ввести даты) *****
 2.2

 2.5 DONE********** Исключить уведомления о вебинарах следующих после контрольной работы *****

 2.6

     DONE********** Потестить добавление и удаление пользователей, чтобы бот не падал ****

 2.8 DONE********** добавить к уведомлениям номер вебинара *****

 5.  DONE********** Пофиксить проблему разлета времени для зоны +6 ****** (Это когда на сервер его выгрузим)


 8. Создать функционал логирования ошибок работы бота
 9. Реализовать функционал отправки логов ошибок по расписанию *****


    DONE********** Добавить команду выгрузки данных всех групп, со всеми их данными, когда учатся, какое занятие идет у них, какая контрольная и когда следующая
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
    const lesson = await Lesson.find()
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
    dateOfNextSaturday = moment().add(3, "days").format("DD-MM-YYYY")
    await buildExamMessageBeforeActualDate(lesson, dateOfNextSaturday)
    await buildTheMessageWithConditions(lesson, "3")
})
/**
 * Четверг
 */
schedule.scheduleJob("1 0 13 * * 4", async () => {
    const lesson = await Lesson.find()
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
    dateOfNextSaturday = moment().add(1, "days").format("DD-MM-YYYY")
    await buildExamMessageBeforeActualDate(lesson, dateOfNextSaturday)
    await buildTheMessageWithConditions(lesson, "5")
})
/**
 * Суббота
 */
schedule.scheduleJob("1 30 10 * * 6", async () => {
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
            lesson.dateOfLastLesson = moment().toISOString()
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
        await bot.sendMessage(msg.chat.id, funnyResponse, {
            parse_mode: "HTML"
        })
    }
})

/**
 * Внесение изменений в нумерацию, можно поменять номер следующего занятия и следующей контрольной
 * НАПОМИНАНИЕ: добавить данное описание в инструкцию
 */
bot.onText(/\/setup_(.+)/, async (msg, arr: any) => {
    const admins = await  bot.getChatAdministrators(msg.chat.id)
    let admin = false;
    for (let i = 0; i < admins.length; i++) {
        if (admins[i].user.id === msg.from!.id) {
            admin = true
        }
    }
    if (admin) {
        try {
            const typeAndNumber = arr[1].replace(/\s+/g,' ').trim().split(" ")
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
        await bot.sendMessage(msg.chat.id, funnyResponse, {
            parse_mode: "HTML"
        })
    }
})

/**
 * Получение инструкций, команда скрыта, нужно писать ее через / без единой ошибки, если студенты получат к ней доступ, то могут сломать бота
 */
bot.onText(/\/givemetheinstructionsplease/, async (msg, arr: any) => {
    const admins = await  bot.getChatAdministrators(msg.chat.id)
    let admin = false;
    for (let i = 0; i < admins.length; i++) {
        if (admins[i].user.id === msg.from!.id) {
            admin = true
        }
    }
    if (admin) {
        try {
            const text: string = ` 
        <b>Привет дорогой создатель группы!</b>

        
        <pre>Это инструкция по созданию группы для оповещения студентов о занятиях, контрольных, оплатах и каникулах</pre>
        <pre>Все что нужно сделать это ввести <b>/build_</b> затем не ставя пробел ввести первый параметр, и затем уже через пробелы все остальные пармаетры.</pre>
        <pre>Всего параметров 9 штук. Но не пугайтесь, вы всегда можете проверить данные вашей группы и перезаписать ее; то есть при повторении команды <b>/build_</b> со всеми парметрами удалит старую запись и создаст новую</pre>
        
        <b>Какие есть параметры:</b>
        
        <b>Имя группы:</b><pre>Пишите название без пробелов в названии</pre>
        <b>День занятия номер 1:</b><pre>Пишите числом 1 это понедельник, 2 вторник</pre>
        <b>День занятия номер 2:</b><pre>Также числом 4 это четверг, 5 пятница</pre>
        <b>День вебинара номер 1:</b><pre>Если есть вебинары по вторникам, то ставим 2, по средам 3, иначе пишем null</pre>
        <b>День вебинара номер 2:</b><pre>Если есть вебинары по пятницам, то ставим 5, иначе пишем null</pre>
        <b>Время занятий:</b><pre>есть два варианта либо evening либо lunch, вечерняя и дневная группы соответсвенно</pre>
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
`
            await bot.sendMessage(msg.chat.id, text, {
                parse_mode: "HTML"
            })
        } catch(err) {
            await bot.sendMessage(msg.chat.id, "Что то рухнуло и сломалось")
        }
    } else {
        const funnyResponse = `
<b>Узреть желаешь</b>
<b>Инструкцию программы</b>
<b>Пстота кругом</b>
        `
        await bot.sendMessage(msg.chat.id, funnyResponse, {
            parse_mode: "HTML"
        })
    }
})


/**
 * Данная функция доступна всем (возможно добавим ее через BotFather в видимые команды), сообщение показывает данные по группе, текущему занятию, датой следующей контрольной
 * Сообщение автоматически удаляется спустя некоторое время
 */
bot.onText(/\/show/, async (msg) => {
    try {
        const lesson = await Lesson.findOne({chatId: msg.chat.id})
        const dif = lesson.lessonNumber % 8
        const arrWithRestDays = [{key: 1, value: 26}, {key: 2, value: 23}, {key: 3, value: 19}, {key: 4, value: 16}, {key: 5, value: 12}, {key: 6, value: 9}, {key: 7, value: 5},  {key: 0, value: 2}]
        let result = 0
        arrWithRestDays.forEach((el: any) => {
            if (el.key === dif) {
                result = el.value
            }
        })
        if (lesson.lessonDayOne === "2") result -= 1
        dateOfNextSaturday = moment(lesson.dateOfLastLesson).add(result, "days").format("DD-MM-YYYY")

        const text = `

<strong>--------------------------------------</strong>


<strong>Данные по вашей группе</strong>
        
        
<b>Ваша группа </b><pre>${lesson.groupName}</pre>

<b>Вы учитесь по </b><pre>${lesson.lessonDayOne === "1" ? "понедельникам" : lesson.lessonDayOne === "2" ? "вторникам" : "хрен знает каким дням"} и ${lesson.lessonDayTwo === "4" ? "четвергам" : lesson.lessonDayTwo === "5" ? "пятницам" : "хрен знает каким дням"}</pre>

<b>По времени c </b><pre>${lesson.time === "evening" ? "19:30 до 21:30" : lesson.time === "lunch" ? "16:00 до 18:00" : "хрен знает сколько до не знаю скольки"}</pre>

<b>Вебинары по </b><pre>${lesson.webinarOne === "3" ? "средам в 19:30" : lesson.webinarOne === "5" ? "пятницам в 19:30" : lesson.webinarOne === "2" ? "вторникам в 19:30" : ""}  ${lesson.webinarTwo === "5" ? "и по пятницам в 19:30" : ""}</pre>

<b>Номер следующего занятия </b><pre>#${lesson.lessonNumber}</pre>

<b>Контрольная </b><pre>#${lesson.examNumber} будет в субботу ${dateOfNextSaturday}</pre>     

<b>Первые каникулы</b><pre>#${lesson.holidayOne}</pre> 
     
<b>Вторые каникулы</b><pre>#${lesson.holidayTwo}</pre> 
     
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
        await bot.sendMessage(msg.chat.id, "Что то рухнуло и сломалось")
    }

})

/**
 * Функции для выгрузки данных по всем группам
 * Доступно только при личной переписке с ботом, команда доступна всем
 * Подсказки данной команды нет, нужно вводить самому без ошибок, иначе не сработает
 */
bot.onText(/\/allgroups/, async (msg) => {
    const arrWithRestDays = [{key: 1, value: 26}, {key: 2, value: 23}, {key: 3, value: 19}, {key: 4, value: 16}, {key: 5, value: 12}, {key: 6, value: 9}, {key: 7, value: 5},  {key: 0, value: 2}]
    try {
        const lesson = await Lesson.find()
        console.log(lesson)

        for (let i = 0; i < lesson.length; i++) {
            const totalAmountOfUsers: number = await bot.getChatMembersCount(lesson[i].chatId)
            const admins = await bot.getChatAdministrators(lesson[i].chatId)
            const amountWithoutAdmins: number = totalAmountOfUsers - admins.length
            const dif = lesson[i].lessonNumber % 8
            let result = 0
            arrWithRestDays.map((el: any) => {
                if (el.key === dif) {
                    result = el.value
                    return null
                }
            })
            if (lesson[i].lessonDayOne === "2") result -= 1
            dateOfNextSaturday = moment(lesson[i].dateOfLastLesson).add(result, "days").format("DD-MM-YYYY")

            const text = `

<strong>--------------------------------------</strong>

<b>Данные по группе </b><pre>${lesson[i].groupName}</pre>

<b>Людей в чате группы </b><pre>${totalAmountOfUsers}</pre>

<b>Людей в чате без админов </b><pre>${amountWithoutAdmins}</pre>

<b>Учебные дни по </b><pre>${lesson[i].lessonDayOne === "1" ? "понедельникам" : lesson[i].lessonDayOne === "2" ? "вторникам" : "хрен знает каким дням"} и ${lesson[i].lessonDayTwo === "4" ? "четвергам" : lesson[i].lessonDayTwo === "5" ? "пятницам" : "хрен знает каким дням"}</pre>

<b>По времени c </b><pre>${lesson[i].time === "evening" ? "19:30 до 21:30" : lesson[i].time === "lunch" ? "16:00 до 18:00" : "хрен знает сколько до не знаю скольки"}</pre>

<b>Вебинары по </b><pre>${lesson[i].webinarOne === "3" ? "средам в 19:30" : lesson[i].webinarOne === "5" ? "пятницам в 19:30" : lesson[i].webinarOne === "2" ? "вторникам в 19:30" : ""}  ${lesson[i].webinarTwo === "5" ? "и по пятницам в 19:30" : ""}</pre>

<b>Номер следующего занятия </b><pre>#${lesson[i].lessonNumber}</pre>

<b>Контрольная </b><pre>#${lesson[i].examNumber} будет в субботу ${dateOfNextSaturday}</pre>

<b>Первые каникулы</b><pre>#${lesson[i].holidayOne}</pre>

<b>Вторые каникулы</b><pre>#${lesson[i].holidayTwo}</pre>

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

})


/////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Функции для составления необходимых сообщений
 */

/**
 * Функция для составления базового сообщения, как о контрольной (но есть и другие сообщения о контрольной), так и о занятиях
 */
async function buildTheMessage(chatId: string, typeOfLesson: string, lessonOrExamNumber: string, time: string, date: string, additionalText: string) {
    const text: string = `Внимание #напоминаем, сегодня (${date}) у вас состоится ${typeOfLesson} номер #${lessonOrExamNumber} в ${time}, ${additionalText}`
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
            lesson[i].dateOfLastLesson = moment().toISOString()
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
            const fakeNumber = (lesson[i].lessonNumber - 1) + ""
            await buildTheMessage(lesson[i].chatId, "Вебинар", fakeNumber, "19:30", date, `Пишите вопросы с хэштэгом #Навебинар${fakeNumber}`)
        }
    }
}

/**
 * Функция для сообщения о контролльной в день контрольной
 */
async function buildExamMessage(lesson: Array<LessonInterface>) {
    const date = moment().format("DD-MM-YYYY")
    for (let i = 0; i < lesson.length; i++) {
        let holiday: boolean = isHoliday(lesson[i].holidayOne, lesson[i].holidayTwo)
        if (holiday) continue
        if ((lesson[i].lessonNumber - 1) % 8 === 0) {
            await buildTheMessage(lesson[i].chatId, "Контрольная", lesson[i].examNumber + "", "11:00", date, `готовьте треккер если вы сдаете онлайн, включайте зум, приготовьте ручку и бумагу, лишними не будут))`)
        }
        lesson[i].examNumber += 1
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
        else if (lesson[i].lessonNumber % 8 === 1 && lesson[i].lessonNumber > 8) {
            const text = `Всем привет, напоминаем об оплате за текущий месяц, дедлайн до пятницы (${date})`
            await bot.sendMessage(lesson[i].chatId, text)
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
    let checkDateOne = moment(dateOne, "DD-MM-YYYY")
    let checkDateTwo = moment(dateTwo, "DD-MM-YYYY")
    for (let i = 0; i < 7; i++) {
        if (checkDateOne.add(i, "days").format("DD-MM-YYYY") === moment().format("DD-MM-YYYY") ||
            checkDateTwo.add(i, "days").format("DD-MM-YYYY") === moment().format("DD-MM-YYYY")) {
            return true
        }
    }
    return false
}
