import axios from 'axios';
import qs from 'qs';
import {
    FarmInfoModel,
    Inventory,
    Marketlist,
    ResponseMarket,
    ResponseToken,
    UserInfoResponse
} from "../models/response.model";
import {env} from "../config/env.config";
import {logError, logInfo, logSuccess} from "../Utils/log";
import {HappyHogData} from "../data/happyHogData";
import dayjs from "dayjs";


export class HogService {

    private cookie: string | undefined;
    private userId: string | undefined;


    constructor(private cookieParam?: string) {
        if (cookieParam) {
            this.cookie = cookieParam;
        }
    }

    get isUndefinedToken() {
        return !this.cookie
    }

    set setUserId(userIdParam: string) {
        this.userId = userIdParam
    }

    public getFarmInfo = async (userid: string) => {
        const data = HogService.buildData({
            userid
        })
        const config = {
            url: `${env.end_point}/farminfo`,
            headers: this.buildHeader(),
        };
        return axios.post<FarmInfoModel>(config.url, data, {
            headers: config.headers
        })
    };

    public takeAllCoin = async () => {
        const data = qs.stringify({
            type: 2
        })
        const config = {
            url: `${env.end_point}/itemdrop`,
            headers: this.buildHeader(),
        };
        return axios.post<FarmInfoModel>(config.url, data, {
            headers: config.headers
        })
    };

    public userInfo = async () => {
        const config = {
            url: `${env.end_point}/userinfo`,
            headers: this.buildHeader(),
        };
        return axios.post<UserInfoResponse>(config.url, "", {
            headers: config.headers
        })
    };

    public doRaisePigs = async () => {
        if (!this.userId)
            throw Error('UserId not set.');

        const {data} = await this.getFarmInfo(this.userId);

        const pigIsHungry = data.pigs_list.some(pig => pig.Pig_food);
        const pigIsThirsty = data.pigs_list.some(pig => pig.Pig_water);
        const pigIsDirty = data.fly;
        const haveItemDrop = !!data.itemdrops_list.length;

        this.doReceiveItem();
        if (pigIsHungry) {
            logInfo("Pig -> is hungry")
            await this.foodServeProcess()
        }
        if (pigIsThirsty) {
            logInfo("Pig -> is Thirsty")
            const watered = await this.useItem(HogService.buildItemWater())
            if (watered) {
                logSuccess("water [SUCCESS]")
            }
        }
        if (pigIsDirty) {
            logInfo("Pig -> is dirty")
            const watered = await this.useItem(HogService.buildItemShower())
            if (watered) {
                logSuccess("Shower [SUCCESS]")
            }
        }
        if (haveItemDrop) {
            logInfo("Coin drop")
            const take = await this.takeAllCoin();
            if (take) {
                logSuccess("Store ALL coin SUCCESS")
            }
        }
    }


    private doReceiveItem() {
        const time = dayjs();
        if (time.hour() === 6 && time.minute() === 30) {
            (async () => {
                logInfo(`H ${time.hour()} M ${time.minute()} `)
                try {
                    const re = await this.receiveDailyItem();
                    if (re) {
                        logSuccess("receive item Successfully")
                    }
                } catch (e) {
                    logError('Can\'t receive daily item');
                }
            })()
        }
    }

    public foodServeProcess = async () => {
        const {data: foodList} = await this.getInventory(HogService.buildFoodList())
        // if (!foodList.itemlist && await this.doBuyFood(HogService.BURGER_ID)) {
        //     logSuccess("By food SUCCESS")
        //     return;
        // }

        const notFoundBurger = !foodList.itemlist.some(item => item.Itemid === HappyHogData.FOOD_BURGER_ID)
        if (notFoundBurger && await this.doBuyFood(HappyHogData.FOOD_BURGER_ID)) {
            logSuccess("By Burger SUCCESS");
            return;
        }


        const itemBurger = foodList.itemlist.find(item => item.Itemid === HappyHogData.FOOD_BURGER_ID)
        if (!itemBurger) {
            logError("Not found burger")
            return;
        }

        const foodSuccess = await this.useItem(HogService.buildItemUse(itemBurger.InventoryId))
        if (foodSuccess) {
            logSuccess("Already fed SUCCESS")
        }
        return foodSuccess;
    };

    public getMarket = async (jsonStr: string) => {
        const config = {
            url: `${env.end_point}/market/`,
            headers: this.buildHeader(),
        };
        return axios.post<ResponseMarket>(config.url, jsonStr, {
            headers: config.headers
        })
    };

    public getInventory = async (jsonStr: string) => {
        const config = {
            url: `${env.end_point}/inventory/`,
            headers: this.buildHeader(),
        };
        return axios.post<Inventory>(config.url, jsonStr, {
            headers: config.headers
        })
    };

    public receiveDailyItem = async () => {
        const jsonStr = qs.stringify({
            type: 2,
        });
        const config = {
            url: `${env.end_point}/daily/`,
            headers: this.buildHeader(),
        };
        return axios.post(config.url, jsonStr, {
            headers: config.headers
        })
    };

    public useItem = async (jsonStr: any) => {
        const config = {
            url: `${env.end_point}/useitems/`,
            headers: this.buildHeader(),
        };
        return axios.post<ResponseMarket>(config.url, jsonStr, {
            headers: config.headers
        })
    };

    public static buildItemWater() {
        return qs.stringify({
            type: 2
        });
    }

    public static buildItemShower() {
        return qs.stringify({
            type: 3
        });
    }

    public static buildItemUse(invid: number) {
        return qs.stringify({
            type: 1,
            invid
        });
    }


    public static buildFoodList() {
        return qs.stringify({
            itemtypelist: "{\"TypeList\":[0]}"
        });
    }


    public async doBuyFood(itemID: number) {
        const {data: marketResponse} = await this.getMarket(HogService.buildMargetList())
        const burgerItem = marketResponse.marketlist.find(item => item.ItemId === itemID)
        // const burgerItem = HogService.findMaxId(itemSlot2);
        if (!burgerItem) {
            throw Error('burger item not found.');
        }
        const {data: buyResponse} = await this.getMarket(HogService.buildBurger(env.buy_amount, burgerItem.StoreId))
        return buyResponse;
    }

    public static findMaxId(itemList: Marketlist[]): Marketlist | undefined {
        const storeId = Math.max.apply(Math, itemList.map(function (o) {
            return o.StoreId;
        }))
        return itemList.find(i => i.StoreId === storeId);
    }

    public doGenerateToken = async () => {
        const jsonData = qs.stringify({
            logintype: 1,
            logintoken: env.facebook_token,
            device: 'APPLE',
            version: '2.0.5'
        })
        const config = {
            url: `${env.end_point}/register/`,
        };
        const {data: {AccessToken}} = await axios.post<ResponseToken>(config.url, jsonData, {
            headers: {}
        });
        const {headers} = await this.doGetCookie(AccessToken);
        const [cookie] = headers['set-cookie'];
        return cookie;
    };

    public doLogin = async () => {
        logInfo("=== DO LOGIN ===")
        this.cookie = await this.doGenerateToken();
        const {data: {userid}} = await this.userInfo();
        if (userid) {
            this.setUserId = userid;
            logSuccess(`=== SET UID: ${userid} ===`)
        } else {
            throw Error('Not found user info');
        }
    };

    private doGetCookie = async (accesstoken: string) => {
        const jsonData = qs.stringify({
            accesstoken,
            logintoken: env.facebook_token,
            logintype: 1,
            FCM: '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
        })
        const config = {
            url: `${env.end_point}/login/`,
            headers: this.buildHeader(),
        };
        return axios.post<ResponseToken>(config.url, jsonData, {
            headers: {}
        });
    };

    public static buildBurger(burgerAmount: number, storeId: number) {
        return qs.stringify({
            type: 2,
            storeId,
            amount: burgerAmount,
            buytype: 2
        })
    }

    private static buildData(data: Object) {
        return qs.stringify(data)
    }

    static buildMargetList() {
        return qs.stringify({
            type: 1
        })
    }

    private buildHeader() {
        return {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': this.cookie
        };
    }
}
