import {HogService} from "./services/hog.service";
import cron from 'node-cron'
import {groupBy, logError, logInfo, logSuccess, logWarn} from "./Utils/log";
import {env} from "./config/env.config";
import {hogRare} from "./config/hog.config";
import {HogData} from "./config/hog.data";
import {ProcessAvailable} from "./models/response.model";
import dayjs from "dayjs";


let hog = new HogService();
(async () => {
    try {
        await hog.doLogin();
    } catch (e) {
        logError("Token is invalid")
        throw new Error('Token is invalid');
    }
})();
logInfo('cron -> ', env.cron, ' started')
cron.schedule(env.cron, async () => {
    logSuccess('cron working...')

    async function renewToken() {
        logWarn('Renew token')
        await hog.doLogin();
    }

    try {
        if (hog.isUndefinedToken) {
            await renewToken();
        }
        const time = dayjs(new Date());
        const {data: farmInfo} = await hog.getFarmInfo(hog.getUserId);
        if (env.raise) {
            await hog.doRaisePigs(farmInfo)
        }
        if (env.processed && time.minute() % 5 === 0) {
            await hog.pigProceed(farmInfo);
        }
        // const find = farmInfo.pigs_list.find(pig=>pig.Pig_sex === 1 && pig.Pig_size === 1); // แม่พันธ์

    } catch (e) {

        if (e.statusCode === 401) {
            logError(`Facebook token is invalid -> ${e.statusCode}`)
        } else if (e.statusCode != 200) {
            logError(`Something went wrong ->  ${e}`)
        } else {
            logError(`Business exception ${e.message}`)
        }
        // console.log("Exception", e)
        await renewToken();
    }
})
