"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HogService = void 0;
var axios_1 = __importDefault(require("axios"));
var qs_1 = __importDefault(require("qs"));
var env_config_1 = require("../config/env.config");
var HogService = /** @class */ (function () {
    function HogService(cookieParam) {
        var _this = this;
        this.cookieParam = cookieParam;
        this.getFarmInfo = function (userid) { return __awaiter(_this, void 0, void 0, function () {
            var data, config;
            return __generator(this, function (_a) {
                data = HogService.buildData({
                    userid: userid
                });
                config = {
                    url: env_config_1.env.end_point + "/farminfo",
                    headers: this.buildHeader(),
                };
                return [2 /*return*/, axios_1.default.post(config.url, data, {
                        headers: config.headers
                    })];
            });
        }); };
        this.takeAllCoin = function () { return __awaiter(_this, void 0, void 0, function () {
            var data, config;
            return __generator(this, function (_a) {
                data = qs_1.default.stringify({
                    type: 2
                });
                config = {
                    url: env_config_1.env.end_point + "/itemdrop",
                    headers: this.buildHeader(),
                };
                return [2 /*return*/, axios_1.default.post(config.url, data, {
                        headers: config.headers
                    })];
            });
        }); };
        this.foodServeProcess = function () { return __awaiter(_this, void 0, void 0, function () {
            var foodList, _a, itemBurger, foodSuccess;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getInventory(HogService.buildFoodList())];
                    case 1:
                        foodList = (_b.sent()).data;
                        _a = !foodList.itemlist;
                        if (!_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.doBuyBurger()];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        if (_a) {
                            console.log("By burger success");
                            return [2 /*return*/];
                        }
                        itemBurger = foodList.itemlist.find(function (item) { return item.Itemid === HogService.BURGER_ID; });
                        if (!itemBurger) {
                            console.error("not found burger");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.useItem(HogService.buildItemUse(itemBurger.InventoryId))];
                    case 4:
                        foodSuccess = _b.sent();
                        if (foodSuccess) {
                            console.log("already fed SUCCESS.");
                        }
                        return [2 /*return*/, foodSuccess];
                }
            });
        }); };
        this.getMarket = function (jsonStr) { return __awaiter(_this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                config = {
                    url: env_config_1.env.end_point + "/market/",
                    headers: this.buildHeader(),
                };
                return [2 /*return*/, axios_1.default.post(config.url, jsonStr, {
                        headers: config.headers
                    })];
            });
        }); };
        this.getInventory = function (jsonStr) { return __awaiter(_this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                config = {
                    url: env_config_1.env.end_point + "/inventory/",
                    headers: this.buildHeader(),
                };
                return [2 /*return*/, axios_1.default.post(config.url, jsonStr, {
                        headers: config.headers
                    })];
            });
        }); };
        this.useItem = function (jsonStr) { return __awaiter(_this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                config = {
                    url: env_config_1.env.end_point + "/useitems/",
                    headers: this.buildHeader(),
                };
                return [2 /*return*/, axios_1.default.post(config.url, jsonStr, {
                        headers: config.headers
                    })];
            });
        }); };
        this.doGenerateToken = function () { return __awaiter(_this, void 0, void 0, function () {
            var jsonData, config, AccessToken, headers, cookie;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jsonData = qs_1.default.stringify({
                            logintype: 1,
                            logintoken: env_config_1.env.facebook_token,
                            device: 'APPLE',
                            version: '2.0.5'
                        });
                        config = {
                            url: env_config_1.env.end_point + "/register/",
                        };
                        return [4 /*yield*/, axios_1.default.post(config.url, jsonData, {
                                headers: {}
                            })];
                    case 1:
                        AccessToken = (_a.sent()).data.AccessToken;
                        return [4 /*yield*/, this.doGetCookie(AccessToken)];
                    case 2:
                        headers = (_a.sent()).headers;
                        cookie = headers['set-cookie'][0];
                        return [2 /*return*/, cookie];
                }
            });
        }); };
        this.doGetCookie = function (accesstoken) { return __awaiter(_this, void 0, void 0, function () {
            var jsonData, config;
            return __generator(this, function (_a) {
                jsonData = qs_1.default.stringify({
                    accesstoken: accesstoken,
                    logintoken: env_config_1.env.facebook_token,
                    logintype: 1,
                    FCM: '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
                });
                config = {
                    url: env_config_1.env.end_point + "/login/",
                    headers: this.buildHeader(),
                };
                return [2 /*return*/, axios_1.default.post(config.url, jsonData, {
                        headers: {}
                    })];
            });
        }); };
        if (cookieParam) {
            this.cookie = cookieParam;
        }
    }
    Object.defineProperty(HogService.prototype, "isUndefinedToken", {
        get: function () {
            return !this.cookie;
        },
        enumerable: false,
        configurable: true
    });
    HogService.buildItemWater = function () {
        return qs_1.default.stringify({
            type: 2
        });
    };
    HogService.buildItemShower = function () {
        return qs_1.default.stringify({
            type: 3
        });
    };
    HogService.buildItemUse = function (invid) {
        return qs_1.default.stringify({
            type: 1,
            invid: invid
        });
    };
    HogService.buildFoodList = function () {
        return qs_1.default.stringify({
            itemtypelist: "{\"TypeList\":[0]}"
        });
    };
    HogService.prototype.doBuyBurger = function () {
        return __awaiter(this, void 0, void 0, function () {
            var marketResponse, itemSlot2, burgerItem, buyResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getMarket(HogService.buildMargetList())];
                    case 1:
                        marketResponse = (_a.sent()).data;
                        itemSlot2 = marketResponse.marketlist.filter(function (item) { return item.Slot === 2 && item.Level >= 1; });
                        burgerItem = HogService.findMaxId(itemSlot2);
                        if (!burgerItem) {
                            throw 'burger item not found.';
                        }
                        return [4 /*yield*/, this.getMarket(HogService.buildBurger(1, burgerItem.StoreId))];
                    case 2:
                        buyResponse = (_a.sent()).data;
                        return [2 /*return*/, buyResponse];
                }
            });
        });
    };
    HogService.findMaxId = function (itemList) {
        var storeId = Math.max.apply(Math, itemList.map(function (o) {
            return o.StoreId;
        }));
        return itemList.find(function (i) { return i.StoreId === storeId; });
    };
    HogService.buildBurger = function (burgerAmount, storeId) {
        return qs_1.default.stringify({
            type: 2,
            storeId: storeId,
            amount: burgerAmount,
            buytype: 2
        });
    };
    HogService.buildData = function (data) {
        return qs_1.default.stringify(data);
    };
    HogService.buildMargetList = function () {
        return qs_1.default.stringify({
            type: 1
        });
    };
    HogService.prototype.buildHeader = function () {
        return {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': this.cookie
        };
    };
    HogService.BURGER_ID = 0;
    HogService.MILE_ID = 1;
    HogService.ICE_CREAM_ID = 1;
    HogService.LETTUCE_ID = 3;
    HogService.SALAD_ID = 4;
    return HogService;
}());
exports.HogService = HogService;
