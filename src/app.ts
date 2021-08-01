import {HogService} from "./services/hog.service";
import cron from 'node-cron'
import {logError, logSuccess, logWarn} from "./Utils/log";
import {env} from "./config/env.config";


let hog = new HogService();
(async () => {
    await hog.doLogin();
})();
console.log('cron -> ', env.cron)
cron.schedule(env.cron, async () => {
    logSuccess('- cron working...')

    async function renewToken() {
        logWarn('Renew token')
        await hog.doLogin();
    }

    try {
        if (hog.isUndefinedToken) {
            await renewToken();
        }
        await hog.doRaisePigs();


    } catch (e) {

        if (e.statusCode == 401) {
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
