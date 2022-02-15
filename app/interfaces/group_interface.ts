export interface GroupInterface {
    chatId: string
    groupName: string
    currentWeek: number
    lessons: Array<Object>
    webinars: Array<Object>
    holidays: Array<string>
    holidayWeeksNumbers: Array<number>
    groupAdmin: string
    isActive: boolean
    isESDP: boolean
}