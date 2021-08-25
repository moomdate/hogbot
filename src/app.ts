import {HogService} from "./services/hog.service";
import cron from 'node-cron'
import {logError, logInfo, logSuccess, logWarn} from "./Utils/log";
import {env} from "./config/env.config";
import express, {Application, Request, Response} from 'express'
import timeout from 'connect-timeout';
import {clusterNode} from "./services/cluster";


const app: Application = express()
app.use(express.json())
app.use(timeout('120000'));

let hog = new HogService();
(async () => {
    try {
        // await hog.doLogin();
        // const promise = await hog.doBreed();
        // const promise2 = await hog.speedUpBreed();
        // const promise3 = await hog.sellChildPig();
        // hog.breedCount(100).then(r => {
        //     console.log('success', r)
        // })
        //     .catch(e => {
        //         console.log('error', e)
        //     })

    } catch (e) {
        console.log(e)
        // logError("Token is invalid")
        // throw new Error('Token is invalid');
    }
})();


logInfo('cron -> ', env.cron, ' started')
cron.schedule(env.cron, async () => {
    logSuccess('cron working...')
    // hog.doGetTokenList()
    //     .then(async (r) => {
    //         for (let tokenResponse of r) {
    //             hog.setToken = tokenResponse.token;
    //             await hog.doLogin();
    //             await hog.mainProcess(tokenResponse.config);
    //         }
    //     })
    //     .catch(console.error)
    // await hog.mainProcess();
})


app.post('/breed', async (req: Request, res: Response) => {
    const {token, round, page} = req.body;
    let newHog = new HogService();
    newHog.setToken = token;
    await newHog.doLogin();
    newHog.breedCount(+round, page).then(r => {
        return res.send(r)
    })
    // const data = await newHog.doLogin();

})
app.listen(3000)
