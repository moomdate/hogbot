import axios from 'axios';
import qs from 'qs';
import {
    BalanceResponse,
    FarmInfoModel, hogBreedResponse,
    Inventory,
    Marketlist, MatingResponse,
    PigsList, PrepareFarm,
    ProcessAvailableResponse,
    ProcessInProcessResponse, ResponseFarmPage,
    ResponseMarket,
    ResponseToken, SellPigResponse, SimpleResponse, TokenConfig, TokenResponse,
    UserInfoResponse
} from "../models/response.model";
import {env} from "../config/env.config";
import {groupBy, logError, logInfo, logSuccess, logWarn} from "../Utils/log";
import {HogData} from "../config/hog.data";
import dayjs from "dayjs";
import {hogList, hogNotRare} from "../config/hog.config";

const {google} = require("googleapis");


export class HogService {

    public fb_token: string = '';
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

    public set setToken(token: string) {
        this.fb_token = token
        console.log('token ', token)
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

    public static buildItemUseForHog(invid: number, idpig: number) {
        return qs.stringify({
            type: 1,
            invid,
            idpig
        });
    }

    public static buildFoodList() {
        return qs.stringify({
            itemtypelist: "{\"TypeList\":[0]}"
        });
    }

    public static buildGetItemInBag() {
        return qs.stringify({
            itemtypelist: "{\"TypeList\":[0,1,2,3,4,5]}"
        });
    }

    // item ????????????????????????????????????????????? 1:1
    public static buildGetItemForHog() {
        return qs.stringify({
            itemtypelist: "itemtypelist: {\"TypeList\":[1]}"
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

    public static buildSellPic(pigList: PigsList[]) {
        return qs.stringify({
            type: 2,
            piglist: `{"PigList":[${pigList.map(p => p.Id).join(',')}]`
        }) + '%7D'
    }

    public static buildMatingList() {
        return qs.stringify({
            type: 1,
            pigid: -1
        });
    }

    /*
    ????????????????????????
     */
    public static buildMating(femaleId: number, maleId: number) {
        return qs.stringify({
            type: 2,
            idpigfemale: femaleId,
            idpigmale: maleId,
        });
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

    public getFarmPage = async (page?: number) => {
        const param = HogService.buildData({
            type: 1,
            pageid: page ? page : 0
        })
        const config = {
            url: `${env.end_point}/farmpage/`,
            headers: this.buildHeader(),
        };
        const {headers, data} = await axios.post<ResponseFarmPage>(config.url, param, {
            headers: config.headers
        })
        const [cookie] = headers['set-cookie'];
        this.cookie = cookie;
        return data;
    };

    //{"PigList":[21819550]}

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

    public userInfo = async () => {
        const config = {
            url: `${env.end_point}/userinfo`,
            headers: this.buildHeader(),
        };
        return axios.post<UserInfoResponse>(config.url, "", {
            headers: config.headers
        })
    };

    public pigProceed = async (farmInfo: FarmInfoModel, config: TokenConfig) => {

        logInfo("Process 2 Work")
        const {data: responseProcessObj} = await this.getProcessInProgress()
        const {List: processInProgress} = responseProcessObj

        const endProcessList = processInProgress.filter(pc => pc.Now > pc.End);
        if (endProcessList.length) {
            await this.doneProcessInProgress(endProcessList);
            return;
        }

        const pigNotRare = config.processedExcept ?
            farmInfo.pigs_list.filter(pig => !config.processedHogList.map(m => m.id).includes(pig.Pig_id)) :
            farmInfo.pigs_list.filter(pig => config.processedHogList.map(m => m.id).includes(pig.Pig_id));
        if (!pigNotRare.length) {
            logInfo("All rare pigs")
            return;
        }

        const pigPrepared = pigNotRare
            .filter(pig => pig.Pig_size === 1)
            .filter(pig => pig.Pig_weight >= env.weightToProcess)

        if (!pigPrepared.length) {
            logWarn("Pork is not ready to be processed.")
            return;
        }

        const {data: processAvailableResp} = await this.getProcess()
        const {List: processAvailable} = processAvailableResp;

        logInfo(`Process in progress -> (${processInProgress.filter(r => !endProcessList.includes(r)).length})`)
        const factoryMaxSize = HogData.factoryMaxSize(farmInfo.factory);
        if (processInProgress.length === factoryMaxSize) {
            logWarn("The factory process is full.");
            return;
        }

        const factoryLevel = farmInfo.factory > 3 ? 3 : farmInfo.factory;
        const processLevel = processAvailable.filter(p => p.Level === factoryLevel)
        const selectedProcessId = Math.max.apply(Math, processLevel.map((o) => o.Id))
        const selectedProcess = processLevel.find(p => p.Id === selectedProcessId);
        if (!selectedProcess) {
            logError('Unable to select a processing style.')
            return;
        }
        logInfo("Use process id -> ", selectedProcess.Id + '')
        const {data: itemInBag} = await this.getInventory(HogService.buildGetItemInBag());
        const {Item_1, Item_2, Item_1_amount, Item_2_amount} = selectedProcess;
        const countItem1: number = itemInBag.itemlist.filter(i => i.Itemid === selectedProcess.Item_1).length;
        const countItem2: number = itemInBag.itemlist.filter(i => i.Itemid === selectedProcess.Item_2).length;

        // do process
        const processSize = factoryMaxSize - processInProgress.length
        logInfo(`Available processing: (${processSize})  do a number of processing: (${pigPrepared.length})`)
        const grouped = groupBy(pigPrepared, 'Pig_id')
        const keys = Object.keys(grouped);

        for (let i = 0; i < processSize && i < keys.length; i++) {
            const picGroupList = grouped[keys[i]]
            if (Item_1 && picGroupList.length * Item_1_amount > countItem1) {
                logInfo('Purchasing an item 1 -> ID:', Item_1 + '')
                const bs1 = await this.doBuyItem(Item_1, (picGroupList.length * Item_1_amount) + 2, 3)
                bs1 && logSuccess('Successfully purchased 1 ingredient.')
            }

            if (Item_2 && picGroupList.length * Item_2_amount > countItem2) {
                logInfo('Buy item 2 -> ID:', Item_2 + '')
                const bs2 = await this.doBuyItem(Item_2, (picGroupList.length * Item_2_amount) + 2, 3)
                bs2 && logSuccess('Successfully purchased 2 ingredient.')
            }
            const {status} = await this.getProcessInProgress(HogService.buildDoProcess(selectedProcessId, picGroupList));
            if (status === 200) {
                logSuccess(`Enter the process -> ProcessID:${selectedProcessId} , number of pigs processed:${picGroupList.length}`)
            }
        }

    }

    getSheetToken = async () => {
        const auth = new google.auth.GoogleAuth({
            keyFile: "credentials.json",
            scopes: "https://www.googleapis.com/auth/spreadsheets",
        });

        // Create client instance for auth
        const client = await auth.getClient();

        const googleSheets = google.sheets({version: "v4", auth: client});
        const spreadsheetId = "1nEhoW6IdXEJMCL45RqdKOqqtuLS65UgEiU_CW9d4WA8";
        const getRows = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: "Sheet1!B:B",
        });

        if (!getRows.data.values)
            return [];

        return getRows.data.values.map((r: [any]) => {
            const [col] = r;
            return col;
        })
    }

    async renewToken() {
        logWarn('Renew token')
        await this.doLogin();
    }

    public mainProcess = async (config: TokenConfig) => {
        try {
            if (this.isUndefinedToken) {
                await this.renewToken()
            }
            const {data: farmInfo} = await this.getFarmInfo(this.getUserId);
            if (config.autoRaise) {
                await this.doRaisePigs(farmInfo, config)
            }
            if (config.autoProcessed) {
                await this.pigProceed(farmInfo, config);
            }

            // const find = farmInfo.pigs_list.find(pig => pig.Pig_sex === 1 && pig.Pig_size === 1); // ????????????????????????

        } catch (e) {

            if (e.statusCode === 401) {
                logError(`Facebook token is invalid -> ${e.statusCode}`)
            } else if (e.statusCode != 200) {
                logError(`Something went wrong ->  ${e}`)
            } else {
                logError(`Business exception ${e.message}`)
            }
            await this.renewToken();
        }
    }

    /**
     * ???????????????????????? ?????????????????? ?????????????????????????????? ?????????????????????????????????????????? ???????????????????????????
     */
    public doRaisePigs = async (farmInfo: FarmInfoModel, config: TokenConfig) => {
        logInfo("Process 1 Work")
        const pigIsHungry = farmInfo.pigs_list.some(pig => pig.Pig_food);
        const pigIsThirsty = farmInfo.pigs_list.some(pig => pig.Pig_water);
        const pigIsDirty = farmInfo.fly;
        const haveItemDrop = !!farmInfo.itemdrops_list.length;

        if (config.useFoodSupplement) {
            await this.useSupplementFood();
        }


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

    public useSupplementFood = async () => {
        const {data: foodList} = await this.getInventory(HogService.buildFoodList())

        const foodSupplement = foodList.itemlist.find(item => item.Itemid === HogData.FOOD_SUPPLEMENT)
        if (!foodSupplement)
            return;

        const foodSuccess = await this.useItem(HogService.buildItemUse(foodSupplement.InventoryId))
        if (foodSuccess) {
            logSuccess("Already fed Food Supplement")
        }
    }

    public foodServeProcess = async () => {
        const {data: foodList} = await this.getInventory(HogService.buildFoodList())

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

    public speedUpBreed = async () => {
        const {data: farmInfo} = await this.getFarmInfo(this.getUserId);
        const hogPregnant = farmInfo.pigs_list.find(pig => pig.Pig_sex === 1 && pig.Pig_size === 1 && pig.Pig_pregnant === 1);
        if (!hogPregnant) {
            return;
        }

        const {data: itemList} = await this.getInventory(HogService.buildGetItemInBag())
        const notFoundBurger = !itemList.itemlist.some(item => item.Itemid === HogData.RENG_CROD)
        if (notFoundBurger && await this.doBuyItem(HogData.RENG_CROD, 30)) {
            logSuccess("By itemSpeedBreed SUCCESS");
            return;
        }
        const itemSpeedBreed = itemList.itemlist.find(item => item.Itemid === HogData.RENG_CROD)
        if (!itemSpeedBreed) {
            logError('not found speed breed item')
            return;
        }
        const speedBreed = await this.useItem(HogService.buildItemUseForHog(itemSpeedBreed.InventoryId, hogPregnant.Id))
        if (speedBreed) {
            logSuccess('Breed speed up SUCCESS')
        }
    }


    public sellChildPig = async (): Promise<SellPigResponse> => {
        const {data: farmInfo} = await this.getFarmInfo(this.getUserId);
        // todo: not sell rare pig
        const childPig = farmInfo.pigs_list.filter(pig => pig.Pig_size === 0); // && !(pig.Pig_id > 40 && pig.Pig_id < 71)
        if (!childPig || childPig.length === 0) {
            return {
                success: false,
                rarePig: false
            }
        }
        if (childPig.some(p => !hogNotRare.includes(p.Pig_id))) {
            return {
                success: true,
                rarePig: true,
                pigId: childPig.find(p => p)?.Pig_id
            }
        }

        const {data} = await this.sellPig(HogService.buildSellPic(childPig));
        if (data) {
            return {
                success: true,
                rarePig: false
            }
        }
        return {
            success: false,
            rarePig: false
        }
    }


    public doBreed = (): Promise<hogBreedResponse> =>
        new Promise((resolve, reject) => {
            this.doRequestBreed()
                .then((data) => resolve(data))
                .catch(e => resolve({
                    success: false
                }))
        })

    public getMating = async (jsonData?: string) => {
        const config = {
            url: `${env.end_point}/mating/`,
            headers: this.buildHeader(),
        };
        return axios.post<MatingResponse>(config.url, jsonData ? jsonData : HogService.buildMatingList(), {
            headers: config.headers
        })
    };

    public sellPig = async (jsonData?: string) => {
        const config = {
            url: `${env.end_point}/sellpig/`,
            headers: this.buildHeader(),
        };
        return axios.post<SimpleResponse>(config.url, jsonData, {
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
            logintoken: this.fb_token,
            device: 'ANDROID',
            version: '2.1.2'
        })
        const config = {
            url: `${env.end_point}/register/`,
        };
        const {data: {AccessToken}} = await axios.post<ResponseToken>(config.url, jsonData, {
            headers: {
                'User-Agent': 'HappyHogM/0 CFNetwork/1306 Darwin/21.0.0'
            }
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

    public getTokenList = async () => {
        const basic = Buffer.from("moomdate" + ":" + "a").toString('base64')
        const config = {
            url: `http://localhost:8080/api/token/all`,
            headers: {
                Authorization: 'Basic ' + basic,
            },
        };
        return axios.get(config.url, {
            headers: config.headers
        });
    }

    doGetTokenList = (): Promise<TokenResponse[]> =>
        new Promise((resolve, reject) => {
            this.getTokenList()
                .then(({data}) => resolve(data))
                .catch(e => reject(e))
        })

    private async doneProcessInProgress(endProcessList: any) {
        logInfo(`Process done -> (${endProcessList.length})`)
        for (let process of endProcessList) {
            const {status} = await this.getProcessInProgress(HogService.buildProcessSuccess(process.Id))
            if (status === 200) {
                logSuccess(`the process is finished  ID -> ${process.Id} `)
            }
        }
    }

    private doRequestBreed = async (): Promise<hogBreedResponse> => {
        const {data: farmInfo} = await this.getFarmInfo(this.getUserId);
        const hogFemaleList = farmInfo.pigs_list.filter(pig => pig.Pig_sex === 1 && pig.Pig_size === 1);
        if (hogFemaleList.length === 0) {
            return {
                notFoundMom: true,
                isPregnant: false,
                success: false
            }
        }
        const hogMom = farmInfo.pigs_list.find(pig => pig.Pig_sex === 1 && pig.Pig_size === 1 && pig.Pig_pregnant === 0);
        if (!hogMom) {
            return {
                notFoundMom: true,
                isPregnant: true,
                success: false
            }
        }
        const {data: maleList} = await this.getMating();
        const hogMale = maleList.List.find(a => a);
        if (!hogMale) {
            return {
                isNotBalanceDad: true,
                notFoundDad: true,
                success: false
            }
        }
        const {data} = await this.getMating(HogService.buildMating(hogMom.Id, hogMale.Id))
        if (data) {
            return {
                notFoundMom: false,
                notFoundDad: false,
                success: true
            }
        }
        return {
            notFoundMom: false,
            notFoundDad: false,
            success: false
        }
    };

    public prepareStall = async (page?: number): Promise<PrepareFarm> => {
        const {data: farmInfo} = await this.getFarmInfo(this.getUserId);
        if (page == 1 && farmInfo.farmpage2 != 1) {
            return {
                farm2NotFound: true,
                farmIsFull: false
            }
        }
        const hogMom = farmInfo.pigs_list.find(pig => pig.Pig_sex === 1 && pig.Pig_size === 1 && pig.Pig_pregnant === 0);
        if (farmInfo.pigs_list.filter(p => p.Pig_size === 1).length < HogData.farmMaxSize(farmInfo.farm)) {
            // console.log('free farm', HogData.farmMaxSize(farmInfo.farm) - farmInfo.pigs_list.length)
            return {
                farmIsFull: false
            }
        }
        // console.log('limit', HogData.farmMaxSize(farmInfo.farm), farmInfo.pigs_list.filter(p => p.Pig_size === 1).length)
        return {
            farmIsFull: true
        }


    }


    public breedCount = async (loop: number, page?: number) => new Promise(async (resolve, reject) => {
        let i = 0;
        let msg = '??????????????????????????????????????????????????????'
        let success = true;
        console.log('init ', loop)
        while (i < loop) {
            try {

                const prepareStall = await this.prepareStall(page);
                if (prepareStall && prepareStall.farmIsFull) {
                    msg = '???????????????????????????'
                    success = false;
                    break;
                }
                if (prepareStall.farm2NotFound) {
                    msg = '??????????????????????????????2'
                    success = false;
                    break;
                }
                if (page && page != 0) {
                    console.log('farm 2')
                    const data = await this.getFarmPage(page);
                }

                const doBreed = await this.doBreed();
                if (doBreed && doBreed.isNotBalanceDad) {
                    msg = '???????????????????????????????????????'
                    success = false;
                    break;
                }
                if (doBreed && doBreed.notFoundMom && !doBreed.isPregnant) {
                    msg = '???????????????????????????????????????'
                    success = false;
                    break;
                }
                const promise2 = await this.speedUpBreed();
                const promise3 = await this.sellChildPig();
                if (promise3 && promise3.rarePig) {
                    msg = '?????????????????????????????? -> ' + hogList.find(p => p.id === promise3.pigId)?.name
                    success = true;
                    break;
                }
                if (doBreed) {
                    i++;
                }
                if (i > (loop * 3)) {
                    reject({
                        success: success,
                        msg: 'timeout',
                        round: i
                    })
                }
            } catch (e) {
                resolve({
                    success: success,
                    msg: e.message,
                    round: i
                })
                break;
            }
        }
        resolve({
            success: success,
            msg,
            round: i
        })
    })

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
            'Cookie': this.cookie,
            'User-Agent': 'HappyHogM/0 CFNetwork/1306 Darwin/21.0.0'
        };
    }
}


