import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/th'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Bangkok')

export function logSuccess(...msg: string[]) {
    console.log(`\x1b[32m ${logDate()}`, msg.join(''))
}

export function logError(...msg: string[]) {
    console.log(`\x1b[31m ${logDate()}`, msg.join(''))
}

export function logWarn(...msg: string[]) {
    console.log(`\x1b[33m ${logDate()}`, msg.join(''))
}

export function logInfo(...msg: string[]) {
    console.log(`\x1b[34m ${logDate()}`, msg.join(''))
}

function logDate() {
    return dayjs().format('DD/MM/YYYY HH:mm - ');
}

export function groupBy(list: any[], key: string): any {
    return list.reduce((hash, obj) => ({...hash, [obj[key]]: (hash[obj[key]] || []).concat(obj)}), {})
}
