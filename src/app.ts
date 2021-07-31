import dotenv from 'dotenv';
import express from 'express';
import {HogService} from "./services/hog.service";
import cron from 'node-cron'
import dayjs from 'dayjs';

dotenv.config({
    path: '.env'
});

/**
 * Express server application class.
 * @description Will later contain the routing system.
 */
class Server {
    public app = express();
}

let hog = new HogService();
cron.schedule('* * * * *', async () => {
    console.log('cron working')
    async function renewToken() {
        console.log('Renew token')
        const cookie = await new HogService().doGenerateToken()
        hog = new HogService(cookie);
    }

    try {
        if (hog.isUndefinedToken) {
            await renewToken();
        }
        const {data} = await hog.getFarmInfo('1963171457171226');

        const pigIsHungry = data.pigs_list.some(pig => pig.Pig_food);
        const pigIsThirsty = data.pigs_list.some(pig => pig.Pig_water);
        const pigIsDirty = data.fly;
        const haveItemDrop = !!data.itemdrops_list.length;
        //
        // console.log(`Hungry:${pigIsHungry} \nThirsty:${pigIsThirsty} \nDirty:${pigIsDirty} \nCoin:${haveItemDrop}`)
        if (pigIsHungry) {
            console.log("Pig is hungry")
            await hog.foodServeProcess()
        }
        if (pigIsThirsty) {
            console.log("Pig is Thirsty")
            const watered = await hog.useItem(HogService.buildItemWater())
            if (watered) {
                console.log("water SUCCESS")
            }
        }
        if(pigIsDirty){
            console.log("Pig is dirty")
            const watered = await hog.useItem(HogService.buildItemShower())
            if (watered) {
                console.log("Shower SUCCESS")
            }
        }
        if(haveItemDrop){
            console.log("coin drop")
            const take = await hog.takeAllCoin();
            if (take) {
                console.log("store ALL coin")
            }
        }

    } catch (e) {
        // console.log("Exception", e)

        await renewToken();
    }
})
// const server = new Server();
// ((port = process.env.APP_PORT || 5000) => {
//     server.app.listen(port, () => console.log(`> Listening on port ${port}`));
// })();
//
