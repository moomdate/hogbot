
import {HogService} from "./services/hog.service";
import cron from 'node-cron'
import {logSuccess, logWarn} from "./Utils/log";
import {env} from "./config/env.config";


let hog = new HogService();
cron.schedule('* * * * *', async () => {
    logSuccess('#### cron working...')

    async function renewToken() {
        logWarn('Renew token')
        const cookie = await new HogService().doGenerateToken()
        hog = new HogService(cookie);
    }

    try {
        if (hog.isUndefinedToken) {
            await renewToken();
        }
        await hog.doRaisePigs(env.end_point);

    } catch (e) {
        // console.log("Exception", e)
        await renewToken();
    }
})
