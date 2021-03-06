import exp from "constants";

export interface Factoryup {
    end: number;
    start: number;
}

export interface Farmup {
    end: number;
    start: number;
}

export interface PigsList {
    Id: number;
    Pig_id: number;
    Pig_size: number;
    Pig_sex: number;
    Pig_germ: number;
    Pig_mating: number;
    Pig_notdead: number;
    Pig_toxin: number;
    Pig_pregnant: number;
    Pig_power: number;
    Pig_gene: number;
    Pig_medic: number;
    Pig_weight: number;
    Pig_food: boolean;
    Pig_water: boolean;
    Pig_tobreed: boolean;
    Pig_dead: boolean;
    Pig_cansteal: boolean;
    Pig_curLefttime: string;
    Pig_StrName: string;
}

export interface FarmInfoModel {
    factory: number;
    factoryup: Factoryup;
    farm: number;
    farmpage2: number;
    farmup: Farmup;
    fly: boolean;
    itemdrops_list: any[];
    lasttime: number;
    laxative: boolean;
    lineupid: number;
    lineuptext: string;
    pigcount: number;
    pigs_list: PigsList[];
    processcount: number;
}

export interface ResponseToken {
    AccessToken: string;
}

export interface ResponseFarmPage {
    status: number;
}

export interface Marketlist {
    StoreId: number;
    ItemId: number;
    Itemtype: number;
    Itemoption: number;
    Slot: number;
    Gemprice: number;
    Coinprice: number;
    Level: number;
}

export interface Topuplist {
    Id: number;
    Promotion: number;
    SpriteId: number;
    PromotionSprite: number;
    Slot: number;
    MinLimit: number;
    CountLimit: number;
    Price: number;
    Code: string;
    Infomation: string;
    Url: string;
    Diamond: string;
    Google_Product: string;
    Apple_Product: string;
    Disable: boolean;
}

export interface ResponseMarket {
    marketlist: Marketlist[];
    topuplist: Topuplist[];
}

export interface Itemlist {
    InventoryId: number;
    Itemid: number;
    Itemoption: number;
    Itemtype: number;
    Quantity: number;
}

export interface Powerbreed {
    current: number;
    max: number;
}

export interface Inventory {
    itemlist: Itemlist[];
    powerbreed: Powerbreed;
}

export interface UserInfoResponse {
    coins: number;
    exp: number;
    gems: number;
    level: number;
    maxexp: number;
    pigcount: number;
    point: number;
    powerb: number;
    tutorial: number;
    userid: string;
    wheels: number;
}

export interface ProcessAvailable {
    Id: number;
    Pigid: number;
    Item_1: number;
    Item_2: number;
    Itemidresult: number;
    Item_1_amount: number;
    Item_2_amount: number;
    Pig_price: number;
    Process_time: number;
    Process_exp: number;
    Level: number;
}

export interface Exp {
    exp: number;
    level: number;
    maxexp: number;
}

export interface User {
    coins: number;
    gems: number;
    point: number;
}

export interface BalanceResponse {
    Exp: Exp;
    MailBoxCount: number;
    MailCount: number;
    User: User;
}

export interface ProcessInProcess {
    Id: number;
    Itemid: number;
    Amount: number;
    Coin: number;
    Skipprice: number;
    Create: number;
    Now: number;
    End: number;
}

export interface ProcessAvailableResponse {
    List: ProcessAvailable[]
}

export interface ProcessInProcessResponse {
    List: ProcessInProcess[]
}

export interface TokenConfig {
    tokenId?: string;
    autoRaise: boolean;
    autoProcessed: boolean;
    useFoodSupplement: boolean;
    enabled: boolean;
    weight: number;
    processedExcept: boolean;
    processedHogList: HogModel[]
}

export interface TokenResponse {
    _id: string;
    token: string;
    config: TokenConfig;
    user: string;
}

export interface HogModel {
    id: number;
    name: string;
}

export interface MatingResponse {
    List: HogMale[]
}

export interface HogMale {
    FbName: string;
    Id: number;
    Pigid: number;
    Sex: number;
    Price: number;
}

export interface SimpleResponse {
    Coin: number;
}

export interface SellPigResponse {
    success: boolean;
    rarePig: boolean
    pigId?: number;
}

export interface hogBreedResponse {
    success: boolean;
    notFoundMom?: boolean,
    stallIsFull?: boolean;
    notFoundDad?: boolean,
    isNotBalanceDad?: boolean;
    isPregnant?: boolean;
}

export interface PrepareFarm {
    farmIsFull: boolean;
    notEnoughMoney?: boolean;
    farm2NotFound?: boolean;
}
