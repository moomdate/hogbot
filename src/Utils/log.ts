import dayjs from "dayjs";

export function logSuccess(msg: string) {
    console.log(`\x1b[32m ${logDate()}`, msg)
}

export function logError(msg: string) {
    console.log(`\x1b[31m ${logDate()}`, msg)
}

export function logWarn(msg: string) {
    console.log(`\x1b[33m ${logDate()}`, msg)
}

export function logInfo(msg: string) {
    console.log(`\x1b[34m ${logDate()}`, msg)
}

function logDate() {
    return dayjs().format('DD/MM/YYYY hh:mm - ')
}
