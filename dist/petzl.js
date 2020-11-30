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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Petzl = exports.runner = exports.configure = exports.doOnce = exports.afterEach = exports.beforeEach = exports.describe = exports.it = void 0;
var utils_1 = require("./utils");
var queue_1 = __importDefault(require("./queue"));
var runner_1 = __importDefault(require("./runner"));
var configurer_1 = __importDefault(require("./configurer"));
var Petzl = /** @class */ (function () {
    function Petzl(configuration) {
        var _this = this;
        this.beforeEach = function (cb) {
            _this.queue.pushHookAction("beforeEach", cb);
        };
        this.afterEach = function (cb) {
            _this.queue.pushHookAction("afterEach", cb);
        };
        this.doOnce = function (cb) {
            _this.queue.pushAction({
                type: "doOnce",
                cb: function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, cb()];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                }); },
            });
        };
        this.configure = function (options) {
            _this.queue.pushAction({
                type: "configure",
                configuration: options,
            });
        };
        this.it = function (title, cb) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            _this.queue.pushAction({
                type: "it",
                title: utils_1.formatTitle.apply(void 0, __spreadArrays([title], args)),
                cb: cb,
                args: args,
            });
        };
        this.describe = function (title, cb) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            _this.queue.pushAction({
                type: "describe-start",
                title: utils_1.formatTitle.apply(void 0, __spreadArrays([title], args)),
            });
            cb.apply(void 0, args);
            _this.queue.pushAction({
                type: "describe-end",
            });
        };
        utils_1.registerProcessEventListeners();
        var config = new configurer_1.default(configuration).config;
        this.config = config;
        this.queue = new queue_1.default(this.config);
        this.runner = new runner_1.default(this.queue, this.config);
    }
    return Petzl;
}());
exports.Petzl = Petzl;
var petzl = new Petzl();
var it = petzl.it, describe = petzl.describe, beforeEach = petzl.beforeEach, afterEach = petzl.afterEach, doOnce = petzl.doOnce, configure = petzl.configure, runner = petzl.runner;
exports.it = it;
exports.describe = describe;
exports.beforeEach = beforeEach;
exports.afterEach = afterEach;
exports.doOnce = doOnce;
exports.configure = configure;
exports.runner = runner;
//# sourceMappingURL=petzl.js.map