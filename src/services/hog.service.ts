import axios, {AxiosResponse} from 'axios';
import qs from 'qs';
import {FarmInfoModel, Inventory, Marketlist, ResponseMarket, ResponseToken} from "../models/response.model";
import {env} from "../config/env.config";
import {logError, logInfo, logSuccess} from "../Utils/log";


export class HogService {

    private cookie: string | undefined;
    public static readonly BURGER_ID = 0;
    public static readonly MILE_ID = 1;
    public static readonly ICE_CREAM_ID = 1;
    public static readonly LETTUCE_ID = 3;
    public static readonly SALAD_ID = 4;


    constructor(private cookieParam?: string) {
        if (cookieParam) {
            this.cookie = cookieParam;
        }
    }

    get isUndefinedToken() {
        return !this.cookie
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

    public doRaisePigs = async (userId: string) => {
        const {data} = await this.getFarmInfo(userId);

        const pigIsHungry = data.pigs_list.some(pig => pig.Pig_food);
        const pigIsThirsty = data.pigs_list.some(pig => pig.Pig_water);
        const pigIsDirty = data.fly;
        const haveItemDrop = !!data.itemdrops_list.length;

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


    public foodServeProcess = async () => {
        const {data: foodList} = await this.getInventory(HogService.buildFoodList())
        // if (!foodList.itemlist && await this.doBuyFood(HogService.BURGER_ID)) {
        //     logSuccess("By food SUCCESS")
        //     return;
        // }

        const notFoundBurger = !foodList.itemlist.some(item => item.Itemid === HogService.BURGER_ID)
        if(notFoundBurger && await this.doBuyFood(HogService.BURGER_ID)){
            logSuccess("By Burger SUCCESS");
            return;
        }


        const itemBurger = foodList.itemlist.find(item => item.Itemid === HogService.BURGER_ID)
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
            throw 'burger item not found.';
        }
        const {data: buyResponse} = await this.getMarket(HogService.buildBurger(1, burgerItem.StoreId))
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
