import axios from 'axios';
import qs from 'qs';
import {
    BalanceResponse,
    FarmInfoModel,
    Inventory,
    Marketlist, ProcessInProcess, ProcessAvailable,
    ResponseMarket,
    ResponseToken,
    UserInfoResponse, ProcessAvailableResponse, ProcessInProcessResponse, PigsList
} from "../models/response.model";
import {env} from "../config/env.config";
import {groupBy, logError, logInfo, logSuccess, logWarn} from "../Utils/log";
import {HogData} from "../config/hog.data";
import dayjs from "dayjs";
import {hogRare} from "../config/hog.config";


export class HogService {

    private cookie: string = '';
    private userId: string = '';


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

    get getUserId() {
        return this.userId
    }

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

    public static buildGetItemInbag() {
        return qs.stringify({
            itemtypelist: "{\"TypeList\":[0,1,2,3,4,5]}"
        });
    }

    public static findMaxId(itemList: Marketlist[]): Marketlist | undefined {
        const storeId = Math.max.apply(Math, itemList.map(function (o) {
            return o.StoreId;
        }))
        return itemList.find(i => i.StoreId === storeId);
    }

    public static buildBuyItem(burgerAmount: number, storeId: number) {
        return qs.stringify({
            type: 2,
            storeId,
            amount: burgerAmount,
            buytype: 2
        })
    }

    static buildMargetList() {
        return qs.stringify({
            type: 1
        })
    }

    private static buildData(data: Object) {
        return qs.stringify(data)
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

    public getProcess = async () => {
        const defaults = qs.stringify({
            type: 1
        })
        const config = {
            url: `${env.end_point}/process/`,
            headers: this.buildHeader(),
        };
        return axios.post<ProcessAvailableResponse>(config.url, defaults, {
            headers: config.headers
        })
    };

    public getProcessInProgress = async (data?: string) => {
        const config = {
            url: `${env.end_point}/process/`,
            headers: this.buildHeader(),
        };
        return axios.post<ProcessInProcessResponse>(config.url, data || HogService.buildProcessInProcess(), {
            headers: config.headers
        })
    };

    public static buildProcessInProcess() {
        return qs.stringify({
            type: 3
        })
    }

    public static buildProcessAvailable() {
        return qs.stringify({
            type: 1
        })
    }

    public static buildProcessSuccess(id: number) {
        return qs.stringify({
            type: 4,
            Id: id
        })
    }

    public static buildDoProcess(processId: number, pigList: PigsList[]) {
        return qs.stringify({
            type: 2,
            Id: processId,
            ListIdPig: `{"PigList":[${pigList.map(p => p.Id).join(',')}]`
        }) + '%7D'
    }

    //{"PigList":[21819550]}


    public userInfo = async () => {
        const config = {
            url: `${env.end_point}/userinfo`,
            headers: this.buildHeader(),
        };
        return axios.post<UserInfoResponse>(config.url, "", {
            headers: config.headers
        })
    };

    public pigProceed = async (farmInfo: FarmInfoModel) => {

        logInfo("Process 2 Work")
        const pigNotRare = farmInfo.pigs_list.filter(pig => !hogRare.includes(pig.Pig_id));
        if (!pigNotRare.length) {
            logInfo("Pig is rare all")
            return;
        }

        const pigPrepared = pigNotRare
            .filter(pig => pig.Pig_size === 1)
            .filter(pig => pig.Pig_weight >= env.weightToProcess)

        if (!pigPrepared.length) {
            logWarn("Pork is not ready to be processed.")
            return;
        }

        const factoryMaxSize = HogData.factoryMaxSize(farmInfo.factory);
        const {data: responseProcessObj} = await this.getProcessInProgress()
        const {List: processInProgress} = responseProcessObj

        const endProcessList = processInProgress.filter(pc => pc.Now > pc.End);
        if (endProcessList.length) {
            await this.doneProcessInProgress(endProcessList);
            return;
        }

        const {data: processAvailableResp} = await this.getProcess()
        const {List: processAvailable} = processAvailableResp;

        logInfo(`Process in progress -> (${processInProgress.filter(r => !endProcessList.includes(r)).length})`)
        if (processInProgress.length === factoryMaxSize) {
            logWarn("Factory process is full");
            return;
        }

        const processLevel = processAvailable.filter(p => p.Level === farmInfo.factory)
        const selectedProcessId = Math.max.apply(Math, processLevel.map((o) => o.Id))
        const selectedProcess = processLevel.find(p => p.Id === selectedProcessId);
        if (!selectedProcess) {
            logError('ไม่สามารถเลือกโรงแปรรูปได้')
            return;
        }

        const {data: itemInBag} = await this.getInventory(HogService.buildGetItemInbag());
        const {Item_1, Item_2, Item_1_amount, Item_2_amount} = selectedProcess;
        const countItem1: number = itemInBag.itemlist.filter(i => i.Itemid === selectedProcess.Item_1).length;
        const countItem2: number = itemInBag.itemlist.filter(i => i.Itemid === selectedProcess.Item_2).length;

        // do process
        const processSize = factoryMaxSize - processInProgress.length
        logInfo(`Proceed available: (${pigPrepared.length})  process ->  (${processSize})`)
        const grouped = groupBy(pigPrepared, 'Pig_id')
        const keys = Object.keys(grouped);

        for (let i = 0; i < processSize; i++) {
            const picGroupList = grouped[keys[i]]
            if (Item_1 && picGroupList.length * Item_1_amount > countItem1) {
                logInfo('Buy item 1')
                const bs1 = await this.doBuyItem(Item_1, (picGroupList.length * Item_1_amount) + 2, 3)
                bs1 && logSuccess('Successfully purchased hair part 1')
            }

            if (Item_2 && picGroupList.length * Item_2_amount > countItem2) {
                logInfo('Buy item 2')
                const bs2 = await this.doBuyItem(Item_2, (picGroupList.length * Item_2_amount) + 2, 3)
                bs2 && logSuccess('Successfully purchased hair part 2')
            }
            const {status} = await this.getProcessInProgress(HogService.buildDoProcess(selectedProcessId, picGroupList));
            if (status === 200) {
                logSuccess(`Process success ProcessID:${selectedProcessId} hog proceed amount:${picGroupList.length}`)
            }
        }

    }

    private async doneProcessInProgress(endProcessList: any) {
        logInfo(`process done -> (${endProcessList.length})`)
        for (let process of endProcessList) {
            console.log(`processID-> ${process.Id}`)
            const {status} = await this.getProcessInProgress(HogService.buildProcessSuccess(process.Id))
            if (status === 200) {
                logSuccess(`Done process id -> ${process.Id} SUCCESS `)
            }
        }
    }

    /**
     * ให้อาหาร ให้น้ำ เก็บเหรียญ ซื้อเบอร์เกอร์ อาบน้ำหมู
     */
    public doRaisePigs = async (farmInfo: FarmInfoModel) => {
        logInfo("Process 1 Work")
        const pigIsHungry = farmInfo.pigs_list.some(pig => pig.Pig_food);
        const pigIsThirsty = farmInfo.pigs_list.some(pig => pig.Pig_water);
        const pigIsDirty = farmInfo.fly;
        const haveItemDrop = !!farmInfo.itemdrops_list.length;

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

    public foodServeProcess = async () => {
        const {data: foodList} = await this.getInventory(HogService.buildFoodList())
        // if (!foodList.itemlist && await this.doBuyFood(HogService.BURGER_ID)) {
        //     logSuccess("By food SUCCESS")
        //     return;
        // }

        const notFoundBurger = !foodList.itemlist.some(item => item.Itemid === HogData.FOOD_BURGER_ID)
        if (notFoundBurger && await this.doBuyItem(HogData.FOOD_BURGER_ID, env.buy_amount)) {
            logSuccess("By Burger SUCCESS");
            return;
        }


        const itemBurger = foodList.itemlist.find(item => item.Itemid === HogData.FOOD_BURGER_ID)
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

    public getMarket = async (jsonStr?: string) => {
        const config = {
            url: `${env.end_point}/market/`,
            headers: this.buildHeader(),
        };
        return axios.post<ResponseMarket>(config.url, jsonStr || HogService.buildMargetList(), {
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

    public getBalance = async () => {
        const config = {
            url: `${env.end_point}/balance/`,
            headers: this.buildHeader(),
        };
        return axios.post<BalanceResponse>(config.url, '', {
            headers: config.headers
        })
    };

    public getCoinBalance = async () => {
        const {data: {User}} = await this.getBalance();
        return User;
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

    public async doBuyItem(itemID: number, amount: number, itemType?: number) {
        try {
            const {data: marketResponse} = await this.getMarket();
            const itemSelected = itemType ? marketResponse.marketlist.find(item => {
                return item.ItemId === itemID && item.Itemtype == itemType;
            }) : marketResponse.marketlist.find(item => {
                return item.ItemId === itemID
            })
            if (!itemSelected) {
                logError(`item not found ID -> ${itemID}`)
                return;
            }
            const body = HogService.buildBuyItem(amount, itemSelected.StoreId)
            const {data: buyResponse} = await this.getMarket(body)
            return buyResponse;
        } catch (e) {
            logError(`buy item: Something went wrong -> ${e}`)
            return undefined;
        }
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

    private doReceiveItem() {
        const time = dayjs();
        if (time.hour() === 6 && time.minute() === 30) {
            (async () => {
                logInfo(`H ${time.hour()} M ${time.minute()} `)
                try {
                    const re = await this.receiveDailyItem();
                    if (re.status === 200) {
                        logSuccess("receive item Successfully")
                    }
                } catch (e) {
                    logError('Can\'t receive daily item');
                }
            })()
        }
    }

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

    private buildHeader() {
        return {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': this.cookie
        };
    }
}
