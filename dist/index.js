"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
var _this = this;
exports.__esModule = true;
var Privates = /** @class */ (function () {
    function Privates() {
    }
    return Privates;
}());
var privates = new WeakMap();
function create(prop, next, context) {
    if (context === void 0) { context = Promise.resolve(null); }
    var fakeFunction = function () { };
    privates.set(fakeFunction, { prop: prop, context: context, next: next });
    return fakeFunction;
}
var handler = {
    get: function (target, prop) {
        var next = privates.get(target).next;
        return new Proxy(create(prop, next.then(function (handle) { return handle.getProperty(prop); }), next), handler);
    },
    apply: function (target, thisArg, args) { return __awaiter(_this, void 0, void 0, function () {
        var _a, next, context, prop, handle, parentHandle, firstArg, isFunction, execContext, evaluate, indexOfCallback, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = privates.get(target), next = _a.next, context = _a.context, prop = _a.prop;
                    return [4 /*yield*/, next];
                case 1:
                    handle = _d.sent();
                    return [4 /*yield*/, context];
                case 2:
                    parentHandle = _d.sent();
                    firstArg = args[0];
                    isFunction = function (a) { return typeof a === 'function'; };
                    execContext = handle.executionContext();
                    evaluate = execContext.evaluate.bind(execContext);
                    indexOfCallback = Array.prototype.findIndex.call(args, isFunction);
                    if (!(prop === 'then' && indexOfCallback === 0)) return [3 /*break*/, 4];
                    _c = (_b = args)[0];
                    return [4 /*yield*/, parentHandle.jsonValue()];
                case 3: return [2 /*return*/, _c.apply(_b, [_d.sent()])];
                case 4:
                    if (indexOfCallback > -1) {
                        return [2 /*return*/, evaluate(function (fn, thisArg, args, indexOfCallback) {
                                return new Promise(function (resolve) {
                                    args.splice(indexOfCallback, indexOfCallback + 1, resolve);
                                    fn.apply(thisArg, args);
                                });
                            }, handle, parentHandle, args, indexOfCallback).then(args[indexOfCallback])];
                    }
                    return [2 /*return*/, evaluate(function (fn, thisArg, args) { return fn.apply(thisArg, args); }, handle, parentHandle, args)];
            }
        });
    }); }
};
function createHandle(handle) {
    return new Proxy(create(null, Promise.resolve(handle)), handler);
}
exports.createHandle = createHandle;
