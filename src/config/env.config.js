"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
var ts_dotenv_1 = require("ts-dotenv");
exports.env = ts_dotenv_1.load({
    end_point: String,
    facebook_token: String
});
