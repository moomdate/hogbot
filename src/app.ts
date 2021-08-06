import {HogService} from "./services/hog.service";
import cron from 'node-cron'
import { logError, logInfo, logSuccess, logWarn} from "./Utils/log";
import {env} from "./config/env.config";

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
    await hog.mainProcess();
})
