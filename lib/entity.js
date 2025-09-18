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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntity = void 0;
var types_1 = require("./types");
var BaseEntity = /** @class */ (function () {
    function BaseEntity(context, group, lock) {
        this._aliasMapFromModel = {};
        this._aliasMapToModel = {};
        this.context = context;
        this._id = crypto.randomUUID();
        this._originalModel = {};
        this._group = group;
        this._lock = lock;
    }
    BaseEntity.prototype.initialize = function (_model, _context) { };
    BaseEntity.prototype.fromModel = function (model) {
        this.fromModelInner(model, false);
    };
    BaseEntity.prototype.fromModelInner = function (model, isResetOriginalModel) {
        var _this = this;
        Object.entries(model)
            .filter(function (_a) {
            var k = _a[0], v = _a[1];
            return k in _this._aliasMapFromModel && v !== undefined;
        })
            .forEach(function (_a) {
            var modelKey = _a[0], modelValue = _a[1];
            var entityKey = _this._aliasMapFromModel[modelKey];
            var value = typeof modelValue === "object"
                ? structuredClone(modelValue)
                : modelValue;
            if (isResetOriginalModel) {
                _this._originalModel[modelKey] = value;
            }
            _this[entityKey] = value;
        });
    };
    BaseEntity.prototype.toModel = function () {
        return this.toModelInner(false);
    };
    BaseEntity.prototype.toDirtyModel = function () {
        return this.toModelInner(true);
    };
    BaseEntity.prototype.toModelInner = function (isDirtyOnly) {
        var _this = this;
        return Object.entries(this._aliasMapToModel).reduce(function (acc, _a) {
            var entityKey = _a[0], modelKey = _a[1];
            var modelValue = _this._originalModel[modelKey];
            var entityValue = _this[entityKey];
            var isObject = typeof entityValue === "object";
            var shouldInclude = !isDirtyOnly ||
                (isObject
                    ? JSON.stringify(entityValue) !== JSON.stringify(modelValue)
                    : entityValue !== modelValue);
            if (shouldInclude) {
                acc[modelKey] = isObject
                    ? structuredClone(entityValue)
                    : entityValue;
            }
            return acc;
        }, {});
    };
    BaseEntity.prototype.beforePresent = function (_fieldRequest) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    BaseEntity.prototype.afterPresent = function (_fieldRequest, _response) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    BaseEntity.prototype.present = function (_fieldRequest) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("not implemented");
            });
        });
    };
    BaseEntity.prototype.load = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var name, getterRaw, loader, setterRaw, filter, getter, setter;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = config.name, getterRaw = config.getter, loader = config.loader, setterRaw = config.setter;
                        filter = config.filter;
                        if (!getterRaw) {
                            throw new Error("".concat(name, " getter not implemented"));
                        }
                        getter = getterRaw;
                        if (!loader) {
                            throw new Error("".concat(name, " loader not implemented"));
                        }
                        if (!setterRaw) {
                            throw new Error("".concat(name, " setter not implemented"));
                        }
                        setter = setterRaw;
                        return [4 /*yield*/, this._lock.acquire(name, function () { return __awaiter(_this, void 0, void 0, function () {
                                var sources, keys, targets;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            sources = this._group.filter(filter);
                                            if (!sources.length) {
                                                return [2 /*return*/];
                                            }
                                            keys = getter(sources);
                                            return [4 /*yield*/, loader(keys)];
                                        case 1:
                                            targets = _a.sent();
                                            setter(sources, targets);
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** factories */
    BaseEntity.fromOne = function (model, context) {
        return this.fromArray([model], context)[0];
    };
    BaseEntity.fromArray = function (models, context) {
        var _this = this;
        var group = new Array();
        var lock = new types_1.AsyncLock({ maxPending: Infinity, domainReentrant: true });
        models.forEach(function (model) {
            return group.push(new _this(model, context, group, lock));
        });
        return __spreadArray([], group, true);
    };
    return BaseEntity;
}());
exports.BaseEntity = BaseEntity;
//# sourceMappingURL=entity.js.map