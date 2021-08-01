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
