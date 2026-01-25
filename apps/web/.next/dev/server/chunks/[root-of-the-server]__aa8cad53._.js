module.exports = [
"[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client-2c3a283f134fdcb6", () => require("@prisma/client-2c3a283f134fdcb6"));

module.exports = mod;
}),
"[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pg-587764f78a6c7a9c");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/node_modules/@prisma/debug/dist/index.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Debug",
    ()=>Debug,
    "clearLogs",
    ()=>clearLogs,
    "default",
    ()=>index_default,
    "getLogs",
    ()=>getLogs
]);
var __defProp = Object.defineProperty;
var __export = (target, all)=>{
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
// ../../node_modules/.pnpm/kleur@4.1.5/node_modules/kleur/colors.mjs
var colors_exports = {};
__export(colors_exports, {
    $: ()=>$,
    bgBlack: ()=>bgBlack,
    bgBlue: ()=>bgBlue,
    bgCyan: ()=>bgCyan,
    bgGreen: ()=>bgGreen,
    bgMagenta: ()=>bgMagenta,
    bgRed: ()=>bgRed,
    bgWhite: ()=>bgWhite,
    bgYellow: ()=>bgYellow,
    black: ()=>black,
    blue: ()=>blue,
    bold: ()=>bold,
    cyan: ()=>cyan,
    dim: ()=>dim,
    gray: ()=>gray,
    green: ()=>green,
    grey: ()=>grey,
    hidden: ()=>hidden,
    inverse: ()=>inverse,
    italic: ()=>italic,
    magenta: ()=>magenta,
    red: ()=>red,
    reset: ()=>reset,
    strikethrough: ()=>strikethrough,
    underline: ()=>underline,
    white: ()=>white,
    yellow: ()=>yellow
});
var FORCE_COLOR;
var NODE_DISABLE_COLORS;
var NO_COLOR;
var TERM;
var isTTY = true;
if (typeof process !== "undefined") {
    ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
    isTTY = process.stdout && process.stdout.isTTY;
}
var $ = {
    enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (FORCE_COLOR != null && FORCE_COLOR !== "0" || isTTY)
};
function init(x, y) {
    let rgx = new RegExp(`\\x1b\\[${y}m`, "g");
    let open = `\x1B[${x}m`, close = `\x1B[${y}m`;
    return function(txt) {
        if (!$.enabled || txt == null) return txt;
        return open + (!!~("" + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
    };
}
var reset = init(0, 0);
var bold = init(1, 22);
var dim = init(2, 22);
var italic = init(3, 23);
var underline = init(4, 24);
var inverse = init(7, 27);
var hidden = init(8, 28);
var strikethrough = init(9, 29);
var black = init(30, 39);
var red = init(31, 39);
var green = init(32, 39);
var yellow = init(33, 39);
var blue = init(34, 39);
var magenta = init(35, 39);
var cyan = init(36, 39);
var white = init(37, 39);
var gray = init(90, 39);
var grey = init(90, 39);
var bgBlack = init(40, 49);
var bgRed = init(41, 49);
var bgGreen = init(42, 49);
var bgYellow = init(43, 49);
var bgBlue = init(44, 49);
var bgMagenta = init(45, 49);
var bgCyan = init(46, 49);
var bgWhite = init(47, 49);
// src/index.ts
var MAX_ARGS_HISTORY = 100;
var COLORS = [
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "red"
];
var argsHistory = [];
var lastTimestamp = Date.now();
var lastColor = 0;
var processEnv = typeof process !== "undefined" ? process.env : {};
globalThis.DEBUG ??= processEnv.DEBUG ?? "";
globalThis.DEBUG_COLORS ??= processEnv.DEBUG_COLORS ? processEnv.DEBUG_COLORS === "true" : true;
var topProps = {
    enable (namespace) {
        if (typeof namespace === "string") {
            globalThis.DEBUG = namespace;
        }
    },
    disable () {
        const prev = globalThis.DEBUG;
        globalThis.DEBUG = "";
        return prev;
    },
    // this is the core logic to check if logging should happen or not
    enabled (namespace) {
        const listenedNamespaces = globalThis.DEBUG.split(",").map((s)=>{
            return s.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
        });
        const isListened = listenedNamespaces.some((listenedNamespace)=>{
            if (listenedNamespace === "" || listenedNamespace[0] === "-") return false;
            return namespace.match(RegExp(listenedNamespace.split("*").join(".*") + "$"));
        });
        const isExcluded = listenedNamespaces.some((listenedNamespace)=>{
            if (listenedNamespace === "" || listenedNamespace[0] !== "-") return false;
            return namespace.match(RegExp(listenedNamespace.slice(1).split("*").join(".*") + "$"));
        });
        return isListened && !isExcluded;
    },
    log: (...args)=>{
        const [namespace, format, ...rest] = args;
        const logWithFormatting = console.warn ?? console.log;
        logWithFormatting(`${namespace} ${format}`, ...rest);
    },
    formatters: {}
};
function debugCreate(namespace) {
    const instanceProps = {
        color: COLORS[lastColor++ % COLORS.length],
        enabled: topProps.enabled(namespace),
        namespace,
        log: topProps.log,
        extend: ()=>{}
    };
    const debugCall = (...args)=>{
        const { enabled, namespace: namespace2, color, log } = instanceProps;
        if (args.length !== 0) {
            argsHistory.push([
                namespace2,
                ...args
            ]);
        }
        if (argsHistory.length > MAX_ARGS_HISTORY) {
            argsHistory.shift();
        }
        if (topProps.enabled(namespace2) || enabled) {
            const stringArgs = args.map((arg)=>{
                if (typeof arg === "string") {
                    return arg;
                }
                return safeStringify(arg);
            });
            const ms = `+${Date.now() - lastTimestamp}ms`;
            lastTimestamp = Date.now();
            if (globalThis.DEBUG_COLORS) {
                log(colors_exports[color](bold(namespace2)), ...stringArgs, colors_exports[color](ms));
            } else {
                log(namespace2, ...stringArgs, ms);
            }
        }
    };
    return new Proxy(debugCall, {
        get: (_, prop)=>instanceProps[prop],
        set: (_, prop, value)=>instanceProps[prop] = value
    });
}
var Debug = new Proxy(debugCreate, {
    get: (_, prop)=>topProps[prop],
    set: (_, prop, value)=>topProps[prop] = value
});
function safeStringify(value, indent = 2) {
    const cache = /* @__PURE__ */ new Set();
    return JSON.stringify(value, (key, value2)=>{
        if (typeof value2 === "object" && value2 !== null) {
            if (cache.has(value2)) {
                return `[Circular *]`;
            }
            cache.add(value2);
        } else if (typeof value2 === "bigint") {
            return value2.toString();
        }
        return value2;
    }, indent);
}
function getLogs(numChars = 7500) {
    const logs = argsHistory.map(([namespace, ...args])=>{
        return `${namespace} ${args.map((arg)=>{
            if (typeof arg === "string") {
                return arg;
            } else {
                return JSON.stringify(arg);
            }
        }).join(" ")}`;
    }).join("\n");
    if (logs.length < numChars) {
        return logs;
    }
    return logs.slice(-numChars);
}
function clearLogs() {
    argsHistory.length = 0;
}
var index_default = Debug;
;
}),
"[project]/node_modules/@prisma/driver-adapter-utils/dist/index.mjs [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ColumnTypeEnum",
    ()=>ColumnTypeEnum,
    "DriverAdapterError",
    ()=>DriverAdapterError,
    "bindAdapter",
    ()=>bindAdapter,
    "bindMigrationAwareSqlAdapterFactory",
    ()=>bindMigrationAwareSqlAdapterFactory,
    "bindSqlAdapterFactory",
    ()=>bindSqlAdapterFactory,
    "err",
    ()=>err,
    "isDriverAdapterError",
    ()=>isDriverAdapterError,
    "mockAdapter",
    ()=>mockAdapter,
    "mockAdapterErrors",
    ()=>mockAdapterErrors,
    "mockAdapterFactory",
    ()=>mockAdapterFactory,
    "mockMigrationAwareAdapterFactory",
    ()=>mockMigrationAwareAdapterFactory,
    "ok",
    ()=>ok
]);
// src/debug.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$debug$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@prisma/debug/dist/index.mjs [app-route] (ecmascript)");
;
// src/error.ts
var DriverAdapterError = class extends Error {
    name = "DriverAdapterError";
    cause;
    constructor(payload){
        super(typeof payload["message"] === "string" ? payload["message"] : payload.kind);
        this.cause = payload;
    }
};
function isDriverAdapterError(error) {
    return error["name"] === "DriverAdapterError" && typeof error["cause"] === "object";
}
// src/result.ts
function ok(value) {
    return {
        ok: true,
        value,
        map (fn) {
            return ok(fn(value));
        },
        flatMap (fn) {
            return fn(value);
        }
    };
}
function err(error) {
    return {
        ok: false,
        error,
        map () {
            return err(error);
        },
        flatMap () {
            return err(error);
        }
    };
}
// src/binder.ts
var debug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$debug$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Debug"])("driver-adapter-utils");
var ErrorRegistryInternal = class {
    registeredErrors = [];
    consumeError(id) {
        return this.registeredErrors[id];
    }
    registerNewError(error) {
        let i = 0;
        while(this.registeredErrors[i] !== void 0){
            i++;
        }
        this.registeredErrors[i] = {
            error
        };
        return i;
    }
};
function copySymbolsFromSource(source, target) {
    const symbols = Object.getOwnPropertySymbols(source);
    const symbolObject = Object.fromEntries(symbols.map((symbol)=>[
            symbol,
            true
        ]));
    Object.assign(target, symbolObject);
}
var bindMigrationAwareSqlAdapterFactory = (adapterFactory)=>{
    const errorRegistry = new ErrorRegistryInternal();
    const boundFactory = {
        adapterName: adapterFactory.adapterName,
        provider: adapterFactory.provider,
        errorRegistry,
        connect: async (...args)=>{
            const ctx = await wrapAsync(errorRegistry, adapterFactory.connect.bind(adapterFactory))(...args);
            return ctx.map((ctx2)=>bindAdapter(ctx2, errorRegistry));
        },
        connectToShadowDb: async (...args)=>{
            const ctx = await wrapAsync(errorRegistry, adapterFactory.connectToShadowDb.bind(adapterFactory))(...args);
            return ctx.map((ctx2)=>bindAdapter(ctx2, errorRegistry));
        }
    };
    copySymbolsFromSource(adapterFactory, boundFactory);
    return boundFactory;
};
var bindSqlAdapterFactory = (adapterFactory)=>{
    const errorRegistry = new ErrorRegistryInternal();
    const boundFactory = {
        adapterName: adapterFactory.adapterName,
        provider: adapterFactory.provider,
        errorRegistry,
        connect: async (...args)=>{
            const ctx = await wrapAsync(errorRegistry, adapterFactory.connect.bind(adapterFactory))(...args);
            return ctx.map((ctx2)=>bindAdapter(ctx2, errorRegistry));
        }
    };
    copySymbolsFromSource(adapterFactory, boundFactory);
    return boundFactory;
};
var bindAdapter = (adapter, errorRegistry = new ErrorRegistryInternal())=>{
    const boundAdapter = {
        adapterName: adapter.adapterName,
        errorRegistry,
        queryRaw: wrapAsync(errorRegistry, adapter.queryRaw.bind(adapter)),
        executeRaw: wrapAsync(errorRegistry, adapter.executeRaw.bind(adapter)),
        executeScript: wrapAsync(errorRegistry, adapter.executeScript.bind(adapter)),
        dispose: wrapAsync(errorRegistry, adapter.dispose.bind(adapter)),
        provider: adapter.provider,
        startTransaction: async (...args)=>{
            const ctx = await wrapAsync(errorRegistry, adapter.startTransaction.bind(adapter))(...args);
            return ctx.map((ctx2)=>bindTransaction(errorRegistry, ctx2));
        }
    };
    if (adapter.getConnectionInfo) {
        boundAdapter.getConnectionInfo = wrapSync(errorRegistry, adapter.getConnectionInfo.bind(adapter));
    }
    return boundAdapter;
};
var bindTransaction = (errorRegistry, transaction)=>{
    return {
        adapterName: transaction.adapterName,
        provider: transaction.provider,
        options: transaction.options,
        queryRaw: wrapAsync(errorRegistry, transaction.queryRaw.bind(transaction)),
        executeRaw: wrapAsync(errorRegistry, transaction.executeRaw.bind(transaction)),
        commit: wrapAsync(errorRegistry, transaction.commit.bind(transaction)),
        rollback: wrapAsync(errorRegistry, transaction.rollback.bind(transaction))
    };
};
function wrapAsync(registry, fn) {
    return async (...args)=>{
        try {
            return ok(await fn(...args));
        } catch (error) {
            debug("[error@wrapAsync]", error);
            if (isDriverAdapterError(error)) {
                return err(error.cause);
            }
            const id = registry.registerNewError(error);
            return err({
                kind: "GenericJs",
                id
            });
        }
    };
}
function wrapSync(registry, fn) {
    return (...args)=>{
        try {
            return ok(fn(...args));
        } catch (error) {
            debug("[error@wrapSync]", error);
            if (isDriverAdapterError(error)) {
                return err(error.cause);
            }
            const id = registry.registerNewError(error);
            return err({
                kind: "GenericJs",
                id
            });
        }
    };
}
// src/const.ts
var ColumnTypeEnum = {
    // Scalars
    Int32: 0,
    Int64: 1,
    Float: 2,
    Double: 3,
    Numeric: 4,
    Boolean: 5,
    Character: 6,
    Text: 7,
    Date: 8,
    Time: 9,
    DateTime: 10,
    Json: 11,
    Enum: 12,
    Bytes: 13,
    Set: 14,
    Uuid: 15,
    // Arrays
    Int32Array: 64,
    Int64Array: 65,
    FloatArray: 66,
    DoubleArray: 67,
    NumericArray: 68,
    BooleanArray: 69,
    CharacterArray: 70,
    TextArray: 71,
    DateArray: 72,
    TimeArray: 73,
    DateTimeArray: 74,
    JsonArray: 75,
    EnumArray: 76,
    BytesArray: 77,
    UuidArray: 78,
    // Custom
    UnknownNumber: 128
};
// src/mock.ts
var mockAdapterErrors = {
    queryRaw: new Error("Not implemented: queryRaw"),
    executeRaw: new Error("Not implemented: executeRaw"),
    startTransaction: new Error("Not implemented: startTransaction"),
    executeScript: new Error("Not implemented: executeScript"),
    dispose: new Error("Not implemented: dispose")
};
function mockAdapter(provider) {
    return {
        provider,
        adapterName: "@prisma/adapter-mock",
        queryRaw: ()=>Promise.reject(mockAdapterErrors.queryRaw),
        executeRaw: ()=>Promise.reject(mockAdapterErrors.executeRaw),
        startTransaction: ()=>Promise.reject(mockAdapterErrors.startTransaction),
        executeScript: ()=>Promise.reject(mockAdapterErrors.executeScript),
        dispose: ()=>Promise.reject(mockAdapterErrors.dispose),
        [Symbol.for("adapter.mockAdapter")]: true
    };
}
function mockAdapterFactory(provider) {
    return {
        provider,
        adapterName: "@prisma/adapter-mock",
        connect: ()=>Promise.resolve(mockAdapter(provider)),
        [Symbol.for("adapter.mockAdapterFactory")]: true
    };
}
function mockMigrationAwareAdapterFactory(provider) {
    return {
        provider,
        adapterName: "@prisma/adapter-mock",
        connect: ()=>Promise.resolve(mockAdapter(provider)),
        connectToShadowDb: ()=>Promise.resolve(mockAdapter(provider)),
        [Symbol.for("adapter.mockMigrationAwareAdapterFactory")]: true
    };
}
;
}),
"[project]/node_modules/postgres-array/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const BACKSLASH = '\\';
const DQUOT = '"';
const LBRACE = '{';
const RBRACE = '}';
const LBRACKET = '[';
const EQUALS = '=';
const COMMA = ',';
/** When the raw value is this, it means a literal `null` */ const NULL_STRING = 'NULL';
/**
 * Parses an array according to
 * https://www.postgresql.org/docs/17/arrays.html#ARRAYS-IO
 *
 * Trusts the data (mostly), so only hook up to trusted Postgres servers.
 */ function makeParseArrayWithTransform(transform) {
    const haveTransform = transform != null;
    return function parseArray(str) {
        const rbraceIndex = str.length - 1;
        if (rbraceIndex === 1) {
            return [];
        }
        if (str[rbraceIndex] !== RBRACE) {
            throw new Error('Invalid array text - must end with }');
        }
        // If starts with `[`, it is specifying the index boundas. Skip past first `=`.
        let position = 0;
        if (str[position] === LBRACKET) {
            position = str.indexOf(EQUALS) + 1;
        }
        if (str[position++] !== LBRACE) {
            throw new Error('Invalid array text - must start with {');
        }
        const output = [];
        let current = output;
        const stack = [];
        let currentStringStart = position;
        let currentString = '';
        let expectValue = true;
        for(; position < rbraceIndex; ++position){
            let char = str[position];
            // > The array output routine will put double quotes around element values if
            // > they are empty strings, contain curly braces, delimiter characters, double
            // > quotes, backslashes, or white space, or match the word NULL. Double quotes
            // > and backslashes embedded in element values will be backslash-escaped.
            if (char === DQUOT) {
                // It's escaped
                currentStringStart = ++position;
                let dquot = str.indexOf(DQUOT, currentStringStart);
                let backSlash = str.indexOf(BACKSLASH, currentStringStart);
                while(backSlash !== -1 && backSlash < dquot){
                    position = backSlash;
                    const part = str.slice(currentStringStart, position);
                    currentString += part;
                    currentStringStart = ++position;
                    if (dquot === position++) {
                        // This was an escaped doublequote; find the next one!
                        dquot = str.indexOf(DQUOT, position);
                    }
                    // Either way, find the next backslash
                    backSlash = str.indexOf(BACKSLASH, position);
                }
                position = dquot;
                const part = str.slice(currentStringStart, position);
                currentString += part;
                current.push(haveTransform ? transform(currentString) : currentString);
                currentString = '';
                expectValue = false;
            } else if (char === LBRACE) {
                const newArray = [];
                current.push(newArray);
                stack.push(current);
                current = newArray;
                currentStringStart = position + 1;
                expectValue = true;
            } else if (char === COMMA) {
                expectValue = true;
            } else if (char === RBRACE) {
                expectValue = false;
                const arr = stack.pop();
                if (arr === undefined) {
                    throw new Error("Invalid array text - too many '}'");
                }
                current = arr;
            } else if (expectValue) {
                currentStringStart = position;
                while((char = str[position]) !== COMMA && char !== RBRACE && position < rbraceIndex){
                    ++position;
                }
                const part = str.slice(currentStringStart, position--);
                current.push(part === NULL_STRING ? null : haveTransform ? transform(part) : part);
                expectValue = false;
            } else {
                throw new Error('Was expecting delimeter');
            }
        }
        return output;
    };
}
const parseArray = makeParseArrayWithTransform();
exports.parse = (source, transform)=>transform != null ? makeParseArrayWithTransform(transform)(source) : parseArray(source);
}),
"[project]/node_modules/@prisma/adapter-pg/dist/index.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "PrismaPg",
    ()=>PrismaPgAdapterFactory
]);
// src/pg.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$debug$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@prisma/debug/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@prisma/driver-adapter-utils/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2d$array$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres-array/index.js [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
// package.json
var name = "@prisma/adapter-pg";
// src/constants.ts
var FIRST_NORMAL_OBJECT_ID = 16384;
;
;
;
var { types } = __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["default"];
var { builtins: ScalarColumnType, getTypeParser } = types;
var AdditionalScalarColumnType = {
    NAME: 19
};
var ArrayColumnType = {
    BIT_ARRAY: 1561,
    BOOL_ARRAY: 1e3,
    BYTEA_ARRAY: 1001,
    BPCHAR_ARRAY: 1014,
    CHAR_ARRAY: 1002,
    CIDR_ARRAY: 651,
    DATE_ARRAY: 1182,
    FLOAT4_ARRAY: 1021,
    FLOAT8_ARRAY: 1022,
    INET_ARRAY: 1041,
    INT2_ARRAY: 1005,
    INT4_ARRAY: 1007,
    INT8_ARRAY: 1016,
    JSONB_ARRAY: 3807,
    JSON_ARRAY: 199,
    MONEY_ARRAY: 791,
    NUMERIC_ARRAY: 1231,
    OID_ARRAY: 1028,
    TEXT_ARRAY: 1009,
    TIMESTAMP_ARRAY: 1115,
    TIMESTAMPTZ_ARRAY: 1185,
    TIME_ARRAY: 1183,
    UUID_ARRAY: 2951,
    VARBIT_ARRAY: 1563,
    VARCHAR_ARRAY: 1015,
    XML_ARRAY: 143
};
var UnsupportedNativeDataType = class _UnsupportedNativeDataType extends Error {
    // map of type codes to type names
    static typeNames = {
        16: "bool",
        17: "bytea",
        18: "char",
        19: "name",
        20: "int8",
        21: "int2",
        22: "int2vector",
        23: "int4",
        24: "regproc",
        25: "text",
        26: "oid",
        27: "tid",
        28: "xid",
        29: "cid",
        30: "oidvector",
        32: "pg_ddl_command",
        71: "pg_type",
        75: "pg_attribute",
        81: "pg_proc",
        83: "pg_class",
        114: "json",
        142: "xml",
        194: "pg_node_tree",
        269: "table_am_handler",
        325: "index_am_handler",
        600: "point",
        601: "lseg",
        602: "path",
        603: "box",
        604: "polygon",
        628: "line",
        650: "cidr",
        700: "float4",
        701: "float8",
        705: "unknown",
        718: "circle",
        774: "macaddr8",
        790: "money",
        829: "macaddr",
        869: "inet",
        1033: "aclitem",
        1042: "bpchar",
        1043: "varchar",
        1082: "date",
        1083: "time",
        1114: "timestamp",
        1184: "timestamptz",
        1186: "interval",
        1266: "timetz",
        1560: "bit",
        1562: "varbit",
        1700: "numeric",
        1790: "refcursor",
        2202: "regprocedure",
        2203: "regoper",
        2204: "regoperator",
        2205: "regclass",
        2206: "regtype",
        2249: "record",
        2275: "cstring",
        2276: "any",
        2277: "anyarray",
        2278: "void",
        2279: "trigger",
        2280: "language_handler",
        2281: "internal",
        2283: "anyelement",
        2287: "_record",
        2776: "anynonarray",
        2950: "uuid",
        2970: "txid_snapshot",
        3115: "fdw_handler",
        3220: "pg_lsn",
        3310: "tsm_handler",
        3361: "pg_ndistinct",
        3402: "pg_dependencies",
        3500: "anyenum",
        3614: "tsvector",
        3615: "tsquery",
        3642: "gtsvector",
        3734: "regconfig",
        3769: "regdictionary",
        3802: "jsonb",
        3831: "anyrange",
        3838: "event_trigger",
        3904: "int4range",
        3906: "numrange",
        3908: "tsrange",
        3910: "tstzrange",
        3912: "daterange",
        3926: "int8range",
        4072: "jsonpath",
        4089: "regnamespace",
        4096: "regrole",
        4191: "regcollation",
        4451: "int4multirange",
        4532: "nummultirange",
        4533: "tsmultirange",
        4534: "tstzmultirange",
        4535: "datemultirange",
        4536: "int8multirange",
        4537: "anymultirange",
        4538: "anycompatiblemultirange",
        4600: "pg_brin_bloom_summary",
        4601: "pg_brin_minmax_multi_summary",
        5017: "pg_mcv_list",
        5038: "pg_snapshot",
        5069: "xid8",
        5077: "anycompatible",
        5078: "anycompatiblearray",
        5079: "anycompatiblenonarray",
        5080: "anycompatiblerange"
    };
    type;
    constructor(code){
        super();
        this.type = _UnsupportedNativeDataType.typeNames[code] || "Unknown";
        this.message = `Unsupported column type ${this.type}`;
    }
};
function fieldToColumnType(fieldTypeId) {
    switch(fieldTypeId){
        case ScalarColumnType.INT2:
        case ScalarColumnType.INT4:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Int32;
        case ScalarColumnType.INT8:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Int64;
        case ScalarColumnType.FLOAT4:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Float;
        case ScalarColumnType.FLOAT8:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Double;
        case ScalarColumnType.BOOL:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Boolean;
        case ScalarColumnType.DATE:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Date;
        case ScalarColumnType.TIME:
        case ScalarColumnType.TIMETZ:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Time;
        case ScalarColumnType.TIMESTAMP:
        case ScalarColumnType.TIMESTAMPTZ:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].DateTime;
        case ScalarColumnType.NUMERIC:
        case ScalarColumnType.MONEY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Numeric;
        case ScalarColumnType.JSON:
        case ScalarColumnType.JSONB:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Json;
        case ScalarColumnType.UUID:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Uuid;
        case ScalarColumnType.OID:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Int64;
        case ScalarColumnType.BPCHAR:
        case ScalarColumnType.TEXT:
        case ScalarColumnType.VARCHAR:
        case ScalarColumnType.BIT:
        case ScalarColumnType.VARBIT:
        case ScalarColumnType.INET:
        case ScalarColumnType.CIDR:
        case ScalarColumnType.XML:
        case AdditionalScalarColumnType.NAME:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Text;
        case ScalarColumnType.BYTEA:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Bytes;
        case ArrayColumnType.INT2_ARRAY:
        case ArrayColumnType.INT4_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Int32Array;
        case ArrayColumnType.FLOAT4_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].FloatArray;
        case ArrayColumnType.FLOAT8_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].DoubleArray;
        case ArrayColumnType.NUMERIC_ARRAY:
        case ArrayColumnType.MONEY_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].NumericArray;
        case ArrayColumnType.BOOL_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].BooleanArray;
        case ArrayColumnType.CHAR_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].CharacterArray;
        case ArrayColumnType.BPCHAR_ARRAY:
        case ArrayColumnType.TEXT_ARRAY:
        case ArrayColumnType.VARCHAR_ARRAY:
        case ArrayColumnType.VARBIT_ARRAY:
        case ArrayColumnType.BIT_ARRAY:
        case ArrayColumnType.INET_ARRAY:
        case ArrayColumnType.CIDR_ARRAY:
        case ArrayColumnType.XML_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].TextArray;
        case ArrayColumnType.DATE_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].DateArray;
        case ArrayColumnType.TIME_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].TimeArray;
        case ArrayColumnType.TIMESTAMP_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].DateTimeArray;
        case ArrayColumnType.TIMESTAMPTZ_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].DateTimeArray;
        case ArrayColumnType.JSON_ARRAY:
        case ArrayColumnType.JSONB_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].JsonArray;
        case ArrayColumnType.BYTEA_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].BytesArray;
        case ArrayColumnType.UUID_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].UuidArray;
        case ArrayColumnType.INT8_ARRAY:
        case ArrayColumnType.OID_ARRAY:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Int64Array;
        default:
            if (fieldTypeId >= FIRST_NORMAL_OBJECT_ID) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ColumnTypeEnum"].Text;
            }
            throw new UnsupportedNativeDataType(fieldTypeId);
    }
}
function normalize_array(element_normalizer) {
    return (str)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2d$array$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parse"])(str, element_normalizer);
}
function normalize_numeric(numeric) {
    return numeric;
}
function normalize_date(date) {
    return date;
}
function normalize_timestamp(time) {
    return `${time.replace(" ", "T")}+00:00`;
}
function normalize_timestamptz(time) {
    return time.replace(" ", "T").replace(/[+-]\d{2}(:\d{2})?$/, "+00:00");
}
function normalize_time(time) {
    return time;
}
function normalize_timez(time) {
    return time.replace(/[+-]\d{2}(:\d{2})?$/, "");
}
function normalize_money(money) {
    return money.slice(1);
}
function normalize_xml(xml) {
    return xml;
}
function toJson(json) {
    return json;
}
var parsePgBytes = getTypeParser(ScalarColumnType.BYTEA);
var normalizeByteaArray = getTypeParser(ArrayColumnType.BYTEA_ARRAY);
function convertBytes(serializedBytes) {
    return parsePgBytes(serializedBytes);
}
function normalizeBit(bit) {
    return bit;
}
var customParsers = {
    [ScalarColumnType.NUMERIC]: normalize_numeric,
    [ArrayColumnType.NUMERIC_ARRAY]: normalize_array(normalize_numeric),
    [ScalarColumnType.TIME]: normalize_time,
    [ArrayColumnType.TIME_ARRAY]: normalize_array(normalize_time),
    [ScalarColumnType.TIMETZ]: normalize_timez,
    [ScalarColumnType.DATE]: normalize_date,
    [ArrayColumnType.DATE_ARRAY]: normalize_array(normalize_date),
    [ScalarColumnType.TIMESTAMP]: normalize_timestamp,
    [ArrayColumnType.TIMESTAMP_ARRAY]: normalize_array(normalize_timestamp),
    [ScalarColumnType.TIMESTAMPTZ]: normalize_timestamptz,
    [ArrayColumnType.TIMESTAMPTZ_ARRAY]: normalize_array(normalize_timestamptz),
    [ScalarColumnType.MONEY]: normalize_money,
    [ArrayColumnType.MONEY_ARRAY]: normalize_array(normalize_money),
    [ScalarColumnType.JSON]: toJson,
    [ArrayColumnType.JSON_ARRAY]: normalize_array(toJson),
    [ScalarColumnType.JSONB]: toJson,
    [ArrayColumnType.JSONB_ARRAY]: normalize_array(toJson),
    [ScalarColumnType.BYTEA]: convertBytes,
    [ArrayColumnType.BYTEA_ARRAY]: normalizeByteaArray,
    [ArrayColumnType.BIT_ARRAY]: normalize_array(normalizeBit),
    [ArrayColumnType.VARBIT_ARRAY]: normalize_array(normalizeBit),
    [ArrayColumnType.XML_ARRAY]: normalize_array(normalize_xml)
};
function mapArg(arg, argType) {
    if (arg === null) {
        return null;
    }
    if (Array.isArray(arg) && argType.arity === "list") {
        return arg.map((value)=>mapArg(value, argType));
    }
    if (typeof arg === "string" && argType.scalarType === "datetime") {
        arg = new Date(arg);
    }
    if (arg instanceof Date) {
        switch(argType.dbType){
            case "TIME":
            case "TIMETZ":
                return formatTime(arg);
            case "DATE":
                return formatDate(arg);
            default:
                return formatDateTime(arg);
        }
    }
    if (typeof arg === "string" && argType.scalarType === "bytes") {
        return Buffer.from(arg, "base64");
    }
    if (ArrayBuffer.isView(arg)) {
        return new Uint8Array(arg.buffer, arg.byteOffset, arg.byteLength);
    }
    return arg;
}
function formatDateTime(date) {
    const pad = (n, z = 2)=>String(n).padStart(z, "0");
    const ms = date.getUTCMilliseconds();
    return pad(date.getUTCFullYear(), 4) + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate()) + " " + pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds()) + (ms ? "." + String(ms).padStart(3, "0") : "");
}
function formatDate(date) {
    const pad = (n, z = 2)=>String(n).padStart(z, "0");
    return pad(date.getUTCFullYear(), 4) + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate());
}
function formatTime(date) {
    const pad = (n, z = 2)=>String(n).padStart(z, "0");
    const ms = date.getUTCMilliseconds();
    return pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds()) + (ms ? "." + String(ms).padStart(3, "0") : "");
}
// src/errors.ts
var TLS_ERRORS = /* @__PURE__ */ new Set([
    "UNABLE_TO_GET_ISSUER_CERT",
    "UNABLE_TO_GET_CRL",
    "UNABLE_TO_DECRYPT_CERT_SIGNATURE",
    "UNABLE_TO_DECRYPT_CRL_SIGNATURE",
    "UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY",
    "CERT_SIGNATURE_FAILURE",
    "CRL_SIGNATURE_FAILURE",
    "CERT_NOT_YET_VALID",
    "CERT_HAS_EXPIRED",
    "CRL_NOT_YET_VALID",
    "CRL_HAS_EXPIRED",
    "ERROR_IN_CERT_NOT_BEFORE_FIELD",
    "ERROR_IN_CERT_NOT_AFTER_FIELD",
    "ERROR_IN_CRL_LAST_UPDATE_FIELD",
    "ERROR_IN_CRL_NEXT_UPDATE_FIELD",
    "DEPTH_ZERO_SELF_SIGNED_CERT",
    "SELF_SIGNED_CERT_IN_CHAIN",
    "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
    "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
    "CERT_CHAIN_TOO_LONG",
    "CERT_REVOKED",
    "INVALID_CA",
    "INVALID_PURPOSE",
    "CERT_UNTRUSTED",
    "CERT_REJECTED",
    "HOSTNAME_MISMATCH",
    "ERR_TLS_CERT_ALTNAME_FORMAT",
    "ERR_TLS_CERT_ALTNAME_INVALID"
]);
var SOCKET_ERRORS = /* @__PURE__ */ new Set([
    "ENOTFOUND",
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT"
]);
function convertDriverError(error) {
    if (isSocketError(error)) {
        return mapSocketError(error);
    }
    if (isTlsError(error)) {
        return {
            kind: "TlsConnectionError",
            reason: error.message
        };
    }
    if (isDriverError(error)) {
        return {
            originalCode: error.code,
            originalMessage: error.message,
            ...mapDriverError(error)
        };
    }
    throw error;
}
function mapDriverError(error) {
    switch(error.code){
        case "22001":
            return {
                kind: "LengthMismatch",
                column: error.column
            };
        case "22003":
            return {
                kind: "ValueOutOfRange",
                cause: error.message
            };
        case "22P02":
            return {
                kind: "InvalidInputValue",
                message: error.message
            };
        case "23505":
            {
                const fields = error.detail?.match(/Key \(([^)]+)\)/)?.at(1)?.split(", ");
                return {
                    kind: "UniqueConstraintViolation",
                    constraint: fields !== void 0 ? {
                        fields
                    } : void 0
                };
            }
        case "23502":
            {
                const fields = error.detail?.match(/Key \(([^)]+)\)/)?.at(1)?.split(", ");
                return {
                    kind: "NullConstraintViolation",
                    constraint: fields !== void 0 ? {
                        fields
                    } : void 0
                };
            }
        case "23503":
            {
                let constraint;
                if (error.column) {
                    constraint = {
                        fields: [
                            error.column
                        ]
                    };
                } else if (error.constraint) {
                    constraint = {
                        index: error.constraint
                    };
                }
                return {
                    kind: "ForeignKeyConstraintViolation",
                    constraint
                };
            }
        case "3D000":
            return {
                kind: "DatabaseDoesNotExist",
                db: error.message.split(" ").at(1)?.split('"').at(1)
            };
        case "28000":
            return {
                kind: "DatabaseAccessDenied",
                db: error.message.split(",").find((s)=>s.startsWith(" database"))?.split('"').at(1)
            };
        case "28P01":
            return {
                kind: "AuthenticationFailed",
                user: error.message.split(" ").pop()?.split('"').at(1)
            };
        case "40001":
            return {
                kind: "TransactionWriteConflict"
            };
        case "42P01":
            return {
                kind: "TableDoesNotExist",
                table: error.message.split(" ").at(1)?.split('"').at(1)
            };
        case "42703":
            return {
                kind: "ColumnNotFound",
                column: error.message.split(" ").at(1)?.split('"').at(1)
            };
        case "42P04":
            return {
                kind: "DatabaseAlreadyExists",
                db: error.message.split(" ").at(1)?.split('"').at(1)
            };
        case "53300":
            return {
                kind: "TooManyConnections",
                cause: error.message
            };
        default:
            return {
                kind: "postgres",
                code: error.code ?? "N/A",
                severity: error.severity ?? "N/A",
                message: error.message,
                detail: error.detail,
                column: error.column,
                hint: error.hint
            };
    }
}
function isDriverError(error) {
    return typeof error.code === "string" && typeof error.message === "string" && typeof error.severity === "string" && (typeof error.detail === "string" || error.detail === void 0) && (typeof error.column === "string" || error.column === void 0) && (typeof error.hint === "string" || error.hint === void 0);
}
function mapSocketError(error) {
    switch(error.code){
        case "ENOTFOUND":
        case "ECONNREFUSED":
            return {
                kind: "DatabaseNotReachable",
                host: error.address ?? error.hostname,
                port: error.port
            };
        case "ECONNRESET":
            return {
                kind: "ConnectionClosed"
            };
        case "ETIMEDOUT":
            return {
                kind: "SocketTimeout"
            };
    }
}
function isSocketError(error) {
    return typeof error.code === "string" && typeof error.syscall === "string" && typeof error.errno === "number" && SOCKET_ERRORS.has(error.code);
}
function isTlsError(error) {
    if (typeof error.code === "string") {
        return TLS_ERRORS.has(error.code);
    }
    switch(error.message){
        case "The server does not support SSL connections":
        case "There was an error establishing an SSL connection":
            return true;
    }
    return false;
}
// src/pg.ts
var types2 = __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["default"].types;
var debug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$debug$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Debug"])("prisma:driver-adapter:pg");
var PgQueryable = class {
    constructor(client, pgOptions){
        this.client = client;
        this.pgOptions = pgOptions;
    }
    provider = "postgres";
    adapterName = name;
    /**
   * Execute a query given as SQL, interpolating the given parameters.
   */ async queryRaw(query) {
        const tag = "[js::query_raw]";
        debug(`${tag} %O`, query);
        const { fields, rows } = await this.performIO(query);
        const columnNames = fields.map((field)=>field.name);
        let columnTypes = [];
        try {
            columnTypes = fields.map((field)=>fieldToColumnType(field.dataTypeID));
        } catch (e) {
            if (e instanceof UnsupportedNativeDataType) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DriverAdapterError"]({
                    kind: "UnsupportedNativeDataType",
                    type: e.type
                });
            }
            throw e;
        }
        const udtParser = this.pgOptions?.userDefinedTypeParser;
        if (udtParser) {
            for(let i = 0; i < fields.length; i++){
                const field = fields[i];
                if (field.dataTypeID >= FIRST_NORMAL_OBJECT_ID && !Object.hasOwn(customParsers, field.dataTypeID)) {
                    for(let j = 0; j < rows.length; j++){
                        rows[j][i] = await udtParser(field.dataTypeID, rows[j][i], this);
                    }
                }
            }
        }
        return {
            columnNames,
            columnTypes,
            rows
        };
    }
    /**
   * Execute a query given as SQL, interpolating the given parameters and
   * returning the number of affected rows.
   * Note: Queryable expects a u64, but napi.rs only supports u32.
   */ async executeRaw(query) {
        const tag = "[js::execute_raw]";
        debug(`${tag} %O`, query);
        return (await this.performIO(query)).rowCount ?? 0;
    }
    /**
   * Run a query against the database, returning the result set.
   * Should the query fail due to a connection error, the connection is
   * marked as unhealthy.
   */ async performIO(query) {
        const { sql, args } = query;
        const values = args.map((arg, i)=>mapArg(arg, query.argTypes[i]));
        try {
            const result = await this.client.query({
                text: sql,
                values,
                rowMode: "array",
                types: {
                    // This is the error expected:
                    // No overload matches this call.
                    // The last overload gave the following error.
                    // Type '(oid: number, format?: any) => (json: string) => unknown' is not assignable to type '{ <T>(oid: number): TypeParser<string, string | T>; <T>(oid: number, format: "text"): TypeParser<string, string | T>; <T>(oid: number, format: "binary"): TypeParser<...>; }'.
                    //   Type '(json: string) => unknown' is not assignable to type 'TypeParser<Buffer, any>'.
                    //     Types of parameters 'json' and 'value' are incompatible.
                    //       Type 'Buffer' is not assignable to type 'string'.ts(2769)
                    //
                    // Because pg-types types expect us to handle both binary and text protocol versions,
                    // where as far we can see, pg will ever pass only text version.
                    //
                    // @ts-expect-error
                    getTypeParser: (oid, format)=>{
                        if (format === "text" && customParsers[oid]) {
                            return customParsers[oid];
                        }
                        return types2.getTypeParser(oid, format);
                    }
                }
            }, values);
            return result;
        } catch (e) {
            this.onError(e);
        }
    }
    onError(error) {
        debug("Error in performIO: %O", error);
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$driver$2d$adapter$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DriverAdapterError"](convertDriverError(error));
    }
};
var PgTransaction = class extends PgQueryable {
    constructor(client, options, pgOptions, cleanup){
        super(client, pgOptions);
        this.options = options;
        this.pgOptions = pgOptions;
        this.cleanup = cleanup;
    }
    async commit() {
        debug(`[js::commit]`);
        this.cleanup?.();
        this.client.release();
    }
    async rollback() {
        debug(`[js::rollback]`);
        this.cleanup?.();
        this.client.release();
    }
};
var PrismaPgAdapter = class extends PgQueryable {
    constructor(client, pgOptions, release){
        super(client);
        this.pgOptions = pgOptions;
        this.release = release;
    }
    async startTransaction(isolationLevel) {
        const options = {
            usePhantomQuery: false
        };
        const tag = "[js::startTransaction]";
        debug("%s options: %O", tag, options);
        const conn = await this.client.connect().catch((error)=>this.onError(error));
        const onError = (err)=>{
            debug(`Error from pool connection: ${err.message} %O`, err);
            this.pgOptions?.onConnectionError?.(err);
        };
        conn.on("error", onError);
        const cleanup = ()=>{
            conn.removeListener("error", onError);
        };
        try {
            const tx = new PgTransaction(conn, options, this.pgOptions, cleanup);
            await tx.executeRaw({
                sql: "BEGIN",
                args: [],
                argTypes: []
            });
            if (isolationLevel) {
                await tx.executeRaw({
                    sql: `SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`,
                    args: [],
                    argTypes: []
                });
            }
            return tx;
        } catch (error) {
            cleanup();
            conn.release(error);
            this.onError(error);
        }
    }
    async executeScript(script) {
        const statements = script.split(";").map((stmt)=>stmt.trim()).filter((stmt)=>stmt.length > 0);
        for (const stmt of statements){
            try {
                await this.client.query(stmt);
            } catch (error) {
                this.onError(error);
            }
        }
    }
    getConnectionInfo() {
        return {
            schemaName: this.pgOptions?.schema,
            supportsRelationJoins: true
        };
    }
    async dispose() {
        return this.release?.();
    }
    underlyingDriver() {
        return this.client;
    }
};
var PrismaPgAdapterFactory = class {
    constructor(poolOrConfig, options){
        this.options = options;
        if (poolOrConfig instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["default"].Pool) {
            this.externalPool = poolOrConfig;
            this.config = poolOrConfig.options;
        } else {
            this.externalPool = null;
            this.config = poolOrConfig;
        }
    }
    provider = "postgres";
    adapterName = name;
    config;
    externalPool;
    async connect() {
        const client = this.externalPool ?? new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["default"].Pool(this.config);
        const onIdleClientError = (err)=>{
            debug(`Error from idle pool client: ${err.message} %O`, err);
            this.options?.onPoolError?.(err);
        };
        client.on("error", onIdleClientError);
        return new PrismaPgAdapter(client, this.options, async ()=>{
            if (this.externalPool) {
                if (this.options?.disposeExternalPool) {
                    await this.externalPool.end();
                    this.externalPool = null;
                } else {
                    this.externalPool.removeListener("error", onIdleClientError);
                }
            } else {
                await client.end();
            }
        });
    }
    async connectToShadowDb() {
        const conn = await this.connect();
        const database = `prisma_migrate_shadow_db_${globalThis.crypto.randomUUID()}`;
        await conn.executeScript(`CREATE DATABASE "${database}"`);
        const client = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["default"].Pool({
            ...this.config,
            database
        });
        return new PrismaPgAdapter(client, void 0, async ()=>{
            await conn.executeScript(`DROP DATABASE "${database}"`);
            await client.end();
        });
    }
};
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compare",
    ()=>compare,
    "compareSync",
    ()=>compareSync,
    "decodeBase64",
    ()=>decodeBase64,
    "default",
    ()=>__TURBOPACK__default__export__,
    "encodeBase64",
    ()=>encodeBase64,
    "genSalt",
    ()=>genSalt,
    "genSaltSync",
    ()=>genSaltSync,
    "getRounds",
    ()=>getRounds,
    "getSalt",
    ()=>getSalt,
    "hash",
    ()=>hash,
    "hashSync",
    ()=>hashSync,
    "setRandomFallback",
    ()=>setRandomFallback,
    "truncates",
    ()=>truncates
]);
/*
 Copyright (c) 2012 Nevins Bartolomeo <nevins.bartolomeo@gmail.com>
 Copyright (c) 2012 Shane Girish <shaneGirish@gmail.com>
 Copyright (c) 2025 Daniel Wirtz <dcode@dcode.io>

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 1. Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 3. The name of the author may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */ // The Node.js crypto module is used as a fallback for the Web Crypto API. When
// building for the browser, inclusion of the crypto module should be disabled,
// which the package hints at in its package.json for bundlers that support it.
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
/**
 * The random implementation to use as a fallback.
 * @type {?function(number):!Array.<number>}
 * @inner
 */ var randomFallback = null;
/**
 * Generates cryptographically secure random bytes.
 * @function
 * @param {number} len Bytes length
 * @returns {!Array.<number>} Random bytes
 * @throws {Error} If no random implementation is available
 * @inner
 */ function randomBytes(len) {
    // Web Crypto API. Globally available in the browser and in Node.js >=23.
    try {
        return crypto.getRandomValues(new Uint8Array(len));
    } catch  {}
    // Node.js crypto module for non-browser environments.
    try {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(len);
    } catch  {}
    // Custom fallback specified with `setRandomFallback`.
    if (!randomFallback) {
        throw Error("Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative");
    }
    return randomFallback(len);
}
function setRandomFallback(random) {
    randomFallback = random;
}
function genSaltSync(rounds, seed_length) {
    rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
    if (typeof rounds !== "number") throw Error("Illegal arguments: " + typeof rounds + ", " + typeof seed_length);
    if (rounds < 4) rounds = 4;
    else if (rounds > 31) rounds = 31;
    var salt = [];
    salt.push("$2b$");
    if (rounds < 10) salt.push("0");
    salt.push(rounds.toString());
    salt.push("$");
    salt.push(base64_encode(randomBytes(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN)); // May throw
    return salt.join("");
}
function genSalt(rounds, seed_length, callback) {
    if (typeof seed_length === "function") callback = seed_length, seed_length = undefined; // Not supported.
    if (typeof rounds === "function") callback = rounds, rounds = undefined;
    if (typeof rounds === "undefined") rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
    else if (typeof rounds !== "number") throw Error("illegal arguments: " + typeof rounds);
    function _async(callback) {
        nextTick(function() {
            // Pretty thin, but salting is fast enough
            try {
                callback(null, genSaltSync(rounds));
            } catch (err) {
                callback(err);
            }
        });
    }
    if (callback) {
        if (typeof callback !== "function") throw Error("Illegal callback: " + typeof callback);
        _async(callback);
    } else return new Promise(function(resolve, reject) {
        _async(function(err, res) {
            if (err) {
                reject(err);
                return;
            }
            resolve(res);
        });
    });
}
function hashSync(password, salt) {
    if (typeof salt === "undefined") salt = GENSALT_DEFAULT_LOG2_ROUNDS;
    if (typeof salt === "number") salt = genSaltSync(salt);
    if (typeof password !== "string" || typeof salt !== "string") throw Error("Illegal arguments: " + typeof password + ", " + typeof salt);
    return _hash(password, salt);
}
function hash(password, salt, callback, progressCallback) {
    function _async(callback) {
        if (typeof password === "string" && typeof salt === "number") genSalt(salt, function(err, salt) {
            _hash(password, salt, callback, progressCallback);
        });
        else if (typeof password === "string" && typeof salt === "string") _hash(password, salt, callback, progressCallback);
        else nextTick(callback.bind(this, Error("Illegal arguments: " + typeof password + ", " + typeof salt)));
    }
    if (callback) {
        if (typeof callback !== "function") throw Error("Illegal callback: " + typeof callback);
        _async(callback);
    } else return new Promise(function(resolve, reject) {
        _async(function(err, res) {
            if (err) {
                reject(err);
                return;
            }
            resolve(res);
        });
    });
}
/**
 * Compares two strings of the same length in constant time.
 * @param {string} known Must be of the correct length
 * @param {string} unknown Must be the same length as `known`
 * @returns {boolean}
 * @inner
 */ function safeStringCompare(known, unknown) {
    var diff = known.length ^ unknown.length;
    for(var i = 0; i < known.length; ++i){
        diff |= known.charCodeAt(i) ^ unknown.charCodeAt(i);
    }
    return diff === 0;
}
function compareSync(password, hash) {
    if (typeof password !== "string" || typeof hash !== "string") throw Error("Illegal arguments: " + typeof password + ", " + typeof hash);
    if (hash.length !== 60) return false;
    return safeStringCompare(hashSync(password, hash.substring(0, hash.length - 31)), hash);
}
function compare(password, hashValue, callback, progressCallback) {
    function _async(callback) {
        if (typeof password !== "string" || typeof hashValue !== "string") {
            nextTick(callback.bind(this, Error("Illegal arguments: " + typeof password + ", " + typeof hashValue)));
            return;
        }
        if (hashValue.length !== 60) {
            nextTick(callback.bind(this, null, false));
            return;
        }
        hash(password, hashValue.substring(0, 29), function(err, comp) {
            if (err) callback(err);
            else callback(null, safeStringCompare(comp, hashValue));
        }, progressCallback);
    }
    if (callback) {
        if (typeof callback !== "function") throw Error("Illegal callback: " + typeof callback);
        _async(callback);
    } else return new Promise(function(resolve, reject) {
        _async(function(err, res) {
            if (err) {
                reject(err);
                return;
            }
            resolve(res);
        });
    });
}
function getRounds(hash) {
    if (typeof hash !== "string") throw Error("Illegal arguments: " + typeof hash);
    return parseInt(hash.split("$")[2], 10);
}
function getSalt(hash) {
    if (typeof hash !== "string") throw Error("Illegal arguments: " + typeof hash);
    if (hash.length !== 60) throw Error("Illegal hash length: " + hash.length + " != 60");
    return hash.substring(0, 29);
}
function truncates(password) {
    if (typeof password !== "string") throw Error("Illegal arguments: " + typeof password);
    return utf8Length(password) > 72;
}
/**
 * Continues with the callback after yielding to the event loop.
 * @function
 * @param {function(...[*])} callback Callback to execute
 * @inner
 */ var nextTick = typeof setImmediate === "function" ? setImmediate : typeof scheduler === "object" && typeof scheduler.postTask === "function" ? scheduler.postTask.bind(scheduler) : setTimeout;
/** Calculates the byte length of a string encoded as UTF8. */ function utf8Length(string) {
    var len = 0, c = 0;
    for(var i = 0; i < string.length; ++i){
        c = string.charCodeAt(i);
        if (c < 128) len += 1;
        else if (c < 2048) len += 2;
        else if ((c & 0xfc00) === 0xd800 && (string.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
            ++i;
            len += 4;
        } else len += 3;
    }
    return len;
}
/** Converts a string to an array of UTF8 bytes. */ function utf8Array(string) {
    var offset = 0, c1, c2;
    var buffer = new Array(utf8Length(string));
    for(var i = 0, k = string.length; i < k; ++i){
        c1 = string.charCodeAt(i);
        if (c1 < 128) {
            buffer[offset++] = c1;
        } else if (c1 < 2048) {
            buffer[offset++] = c1 >> 6 | 192;
            buffer[offset++] = c1 & 63 | 128;
        } else if ((c1 & 0xfc00) === 0xd800 && ((c2 = string.charCodeAt(i + 1)) & 0xfc00) === 0xdc00) {
            c1 = 0x10000 + ((c1 & 0x03ff) << 10) + (c2 & 0x03ff);
            ++i;
            buffer[offset++] = c1 >> 18 | 240;
            buffer[offset++] = c1 >> 12 & 63 | 128;
            buffer[offset++] = c1 >> 6 & 63 | 128;
            buffer[offset++] = c1 & 63 | 128;
        } else {
            buffer[offset++] = c1 >> 12 | 224;
            buffer[offset++] = c1 >> 6 & 63 | 128;
            buffer[offset++] = c1 & 63 | 128;
        }
    }
    return buffer;
}
// A base64 implementation for the bcrypt algorithm. This is partly non-standard.
/**
 * bcrypt's own non-standard base64 dictionary.
 * @type {!Array.<string>}
 * @const
 * @inner
 **/ var BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
/**
 * @type {!Array.<number>}
 * @const
 * @inner
 **/ var BASE64_INDEX = [
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    0,
    1,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    62,
    63,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    52,
    53,
    -1,
    -1,
    -1,
    -1,
    -1
];
/**
 * Encodes a byte array to base64 with up to len bytes of input.
 * @param {!Array.<number>} b Byte array
 * @param {number} len Maximum input length
 * @returns {string}
 * @inner
 */ function base64_encode(b, len) {
    var off = 0, rs = [], c1, c2;
    if (len <= 0 || len > b.length) throw Error("Illegal len: " + len);
    while(off < len){
        c1 = b[off++] & 0xff;
        rs.push(BASE64_CODE[c1 >> 2 & 0x3f]);
        c1 = (c1 & 0x03) << 4;
        if (off >= len) {
            rs.push(BASE64_CODE[c1 & 0x3f]);
            break;
        }
        c2 = b[off++] & 0xff;
        c1 |= c2 >> 4 & 0x0f;
        rs.push(BASE64_CODE[c1 & 0x3f]);
        c1 = (c2 & 0x0f) << 2;
        if (off >= len) {
            rs.push(BASE64_CODE[c1 & 0x3f]);
            break;
        }
        c2 = b[off++] & 0xff;
        c1 |= c2 >> 6 & 0x03;
        rs.push(BASE64_CODE[c1 & 0x3f]);
        rs.push(BASE64_CODE[c2 & 0x3f]);
    }
    return rs.join("");
}
/**
 * Decodes a base64 encoded string to up to len bytes of output.
 * @param {string} s String to decode
 * @param {number} len Maximum output length
 * @returns {!Array.<number>}
 * @inner
 */ function base64_decode(s, len) {
    var off = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
    if (len <= 0) throw Error("Illegal len: " + len);
    while(off < slen - 1 && olen < len){
        code = s.charCodeAt(off++);
        c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
        code = s.charCodeAt(off++);
        c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
        if (c1 == -1 || c2 == -1) break;
        o = c1 << 2 >>> 0;
        o |= (c2 & 0x30) >> 4;
        rs.push(String.fromCharCode(o));
        if (++olen >= len || off >= slen) break;
        code = s.charCodeAt(off++);
        c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
        if (c3 == -1) break;
        o = (c2 & 0x0f) << 4 >>> 0;
        o |= (c3 & 0x3c) >> 2;
        rs.push(String.fromCharCode(o));
        if (++olen >= len || off >= slen) break;
        code = s.charCodeAt(off++);
        c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
        o = (c3 & 0x03) << 6 >>> 0;
        o |= c4;
        rs.push(String.fromCharCode(o));
        ++olen;
    }
    var res = [];
    for(off = 0; off < olen; off++)res.push(rs[off].charCodeAt(0));
    return res;
}
/**
 * @type {number}
 * @const
 * @inner
 */ var BCRYPT_SALT_LEN = 16;
/**
 * @type {number}
 * @const
 * @inner
 */ var GENSALT_DEFAULT_LOG2_ROUNDS = 10;
/**
 * @type {number}
 * @const
 * @inner
 */ var BLOWFISH_NUM_ROUNDS = 16;
/**
 * @type {number}
 * @const
 * @inner
 */ var MAX_EXECUTION_TIME = 100;
/**
 * @type {Array.<number>}
 * @const
 * @inner
 */ var P_ORIG = [
    0x243f6a88,
    0x85a308d3,
    0x13198a2e,
    0x03707344,
    0xa4093822,
    0x299f31d0,
    0x082efa98,
    0xec4e6c89,
    0x452821e6,
    0x38d01377,
    0xbe5466cf,
    0x34e90c6c,
    0xc0ac29b7,
    0xc97c50dd,
    0x3f84d5b5,
    0xb5470917,
    0x9216d5d9,
    0x8979fb1b
];
/**
 * @type {Array.<number>}
 * @const
 * @inner
 */ var S_ORIG = [
    0xd1310ba6,
    0x98dfb5ac,
    0x2ffd72db,
    0xd01adfb7,
    0xb8e1afed,
    0x6a267e96,
    0xba7c9045,
    0xf12c7f99,
    0x24a19947,
    0xb3916cf7,
    0x0801f2e2,
    0x858efc16,
    0x636920d8,
    0x71574e69,
    0xa458fea3,
    0xf4933d7e,
    0x0d95748f,
    0x728eb658,
    0x718bcd58,
    0x82154aee,
    0x7b54a41d,
    0xc25a59b5,
    0x9c30d539,
    0x2af26013,
    0xc5d1b023,
    0x286085f0,
    0xca417918,
    0xb8db38ef,
    0x8e79dcb0,
    0x603a180e,
    0x6c9e0e8b,
    0xb01e8a3e,
    0xd71577c1,
    0xbd314b27,
    0x78af2fda,
    0x55605c60,
    0xe65525f3,
    0xaa55ab94,
    0x57489862,
    0x63e81440,
    0x55ca396a,
    0x2aab10b6,
    0xb4cc5c34,
    0x1141e8ce,
    0xa15486af,
    0x7c72e993,
    0xb3ee1411,
    0x636fbc2a,
    0x2ba9c55d,
    0x741831f6,
    0xce5c3e16,
    0x9b87931e,
    0xafd6ba33,
    0x6c24cf5c,
    0x7a325381,
    0x28958677,
    0x3b8f4898,
    0x6b4bb9af,
    0xc4bfe81b,
    0x66282193,
    0x61d809cc,
    0xfb21a991,
    0x487cac60,
    0x5dec8032,
    0xef845d5d,
    0xe98575b1,
    0xdc262302,
    0xeb651b88,
    0x23893e81,
    0xd396acc5,
    0x0f6d6ff3,
    0x83f44239,
    0x2e0b4482,
    0xa4842004,
    0x69c8f04a,
    0x9e1f9b5e,
    0x21c66842,
    0xf6e96c9a,
    0x670c9c61,
    0xabd388f0,
    0x6a51a0d2,
    0xd8542f68,
    0x960fa728,
    0xab5133a3,
    0x6eef0b6c,
    0x137a3be4,
    0xba3bf050,
    0x7efb2a98,
    0xa1f1651d,
    0x39af0176,
    0x66ca593e,
    0x82430e88,
    0x8cee8619,
    0x456f9fb4,
    0x7d84a5c3,
    0x3b8b5ebe,
    0xe06f75d8,
    0x85c12073,
    0x401a449f,
    0x56c16aa6,
    0x4ed3aa62,
    0x363f7706,
    0x1bfedf72,
    0x429b023d,
    0x37d0d724,
    0xd00a1248,
    0xdb0fead3,
    0x49f1c09b,
    0x075372c9,
    0x80991b7b,
    0x25d479d8,
    0xf6e8def7,
    0xe3fe501a,
    0xb6794c3b,
    0x976ce0bd,
    0x04c006ba,
    0xc1a94fb6,
    0x409f60c4,
    0x5e5c9ec2,
    0x196a2463,
    0x68fb6faf,
    0x3e6c53b5,
    0x1339b2eb,
    0x3b52ec6f,
    0x6dfc511f,
    0x9b30952c,
    0xcc814544,
    0xaf5ebd09,
    0xbee3d004,
    0xde334afd,
    0x660f2807,
    0x192e4bb3,
    0xc0cba857,
    0x45c8740f,
    0xd20b5f39,
    0xb9d3fbdb,
    0x5579c0bd,
    0x1a60320a,
    0xd6a100c6,
    0x402c7279,
    0x679f25fe,
    0xfb1fa3cc,
    0x8ea5e9f8,
    0xdb3222f8,
    0x3c7516df,
    0xfd616b15,
    0x2f501ec8,
    0xad0552ab,
    0x323db5fa,
    0xfd238760,
    0x53317b48,
    0x3e00df82,
    0x9e5c57bb,
    0xca6f8ca0,
    0x1a87562e,
    0xdf1769db,
    0xd542a8f6,
    0x287effc3,
    0xac6732c6,
    0x8c4f5573,
    0x695b27b0,
    0xbbca58c8,
    0xe1ffa35d,
    0xb8f011a0,
    0x10fa3d98,
    0xfd2183b8,
    0x4afcb56c,
    0x2dd1d35b,
    0x9a53e479,
    0xb6f84565,
    0xd28e49bc,
    0x4bfb9790,
    0xe1ddf2da,
    0xa4cb7e33,
    0x62fb1341,
    0xcee4c6e8,
    0xef20cada,
    0x36774c01,
    0xd07e9efe,
    0x2bf11fb4,
    0x95dbda4d,
    0xae909198,
    0xeaad8e71,
    0x6b93d5a0,
    0xd08ed1d0,
    0xafc725e0,
    0x8e3c5b2f,
    0x8e7594b7,
    0x8ff6e2fb,
    0xf2122b64,
    0x8888b812,
    0x900df01c,
    0x4fad5ea0,
    0x688fc31c,
    0xd1cff191,
    0xb3a8c1ad,
    0x2f2f2218,
    0xbe0e1777,
    0xea752dfe,
    0x8b021fa1,
    0xe5a0cc0f,
    0xb56f74e8,
    0x18acf3d6,
    0xce89e299,
    0xb4a84fe0,
    0xfd13e0b7,
    0x7cc43b81,
    0xd2ada8d9,
    0x165fa266,
    0x80957705,
    0x93cc7314,
    0x211a1477,
    0xe6ad2065,
    0x77b5fa86,
    0xc75442f5,
    0xfb9d35cf,
    0xebcdaf0c,
    0x7b3e89a0,
    0xd6411bd3,
    0xae1e7e49,
    0x00250e2d,
    0x2071b35e,
    0x226800bb,
    0x57b8e0af,
    0x2464369b,
    0xf009b91e,
    0x5563911d,
    0x59dfa6aa,
    0x78c14389,
    0xd95a537f,
    0x207d5ba2,
    0x02e5b9c5,
    0x83260376,
    0x6295cfa9,
    0x11c81968,
    0x4e734a41,
    0xb3472dca,
    0x7b14a94a,
    0x1b510052,
    0x9a532915,
    0xd60f573f,
    0xbc9bc6e4,
    0x2b60a476,
    0x81e67400,
    0x08ba6fb5,
    0x571be91f,
    0xf296ec6b,
    0x2a0dd915,
    0xb6636521,
    0xe7b9f9b6,
    0xff34052e,
    0xc5855664,
    0x53b02d5d,
    0xa99f8fa1,
    0x08ba4799,
    0x6e85076a,
    0x4b7a70e9,
    0xb5b32944,
    0xdb75092e,
    0xc4192623,
    0xad6ea6b0,
    0x49a7df7d,
    0x9cee60b8,
    0x8fedb266,
    0xecaa8c71,
    0x699a17ff,
    0x5664526c,
    0xc2b19ee1,
    0x193602a5,
    0x75094c29,
    0xa0591340,
    0xe4183a3e,
    0x3f54989a,
    0x5b429d65,
    0x6b8fe4d6,
    0x99f73fd6,
    0xa1d29c07,
    0xefe830f5,
    0x4d2d38e6,
    0xf0255dc1,
    0x4cdd2086,
    0x8470eb26,
    0x6382e9c6,
    0x021ecc5e,
    0x09686b3f,
    0x3ebaefc9,
    0x3c971814,
    0x6b6a70a1,
    0x687f3584,
    0x52a0e286,
    0xb79c5305,
    0xaa500737,
    0x3e07841c,
    0x7fdeae5c,
    0x8e7d44ec,
    0x5716f2b8,
    0xb03ada37,
    0xf0500c0d,
    0xf01c1f04,
    0x0200b3ff,
    0xae0cf51a,
    0x3cb574b2,
    0x25837a58,
    0xdc0921bd,
    0xd19113f9,
    0x7ca92ff6,
    0x94324773,
    0x22f54701,
    0x3ae5e581,
    0x37c2dadc,
    0xc8b57634,
    0x9af3dda7,
    0xa9446146,
    0x0fd0030e,
    0xecc8c73e,
    0xa4751e41,
    0xe238cd99,
    0x3bea0e2f,
    0x3280bba1,
    0x183eb331,
    0x4e548b38,
    0x4f6db908,
    0x6f420d03,
    0xf60a04bf,
    0x2cb81290,
    0x24977c79,
    0x5679b072,
    0xbcaf89af,
    0xde9a771f,
    0xd9930810,
    0xb38bae12,
    0xdccf3f2e,
    0x5512721f,
    0x2e6b7124,
    0x501adde6,
    0x9f84cd87,
    0x7a584718,
    0x7408da17,
    0xbc9f9abc,
    0xe94b7d8c,
    0xec7aec3a,
    0xdb851dfa,
    0x63094366,
    0xc464c3d2,
    0xef1c1847,
    0x3215d908,
    0xdd433b37,
    0x24c2ba16,
    0x12a14d43,
    0x2a65c451,
    0x50940002,
    0x133ae4dd,
    0x71dff89e,
    0x10314e55,
    0x81ac77d6,
    0x5f11199b,
    0x043556f1,
    0xd7a3c76b,
    0x3c11183b,
    0x5924a509,
    0xf28fe6ed,
    0x97f1fbfa,
    0x9ebabf2c,
    0x1e153c6e,
    0x86e34570,
    0xeae96fb1,
    0x860e5e0a,
    0x5a3e2ab3,
    0x771fe71c,
    0x4e3d06fa,
    0x2965dcb9,
    0x99e71d0f,
    0x803e89d6,
    0x5266c825,
    0x2e4cc978,
    0x9c10b36a,
    0xc6150eba,
    0x94e2ea78,
    0xa5fc3c53,
    0x1e0a2df4,
    0xf2f74ea7,
    0x361d2b3d,
    0x1939260f,
    0x19c27960,
    0x5223a708,
    0xf71312b6,
    0xebadfe6e,
    0xeac31f66,
    0xe3bc4595,
    0xa67bc883,
    0xb17f37d1,
    0x018cff28,
    0xc332ddef,
    0xbe6c5aa5,
    0x65582185,
    0x68ab9802,
    0xeecea50f,
    0xdb2f953b,
    0x2aef7dad,
    0x5b6e2f84,
    0x1521b628,
    0x29076170,
    0xecdd4775,
    0x619f1510,
    0x13cca830,
    0xeb61bd96,
    0x0334fe1e,
    0xaa0363cf,
    0xb5735c90,
    0x4c70a239,
    0xd59e9e0b,
    0xcbaade14,
    0xeecc86bc,
    0x60622ca7,
    0x9cab5cab,
    0xb2f3846e,
    0x648b1eaf,
    0x19bdf0ca,
    0xa02369b9,
    0x655abb50,
    0x40685a32,
    0x3c2ab4b3,
    0x319ee9d5,
    0xc021b8f7,
    0x9b540b19,
    0x875fa099,
    0x95f7997e,
    0x623d7da8,
    0xf837889a,
    0x97e32d77,
    0x11ed935f,
    0x16681281,
    0x0e358829,
    0xc7e61fd6,
    0x96dedfa1,
    0x7858ba99,
    0x57f584a5,
    0x1b227263,
    0x9b83c3ff,
    0x1ac24696,
    0xcdb30aeb,
    0x532e3054,
    0x8fd948e4,
    0x6dbc3128,
    0x58ebf2ef,
    0x34c6ffea,
    0xfe28ed61,
    0xee7c3c73,
    0x5d4a14d9,
    0xe864b7e3,
    0x42105d14,
    0x203e13e0,
    0x45eee2b6,
    0xa3aaabea,
    0xdb6c4f15,
    0xfacb4fd0,
    0xc742f442,
    0xef6abbb5,
    0x654f3b1d,
    0x41cd2105,
    0xd81e799e,
    0x86854dc7,
    0xe44b476a,
    0x3d816250,
    0xcf62a1f2,
    0x5b8d2646,
    0xfc8883a0,
    0xc1c7b6a3,
    0x7f1524c3,
    0x69cb7492,
    0x47848a0b,
    0x5692b285,
    0x095bbf00,
    0xad19489d,
    0x1462b174,
    0x23820e00,
    0x58428d2a,
    0x0c55f5ea,
    0x1dadf43e,
    0x233f7061,
    0x3372f092,
    0x8d937e41,
    0xd65fecf1,
    0x6c223bdb,
    0x7cde3759,
    0xcbee7460,
    0x4085f2a7,
    0xce77326e,
    0xa6078084,
    0x19f8509e,
    0xe8efd855,
    0x61d99735,
    0xa969a7aa,
    0xc50c06c2,
    0x5a04abfc,
    0x800bcadc,
    0x9e447a2e,
    0xc3453484,
    0xfdd56705,
    0x0e1e9ec9,
    0xdb73dbd3,
    0x105588cd,
    0x675fda79,
    0xe3674340,
    0xc5c43465,
    0x713e38d8,
    0x3d28f89e,
    0xf16dff20,
    0x153e21e7,
    0x8fb03d4a,
    0xe6e39f2b,
    0xdb83adf7,
    0xe93d5a68,
    0x948140f7,
    0xf64c261c,
    0x94692934,
    0x411520f7,
    0x7602d4f7,
    0xbcf46b2e,
    0xd4a20068,
    0xd4082471,
    0x3320f46a,
    0x43b7d4b7,
    0x500061af,
    0x1e39f62e,
    0x97244546,
    0x14214f74,
    0xbf8b8840,
    0x4d95fc1d,
    0x96b591af,
    0x70f4ddd3,
    0x66a02f45,
    0xbfbc09ec,
    0x03bd9785,
    0x7fac6dd0,
    0x31cb8504,
    0x96eb27b3,
    0x55fd3941,
    0xda2547e6,
    0xabca0a9a,
    0x28507825,
    0x530429f4,
    0x0a2c86da,
    0xe9b66dfb,
    0x68dc1462,
    0xd7486900,
    0x680ec0a4,
    0x27a18dee,
    0x4f3ffea2,
    0xe887ad8c,
    0xb58ce006,
    0x7af4d6b6,
    0xaace1e7c,
    0xd3375fec,
    0xce78a399,
    0x406b2a42,
    0x20fe9e35,
    0xd9f385b9,
    0xee39d7ab,
    0x3b124e8b,
    0x1dc9faf7,
    0x4b6d1856,
    0x26a36631,
    0xeae397b2,
    0x3a6efa74,
    0xdd5b4332,
    0x6841e7f7,
    0xca7820fb,
    0xfb0af54e,
    0xd8feb397,
    0x454056ac,
    0xba489527,
    0x55533a3a,
    0x20838d87,
    0xfe6ba9b7,
    0xd096954b,
    0x55a867bc,
    0xa1159a58,
    0xcca92963,
    0x99e1db33,
    0xa62a4a56,
    0x3f3125f9,
    0x5ef47e1c,
    0x9029317c,
    0xfdf8e802,
    0x04272f70,
    0x80bb155c,
    0x05282ce3,
    0x95c11548,
    0xe4c66d22,
    0x48c1133f,
    0xc70f86dc,
    0x07f9c9ee,
    0x41041f0f,
    0x404779a4,
    0x5d886e17,
    0x325f51eb,
    0xd59bc0d1,
    0xf2bcc18f,
    0x41113564,
    0x257b7834,
    0x602a9c60,
    0xdff8e8a3,
    0x1f636c1b,
    0x0e12b4c2,
    0x02e1329e,
    0xaf664fd1,
    0xcad18115,
    0x6b2395e0,
    0x333e92e1,
    0x3b240b62,
    0xeebeb922,
    0x85b2a20e,
    0xe6ba0d99,
    0xde720c8c,
    0x2da2f728,
    0xd0127845,
    0x95b794fd,
    0x647d0862,
    0xe7ccf5f0,
    0x5449a36f,
    0x877d48fa,
    0xc39dfd27,
    0xf33e8d1e,
    0x0a476341,
    0x992eff74,
    0x3a6f6eab,
    0xf4f8fd37,
    0xa812dc60,
    0xa1ebddf8,
    0x991be14c,
    0xdb6e6b0d,
    0xc67b5510,
    0x6d672c37,
    0x2765d43b,
    0xdcd0e804,
    0xf1290dc7,
    0xcc00ffa3,
    0xb5390f92,
    0x690fed0b,
    0x667b9ffb,
    0xcedb7d9c,
    0xa091cf0b,
    0xd9155ea3,
    0xbb132f88,
    0x515bad24,
    0x7b9479bf,
    0x763bd6eb,
    0x37392eb3,
    0xcc115979,
    0x8026e297,
    0xf42e312d,
    0x6842ada7,
    0xc66a2b3b,
    0x12754ccc,
    0x782ef11c,
    0x6a124237,
    0xb79251e7,
    0x06a1bbe6,
    0x4bfb6350,
    0x1a6b1018,
    0x11caedfa,
    0x3d25bdd8,
    0xe2e1c3c9,
    0x44421659,
    0x0a121386,
    0xd90cec6e,
    0xd5abea2a,
    0x64af674e,
    0xda86a85f,
    0xbebfe988,
    0x64e4c3fe,
    0x9dbc8057,
    0xf0f7c086,
    0x60787bf8,
    0x6003604d,
    0xd1fd8346,
    0xf6381fb0,
    0x7745ae04,
    0xd736fccc,
    0x83426b33,
    0xf01eab71,
    0xb0804187,
    0x3c005e5f,
    0x77a057be,
    0xbde8ae24,
    0x55464299,
    0xbf582e61,
    0x4e58f48f,
    0xf2ddfda2,
    0xf474ef38,
    0x8789bdc2,
    0x5366f9c3,
    0xc8b38e74,
    0xb475f255,
    0x46fcd9b9,
    0x7aeb2661,
    0x8b1ddf84,
    0x846a0e79,
    0x915f95e2,
    0x466e598e,
    0x20b45770,
    0x8cd55591,
    0xc902de4c,
    0xb90bace1,
    0xbb8205d0,
    0x11a86248,
    0x7574a99e,
    0xb77f19b6,
    0xe0a9dc09,
    0x662d09a1,
    0xc4324633,
    0xe85a1f02,
    0x09f0be8c,
    0x4a99a025,
    0x1d6efe10,
    0x1ab93d1d,
    0x0ba5a4df,
    0xa186f20f,
    0x2868f169,
    0xdcb7da83,
    0x573906fe,
    0xa1e2ce9b,
    0x4fcd7f52,
    0x50115e01,
    0xa70683fa,
    0xa002b5c4,
    0x0de6d027,
    0x9af88c27,
    0x773f8641,
    0xc3604c06,
    0x61a806b5,
    0xf0177a28,
    0xc0f586e0,
    0x006058aa,
    0x30dc7d62,
    0x11e69ed7,
    0x2338ea63,
    0x53c2dd94,
    0xc2c21634,
    0xbbcbee56,
    0x90bcb6de,
    0xebfc7da1,
    0xce591d76,
    0x6f05e409,
    0x4b7c0188,
    0x39720a3d,
    0x7c927c24,
    0x86e3725f,
    0x724d9db9,
    0x1ac15bb4,
    0xd39eb8fc,
    0xed545578,
    0x08fca5b5,
    0xd83d7cd3,
    0x4dad0fc4,
    0x1e50ef5e,
    0xb161e6f8,
    0xa28514d9,
    0x6c51133c,
    0x6fd5c7e7,
    0x56e14ec4,
    0x362abfce,
    0xddc6c837,
    0xd79a3234,
    0x92638212,
    0x670efa8e,
    0x406000e0,
    0x3a39ce37,
    0xd3faf5cf,
    0xabc27737,
    0x5ac52d1b,
    0x5cb0679e,
    0x4fa33742,
    0xd3822740,
    0x99bc9bbe,
    0xd5118e9d,
    0xbf0f7315,
    0xd62d1c7e,
    0xc700c47b,
    0xb78c1b6b,
    0x21a19045,
    0xb26eb1be,
    0x6a366eb4,
    0x5748ab2f,
    0xbc946e79,
    0xc6a376d2,
    0x6549c2c8,
    0x530ff8ee,
    0x468dde7d,
    0xd5730a1d,
    0x4cd04dc6,
    0x2939bbdb,
    0xa9ba4650,
    0xac9526e8,
    0xbe5ee304,
    0xa1fad5f0,
    0x6a2d519a,
    0x63ef8ce2,
    0x9a86ee22,
    0xc089c2b8,
    0x43242ef6,
    0xa51e03aa,
    0x9cf2d0a4,
    0x83c061ba,
    0x9be96a4d,
    0x8fe51550,
    0xba645bd6,
    0x2826a2f9,
    0xa73a3ae1,
    0x4ba99586,
    0xef5562e9,
    0xc72fefd3,
    0xf752f7da,
    0x3f046f69,
    0x77fa0a59,
    0x80e4a915,
    0x87b08601,
    0x9b09e6ad,
    0x3b3ee593,
    0xe990fd5a,
    0x9e34d797,
    0x2cf0b7d9,
    0x022b8b51,
    0x96d5ac3a,
    0x017da67d,
    0xd1cf3ed6,
    0x7c7d2d28,
    0x1f9f25cf,
    0xadf2b89b,
    0x5ad6b472,
    0x5a88f54c,
    0xe029ac71,
    0xe019a5e6,
    0x47b0acfd,
    0xed93fa9b,
    0xe8d3c48d,
    0x283b57cc,
    0xf8d56629,
    0x79132e28,
    0x785f0191,
    0xed756055,
    0xf7960e44,
    0xe3d35e8c,
    0x15056dd4,
    0x88f46dba,
    0x03a16125,
    0x0564f0bd,
    0xc3eb9e15,
    0x3c9057a2,
    0x97271aec,
    0xa93a072a,
    0x1b3f6d9b,
    0x1e6321f5,
    0xf59c66fb,
    0x26dcf319,
    0x7533d928,
    0xb155fdf5,
    0x03563482,
    0x8aba3cbb,
    0x28517711,
    0xc20ad9f8,
    0xabcc5167,
    0xccad925f,
    0x4de81751,
    0x3830dc8e,
    0x379d5862,
    0x9320f991,
    0xea7a90c2,
    0xfb3e7bce,
    0x5121ce64,
    0x774fbe32,
    0xa8b6e37e,
    0xc3293d46,
    0x48de5369,
    0x6413e680,
    0xa2ae0810,
    0xdd6db224,
    0x69852dfd,
    0x09072166,
    0xb39a460a,
    0x6445c0dd,
    0x586cdecf,
    0x1c20c8ae,
    0x5bbef7dd,
    0x1b588d40,
    0xccd2017f,
    0x6bb4e3bb,
    0xdda26a7e,
    0x3a59ff45,
    0x3e350a44,
    0xbcb4cdd5,
    0x72eacea8,
    0xfa6484bb,
    0x8d6612ae,
    0xbf3c6f47,
    0xd29be463,
    0x542f5d9e,
    0xaec2771b,
    0xf64e6370,
    0x740e0d8d,
    0xe75b1357,
    0xf8721671,
    0xaf537d5d,
    0x4040cb08,
    0x4eb4e2cc,
    0x34d2466a,
    0x0115af84,
    0xe1b00428,
    0x95983a1d,
    0x06b89fb4,
    0xce6ea048,
    0x6f3f3b82,
    0x3520ab82,
    0x011a1d4b,
    0x277227f8,
    0x611560b1,
    0xe7933fdc,
    0xbb3a792b,
    0x344525bd,
    0xa08839e1,
    0x51ce794b,
    0x2f32c9b7,
    0xa01fbac9,
    0xe01cc87e,
    0xbcc7d1f6,
    0xcf0111c3,
    0xa1e8aac7,
    0x1a908749,
    0xd44fbd9a,
    0xd0dadecb,
    0xd50ada38,
    0x0339c32a,
    0xc6913667,
    0x8df9317c,
    0xe0b12b4f,
    0xf79e59b7,
    0x43f5bb3a,
    0xf2d519ff,
    0x27d9459c,
    0xbf97222c,
    0x15e6fc2a,
    0x0f91fc71,
    0x9b941525,
    0xfae59361,
    0xceb69ceb,
    0xc2a86459,
    0x12baa8d1,
    0xb6c1075e,
    0xe3056a0c,
    0x10d25065,
    0xcb03a442,
    0xe0ec6e0e,
    0x1698db3b,
    0x4c98a0be,
    0x3278e964,
    0x9f1f9532,
    0xe0d392df,
    0xd3a0342b,
    0x8971f21e,
    0x1b0a7441,
    0x4ba3348c,
    0xc5be7120,
    0xc37632d8,
    0xdf359f8d,
    0x9b992f2e,
    0xe60b6f47,
    0x0fe3f11d,
    0xe54cda54,
    0x1edad891,
    0xce6279cf,
    0xcd3e7e6f,
    0x1618b166,
    0xfd2c1d05,
    0x848fd2c5,
    0xf6fb2299,
    0xf523f357,
    0xa6327623,
    0x93a83531,
    0x56cccd02,
    0xacf08162,
    0x5a75ebb5,
    0x6e163697,
    0x88d273cc,
    0xde966292,
    0x81b949d0,
    0x4c50901b,
    0x71c65614,
    0xe6c6c7bd,
    0x327a140a,
    0x45e1d006,
    0xc3f27b9a,
    0xc9aa53fd,
    0x62a80f00,
    0xbb25bfe2,
    0x35bdd2f6,
    0x71126905,
    0xb2040222,
    0xb6cbcf7c,
    0xcd769c2b,
    0x53113ec0,
    0x1640e3d3,
    0x38abbd60,
    0x2547adf0,
    0xba38209c,
    0xf746ce76,
    0x77afa1c5,
    0x20756060,
    0x85cbfe4e,
    0x8ae88dd8,
    0x7aaaf9b0,
    0x4cf9aa7e,
    0x1948c25c,
    0x02fb8a8c,
    0x01c36ae4,
    0xd6ebe1f9,
    0x90d4f869,
    0xa65cdea0,
    0x3f09252d,
    0xc208e69f,
    0xb74e6132,
    0xce77e25b,
    0x578fdfe3,
    0x3ac372e6
];
/**
 * @type {Array.<number>}
 * @const
 * @inner
 */ var C_ORIG = [
    0x4f727068,
    0x65616e42,
    0x65686f6c,
    0x64657253,
    0x63727944,
    0x6f756274
];
/**
 * @param {Array.<number>} lr
 * @param {number} off
 * @param {Array.<number>} P
 * @param {Array.<number>} S
 * @returns {Array.<number>}
 * @inner
 */ function _encipher(lr, off, P, S) {
    // This is our bottleneck: 1714/1905 ticks / 90% - see profile.txt
    var n, l = lr[off], r = lr[off + 1];
    l ^= P[0];
    /*
    for (var i=0, k=BLOWFISH_NUM_ROUNDS-2; i<=k;)
        // Feistel substitution on left word
        n  = S[l >>> 24],
        n += S[0x100 | ((l >> 16) & 0xff)],
        n ^= S[0x200 | ((l >> 8) & 0xff)],
        n += S[0x300 | (l & 0xff)],
        r ^= n ^ P[++i],
        // Feistel substitution on right word
        n  = S[r >>> 24],
        n += S[0x100 | ((r >> 16) & 0xff)],
        n ^= S[0x200 | ((r >> 8) & 0xff)],
        n += S[0x300 | (r & 0xff)],
        l ^= n ^ P[++i];
    */ //The following is an unrolled version of the above loop.
    //Iteration 0
    n = S[l >>> 24];
    n += S[0x100 | l >> 16 & 0xff];
    n ^= S[0x200 | l >> 8 & 0xff];
    n += S[0x300 | l & 0xff];
    r ^= n ^ P[1];
    n = S[r >>> 24];
    n += S[0x100 | r >> 16 & 0xff];
    n ^= S[0x200 | r >> 8 & 0xff];
    n += S[0x300 | r & 0xff];
    l ^= n ^ P[2];
    //Iteration 1
    n = S[l >>> 24];
    n += S[0x100 | l >> 16 & 0xff];
    n ^= S[0x200 | l >> 8 & 0xff];
    n += S[0x300 | l & 0xff];
    r ^= n ^ P[3];
    n = S[r >>> 24];
    n += S[0x100 | r >> 16 & 0xff];
    n ^= S[0x200 | r >> 8 & 0xff];
    n += S[0x300 | r & 0xff];
    l ^= n ^ P[4];
    //Iteration 2
    n = S[l >>> 24];
    n += S[0x100 | l >> 16 & 0xff];
    n ^= S[0x200 | l >> 8 & 0xff];
    n += S[0x300 | l & 0xff];
    r ^= n ^ P[5];
    n = S[r >>> 24];
    n += S[0x100 | r >> 16 & 0xff];
    n ^= S[0x200 | r >> 8 & 0xff];
    n += S[0x300 | r & 0xff];
    l ^= n ^ P[6];
    //Iteration 3
    n = S[l >>> 24];
    n += S[0x100 | l >> 16 & 0xff];
    n ^= S[0x200 | l >> 8 & 0xff];
    n += S[0x300 | l & 0xff];
    r ^= n ^ P[7];
    n = S[r >>> 24];
    n += S[0x100 | r >> 16 & 0xff];
    n ^= S[0x200 | r >> 8 & 0xff];
    n += S[0x300 | r & 0xff];
    l ^= n ^ P[8];
    //Iteration 4
    n = S[l >>> 24];
    n += S[0x100 | l >> 16 & 0xff];
    n ^= S[0x200 | l >> 8 & 0xff];
    n += S[0x300 | l & 0xff];
    r ^= n ^ P[9];
    n = S[r >>> 24];
    n += S[0x100 | r >> 16 & 0xff];
    n ^= S[0x200 | r >> 8 & 0xff];
    n += S[0x300 | r & 0xff];
    l ^= n ^ P[10];
    //Iteration 5
    n = S[l >>> 24];
    n += S[0x100 | l >> 16 & 0xff];
    n ^= S[0x200 | l >> 8 & 0xff];
    n += S[0x300 | l & 0xff];
    r ^= n ^ P[11];
    n = S[r >>> 24];
    n += S[0x100 | r >> 16 & 0xff];
    n ^= S[0x200 | r >> 8 & 0xff];
    n += S[0x300 | r & 0xff];
    l ^= n ^ P[12];
    //Iteration 6
    n = S[l >>> 24];
    n += S[0x100 | l >> 16 & 0xff];
    n ^= S[0x200 | l >> 8 & 0xff];
    n += S[0x300 | l & 0xff];
    r ^= n ^ P[13];
    n = S[r >>> 24];
    n += S[0x100 | r >> 16 & 0xff];
    n ^= S[0x200 | r >> 8 & 0xff];
    n += S[0x300 | r & 0xff];
    l ^= n ^ P[14];
    //Iteration 7
    n = S[l >>> 24];
    n += S[0x100 | l >> 16 & 0xff];
    n ^= S[0x200 | l >> 8 & 0xff];
    n += S[0x300 | l & 0xff];
    r ^= n ^ P[15];
    n = S[r >>> 24];
    n += S[0x100 | r >> 16 & 0xff];
    n ^= S[0x200 | r >> 8 & 0xff];
    n += S[0x300 | r & 0xff];
    l ^= n ^ P[16];
    lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
    lr[off + 1] = l;
    return lr;
}
/**
 * @param {Array.<number>} data
 * @param {number} offp
 * @returns {{key: number, offp: number}}
 * @inner
 */ function _streamtoword(data, offp) {
    for(var i = 0, word = 0; i < 4; ++i)word = word << 8 | data[offp] & 0xff, offp = (offp + 1) % data.length;
    return {
        key: word,
        offp: offp
    };
}
/**
 * @param {Array.<number>} key
 * @param {Array.<number>} P
 * @param {Array.<number>} S
 * @inner
 */ function _key(key, P, S) {
    var offset = 0, lr = [
        0,
        0
    ], plen = P.length, slen = S.length, sw;
    for(var i = 0; i < plen; i++)sw = _streamtoword(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
    for(i = 0; i < plen; i += 2)lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
    for(i = 0; i < slen; i += 2)lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
/**
 * Expensive key schedule Blowfish.
 * @param {Array.<number>} data
 * @param {Array.<number>} key
 * @param {Array.<number>} P
 * @param {Array.<number>} S
 * @inner
 */ function _ekskey(data, key, P, S) {
    var offp = 0, lr = [
        0,
        0
    ], plen = P.length, slen = S.length, sw;
    for(var i = 0; i < plen; i++)sw = _streamtoword(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
    offp = 0;
    for(i = 0; i < plen; i += 2)sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
    for(i = 0; i < slen; i += 2)sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
/**
 * Internaly crypts a string.
 * @param {Array.<number>} b Bytes to crypt
 * @param {Array.<number>} salt Salt bytes to use
 * @param {number} rounds Number of rounds
 * @param {function(Error, Array.<number>=)=} callback Callback receiving the error, if any, and the resulting bytes. If
 *  omitted, the operation will be performed synchronously.
 *  @param {function(number)=} progressCallback Callback called with the current progress
 * @returns {!Array.<number>|undefined} Resulting bytes if callback has been omitted, otherwise `undefined`
 * @inner
 */ function _crypt(b, salt, rounds, callback, progressCallback) {
    var cdata = C_ORIG.slice(), clen = cdata.length, err;
    // Validate
    if (rounds < 4 || rounds > 31) {
        err = Error("Illegal number of rounds (4-31): " + rounds);
        if (callback) {
            nextTick(callback.bind(this, err));
            return;
        } else throw err;
    }
    if (salt.length !== BCRYPT_SALT_LEN) {
        err = Error("Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN);
        if (callback) {
            nextTick(callback.bind(this, err));
            return;
        } else throw err;
    }
    rounds = 1 << rounds >>> 0;
    var P, S, i = 0, j;
    //Use typed arrays when available - huge speedup!
    if (typeof Int32Array === "function") {
        P = new Int32Array(P_ORIG);
        S = new Int32Array(S_ORIG);
    } else {
        P = P_ORIG.slice();
        S = S_ORIG.slice();
    }
    _ekskey(salt, b, P, S);
    /**
   * Calcualtes the next round.
   * @returns {Array.<number>|undefined} Resulting array if callback has been omitted, otherwise `undefined`
   * @inner
   */ function next() {
        if (progressCallback) progressCallback(i / rounds);
        if (i < rounds) {
            var start = Date.now();
            for(; i < rounds;){
                i = i + 1;
                _key(b, P, S);
                _key(salt, P, S);
                if (Date.now() - start > MAX_EXECUTION_TIME) break;
            }
        } else {
            for(i = 0; i < 64; i++)for(j = 0; j < clen >> 1; j++)_encipher(cdata, j << 1, P, S);
            var ret = [];
            for(i = 0; i < clen; i++)ret.push((cdata[i] >> 24 & 0xff) >>> 0), ret.push((cdata[i] >> 16 & 0xff) >>> 0), ret.push((cdata[i] >> 8 & 0xff) >>> 0), ret.push((cdata[i] & 0xff) >>> 0);
            if (callback) {
                callback(null, ret);
                return;
            } else return ret;
        }
        if (callback) nextTick(next);
    }
    // Async
    if (typeof callback !== "undefined") {
        next();
    // Sync
    } else {
        var res;
        while(true)if (typeof (res = next()) !== "undefined") return res || [];
    }
}
/**
 * Internally hashes a password.
 * @param {string} password Password to hash
 * @param {?string} salt Salt to use, actually never null
 * @param {function(Error, string=)=} callback Callback receiving the error, if any, and the resulting hash. If omitted,
 *  hashing is performed synchronously.
 *  @param {function(number)=} progressCallback Callback called with the current progress
 * @returns {string|undefined} Resulting hash if callback has been omitted, otherwise `undefined`
 * @inner
 */ function _hash(password, salt, callback, progressCallback) {
    var err;
    if (typeof password !== "string" || typeof salt !== "string") {
        err = Error("Invalid string / salt: Not a string");
        if (callback) {
            nextTick(callback.bind(this, err));
            return;
        } else throw err;
    }
    // Validate the salt
    var minor, offset;
    if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
        err = Error("Invalid salt version: " + salt.substring(0, 2));
        if (callback) {
            nextTick(callback.bind(this, err));
            return;
        } else throw err;
    }
    if (salt.charAt(2) === "$") minor = String.fromCharCode(0), offset = 3;
    else {
        minor = salt.charAt(2);
        if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
            err = Error("Invalid salt revision: " + salt.substring(2, 4));
            if (callback) {
                nextTick(callback.bind(this, err));
                return;
            } else throw err;
        }
        offset = 4;
    }
    // Extract number of rounds
    if (salt.charAt(offset + 2) > "$") {
        err = Error("Missing salt rounds");
        if (callback) {
            nextTick(callback.bind(this, err));
            return;
        } else throw err;
    }
    var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
    password += minor >= "a" ? "\x00" : "";
    var passwordb = utf8Array(password), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
    /**
   * Finishes hashing.
   * @param {Array.<number>} bytes Byte array
   * @returns {string}
   * @inner
   */ function finish(bytes) {
        var res = [];
        res.push("$2");
        if (minor >= "a") res.push(minor);
        res.push("$");
        if (rounds < 10) res.push("0");
        res.push(rounds.toString());
        res.push("$");
        res.push(base64_encode(saltb, saltb.length));
        res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
        return res.join("");
    }
    // Sync
    if (typeof callback == "undefined") return finish(_crypt(passwordb, saltb, rounds));
    else {
        _crypt(passwordb, saltb, rounds, function(err, bytes) {
            if (err) callback(err, null);
            else callback(null, finish(bytes));
        }, progressCallback);
    }
}
function encodeBase64(bytes, length) {
    return base64_encode(bytes, length);
}
function decodeBase64(string, length) {
    return base64_decode(string, length);
}
const __TURBOPACK__default__export__ = {
    setRandomFallback,
    genSaltSync,
    genSalt,
    hashSync,
    hash,
    compareSync,
    compare,
    getRounds,
    getSalt,
    truncates,
    encodeBase64,
    decodeBase64
};
}),
"[project]/node_modules/@upstash/core-analytics/dist/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var g = Object.defineProperty;
var k = Object.getOwnPropertyDescriptor;
var _ = Object.getOwnPropertyNames;
var y = Object.prototype.hasOwnProperty;
var w = (l, e)=>{
    for(var t in e)g(l, t, {
        get: e[t],
        enumerable: !0
    });
}, A = (l, e, t, i)=>{
    if (e && typeof e == "object" || typeof e == "function") for (let s of _(e))!y.call(l, s) && s !== t && g(l, s, {
        get: ()=>e[s],
        enumerable: !(i = k(e, s)) || i.enumerable
    });
    return l;
};
var x = (l)=>A(g({}, "__esModule", {
        value: !0
    }), l);
var S = {};
w(S, {
    Analytics: ()=>b
});
module.exports = x(S);
var p = `
local key = KEYS[1]
local field = ARGV[1]

local data = redis.call("ZRANGE", key, 0, -1, "WITHSCORES")
local count = {}

for i = 1, #data, 2 do
  local json_str = data[i]
  local score = tonumber(data[i + 1])
  local obj = cjson.decode(json_str)

  local fieldValue = obj[field]

  if count[fieldValue] == nil then
    count[fieldValue] = score
  else
    count[fieldValue] = count[fieldValue] + score
  end
end

local result = {}
for k, v in pairs(count) do
  table.insert(result, {k, v})
end

return result
`, f = `
local prefix = KEYS[1]
local first_timestamp = tonumber(ARGV[1]) -- First timestamp to check
local increment = tonumber(ARGV[2])       -- Increment between each timestamp
local num_timestamps = tonumber(ARGV[3])  -- Number of timestampts to check (24 for a day and 24 * 7 for a week)
local num_elements = tonumber(ARGV[4])    -- Number of elements to fetch in each category
local check_at_most = tonumber(ARGV[5])   -- Number of elements to check at most.

local keys = {}
for i = 1, num_timestamps do
  local timestamp = first_timestamp - (i - 1) * increment
  table.insert(keys, prefix .. ":" .. timestamp)
end

-- get the union of the groups
local zunion_params = {"ZUNION", num_timestamps, unpack(keys)}
table.insert(zunion_params, "WITHSCORES")
local result = redis.call(unpack(zunion_params))

-- select num_elements many items
local true_group = {}
local false_group = {}
local denied_group = {}
local true_count = 0
local false_count = 0
local denied_count = 0
local i = #result - 1

-- index to stop at after going through "checkAtMost" many items:
local cutoff_index = #result - 2 * check_at_most

-- iterate over the results
while (true_count + false_count + denied_count) < (num_elements * 3) and 1 <= i and i >= cutoff_index do
  local score = tonumber(result[i + 1])
  if score > 0 then
    local element = result[i]
    if string.find(element, "success\\":true") and true_count < num_elements then
      table.insert(true_group, {score, element})
      true_count = true_count + 1
    elseif string.find(element, "success\\":false") and false_count < num_elements then
      table.insert(false_group, {score, element})
      false_count = false_count + 1
    elseif string.find(element, "success\\":\\"denied") and denied_count < num_elements then
      table.insert(denied_group, {score, element})
      denied_count = denied_count + 1
    end
  end
  i = i - 2
end

return {true_group, false_group, denied_group}
`, h = `
local prefix = KEYS[1]
local first_timestamp = tonumber(ARGV[1])
local increment = tonumber(ARGV[2])
local num_timestamps = tonumber(ARGV[3])

local keys = {}
for i = 1, num_timestamps do
  local timestamp = first_timestamp - (i - 1) * increment
  table.insert(keys, prefix .. ":" .. timestamp)
end

-- get the union of the groups
local zunion_params = {"ZUNION", num_timestamps, unpack(keys)}
table.insert(zunion_params, "WITHSCORES")
local result = redis.call(unpack(zunion_params))

return result
`;
var b = class {
    redis;
    prefix;
    bucketSize;
    constructor(e){
        this.redis = e.redis, this.prefix = e.prefix ?? "@upstash/analytics", this.bucketSize = this.parseWindow(e.window);
    }
    validateTableName(e) {
        if (!/^[a-zA-Z0-9_-]+$/.test(e)) throw new Error(`Invalid table name: ${e}. Table names can only contain letters, numbers, dashes and underscores.`);
    }
    parseWindow(e) {
        if (typeof e == "number") {
            if (e <= 0) throw new Error(`Invalid window: ${e}`);
            return e;
        }
        let t = /^(\d+)([smhd])$/;
        if (!t.test(e)) throw new Error(`Invalid window: ${e}`);
        let [, i, s] = e.match(t), n = parseInt(i);
        switch(s){
            case "s":
                return n * 1e3;
            case "m":
                return n * 1e3 * 60;
            case "h":
                return n * 1e3 * 60 * 60;
            case "d":
                return n * 1e3 * 60 * 60 * 24;
            default:
                throw new Error(`Invalid window unit: ${s}`);
        }
    }
    getBucket(e) {
        let t = e ?? Date.now();
        return Math.floor(t / this.bucketSize) * this.bucketSize;
    }
    async ingest(e, ...t) {
        this.validateTableName(e), await Promise.all(t.map(async (i)=>{
            let s = this.getBucket(i.time), n = [
                this.prefix,
                e,
                s
            ].join(":");
            await this.redis.zincrby(n, 1, JSON.stringify({
                ...i,
                time: void 0
            }));
        }));
    }
    formatBucketAggregate(e, t, i) {
        let s = {};
        return e.forEach(([n, r])=>{
            t == "success" && (n = n === 1 ? "true" : n === null ? "false" : n), s[t] = s[t] || {}, s[t][(n ?? "null").toString()] = r;
        }), {
            time: i,
            ...s
        };
    }
    async aggregateBucket(e, t, i) {
        this.validateTableName(e);
        let s = this.getBucket(i), n = [
            this.prefix,
            e,
            s
        ].join(":"), r = await this.redis.eval(p, [
            n
        ], [
            t
        ]);
        return this.formatBucketAggregate(r, t, s);
    }
    async aggregateBuckets(e, t, i, s) {
        this.validateTableName(e);
        let n = this.getBucket(s), r = [];
        for(let o = 0; o < i; o += 1)r.push(this.aggregateBucket(e, t, n)), n = n - this.bucketSize;
        return Promise.all(r);
    }
    async aggregateBucketsWithPipeline(e, t, i, s, n) {
        this.validateTableName(e), n = n ?? 48;
        let r = this.getBucket(s), o = [], c = this.redis.pipeline(), u = [];
        for(let a = 1; a <= i; a += 1){
            let d = [
                this.prefix,
                e,
                r
            ].join(":");
            c.eval(p, [
                d
            ], [
                t
            ]), o.push(r), r = r - this.bucketSize, (a % n == 0 || a == i) && (u.push(c.exec()), c = this.redis.pipeline());
        }
        return (await Promise.all(u)).flat().map((a, d)=>this.formatBucketAggregate(a, t, o[d]));
    }
    async getAllowedBlocked(e, t, i) {
        this.validateTableName(e);
        let s = [
            this.prefix,
            e
        ].join(":"), n = this.getBucket(i), r = await this.redis.eval(h, [
            s
        ], [
            n,
            this.bucketSize,
            t
        ]), o = {};
        for(let c = 0; c < r.length; c += 2){
            let u = r[c], m = u.identifier, a = +r[c + 1];
            o[m] || (o[m] = {
                success: 0,
                blocked: 0
            }), o[m][u.success ? "success" : "blocked"] = a;
        }
        return o;
    }
    async getMostAllowedBlocked(e, t, i, s, n) {
        this.validateTableName(e);
        let r = [
            this.prefix,
            e
        ].join(":"), o = this.getBucket(s), c = n ?? i * 5, [u, m, a] = await this.redis.eval(f, [
            r
        ], [
            o,
            this.bucketSize,
            t,
            i,
            c
        ]);
        return {
            allowed: this.toDicts(u),
            ratelimited: this.toDicts(m),
            denied: this.toDicts(a)
        };
    }
    toDicts(e) {
        let t = [];
        for(let i = 0; i < e.length; i += 1){
            let s = +e[i][0], n = e[i][1];
            t.push({
                identifier: n.identifier,
                count: s
            });
        }
        return t;
    }
};
0 && (module.exports = {
    Analytics
});
}),
"[project]/node_modules/@upstash/ratelimit/dist/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all)=>{
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
var __copyProps = (to, from, except, desc)=>{
    if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
            get: ()=>from[key],
            enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
    }
    return to;
};
var __toCommonJS = (mod)=>__copyProps(__defProp({}, "__esModule", {
        value: true
    }), mod);
// src/index.ts
var src_exports = {};
__export(src_exports, {
    Analytics: ()=>Analytics,
    IpDenyList: ()=>ip_deny_list_exports,
    MultiRegionRatelimit: ()=>MultiRegionRatelimit,
    Ratelimit: ()=>RegionRatelimit
});
module.exports = __toCommonJS(src_exports);
// src/analytics.ts
var import_core_analytics = __turbopack_context__.r("[project]/node_modules/@upstash/core-analytics/dist/index.js [app-route] (ecmascript)");
var Analytics = class {
    analytics;
    table = "events";
    constructor(config){
        this.analytics = new import_core_analytics.Analytics({
            // @ts-expect-error we need to fix the types in core-analytics, it should only require the methods it needs, not the whole sdk
            redis: config.redis,
            window: "1h",
            prefix: config.prefix ?? "@upstash/ratelimit",
            retention: "90d"
        });
    }
    /**
   * Try to extract the geo information from the request
   *
   * This handles Vercel's `req.geo` and  and Cloudflare's `request.cf` properties
   * @param req
   * @returns
   */ extractGeo(req) {
        if (req.geo !== void 0) {
            return req.geo;
        }
        if (req.cf !== void 0) {
            return req.cf;
        }
        return {};
    }
    async record(event) {
        await this.analytics.ingest(this.table, event);
    }
    async series(filter, cutoff) {
        const timestampCount = Math.min((this.analytics.getBucket(Date.now()) - this.analytics.getBucket(cutoff)) / (60 * 60 * 1e3), 256);
        return this.analytics.aggregateBucketsWithPipeline(this.table, filter, timestampCount);
    }
    async getUsage(cutoff = 0) {
        const timestampCount = Math.min((this.analytics.getBucket(Date.now()) - this.analytics.getBucket(cutoff)) / (60 * 60 * 1e3), 256);
        const records = await this.analytics.getAllowedBlocked(this.table, timestampCount);
        return records;
    }
    async getUsageOverTime(timestampCount, groupby) {
        const result = await this.analytics.aggregateBucketsWithPipeline(this.table, groupby, timestampCount);
        return result;
    }
    async getMostAllowedBlocked(timestampCount, getTop, checkAtMost) {
        getTop = getTop ?? 5;
        const timestamp = void 0;
        return this.analytics.getMostAllowedBlocked(this.table, timestampCount, getTop, timestamp, checkAtMost);
    }
};
// src/cache.ts
var Cache = class {
    /**
   * Stores identifier -> reset (in milliseconds)
   */ cache;
    constructor(cache){
        this.cache = cache;
    }
    isBlocked(identifier) {
        if (!this.cache.has(identifier)) {
            return {
                blocked: false,
                reset: 0
            };
        }
        const reset = this.cache.get(identifier);
        if (reset < Date.now()) {
            this.cache.delete(identifier);
            return {
                blocked: false,
                reset: 0
            };
        }
        return {
            blocked: true,
            reset
        };
    }
    blockUntil(identifier, reset) {
        this.cache.set(identifier, reset);
    }
    set(key, value) {
        this.cache.set(key, value);
    }
    get(key) {
        return this.cache.get(key) || null;
    }
    incr(key, incrementAmount = 1) {
        let value = this.cache.get(key) ?? 0;
        value += incrementAmount;
        this.cache.set(key, value);
        return value;
    }
    pop(key) {
        this.cache.delete(key);
    }
    empty() {
        this.cache.clear();
    }
    size() {
        return this.cache.size;
    }
};
// src/constants.ts
var DYNAMIC_LIMIT_KEY_SUFFIX = ":dynamic:global";
var DEFAULT_PREFIX = "@upstash/ratelimit";
// src/duration.ts
function ms(d) {
    const match = d.match(/^(\d+)\s?(ms|s|m|h|d)$/);
    if (!match) {
        throw new Error(`Unable to parse window size: ${d}`);
    }
    const time = Number.parseInt(match[1]);
    const unit = match[2];
    switch(unit){
        case "ms":
            {
                return time;
            }
        case "s":
            {
                return time * 1e3;
            }
        case "m":
            {
                return time * 1e3 * 60;
            }
        case "h":
            {
                return time * 1e3 * 60 * 60;
            }
        case "d":
            {
                return time * 1e3 * 60 * 60 * 24;
            }
        default:
            {
                throw new Error(`Unable to parse window size: ${d}`);
            }
    }
}
// src/hash.ts
var safeEval = async (ctx, script, keys, args)=>{
    try {
        return await ctx.redis.evalsha(script.hash, keys, args);
    } catch (error) {
        if (`${error}`.includes("NOSCRIPT")) {
            return await ctx.redis.eval(script.script, keys, args);
        }
        throw error;
    }
};
// src/lua-scripts/single.ts
var fixedWindowLimitScript = `
  local key           = KEYS[1]
  local dynamicLimitKey = KEYS[2]  -- optional: key for dynamic limit in redis
  local tokens        = tonumber(ARGV[1])  -- default limit
  local window        = ARGV[2]
  local incrementBy   = ARGV[3] -- increment rate per request at a given value, default is 1

  -- Check for dynamic limit
  local effectiveLimit = tokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end

  local r = redis.call("INCRBY", key, incrementBy)
  if r == tonumber(incrementBy) then
  -- The first time this key is set, the value will be equal to incrementBy.
  -- So we only need the expire command once
  redis.call("PEXPIRE", key, window)
  end

  return {r, effectiveLimit}
`;
var fixedWindowRemainingTokensScript = `
  local key = KEYS[1]
  local dynamicLimitKey = KEYS[2]  -- optional: key for dynamic limit in redis
  local tokens = tonumber(ARGV[1])  -- default limit

  -- Check for dynamic limit
  local effectiveLimit = tokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end

  local value = redis.call('GET', key)
  local usedTokens = 0
  if value then
    usedTokens = tonumber(value)
  end
  
  return {effectiveLimit - usedTokens, effectiveLimit}
`;
var slidingWindowLimitScript = `
  local currentKey  = KEYS[1]           -- identifier including prefixes
  local previousKey = KEYS[2]           -- key of the previous bucket
  local dynamicLimitKey = KEYS[3]       -- optional: key for dynamic limit in redis
  local tokens      = tonumber(ARGV[1]) -- default tokens per window
  local now         = ARGV[2]           -- current timestamp in milliseconds
  local window      = ARGV[3]           -- interval in milliseconds
  local incrementBy = tonumber(ARGV[4]) -- increment rate per request at a given value, default is 1

  -- Check for dynamic limit
  local effectiveLimit = tokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end

  local requestsInCurrentWindow = redis.call("GET", currentKey)
  if requestsInCurrentWindow == false then
    requestsInCurrentWindow = 0
  end

  local requestsInPreviousWindow = redis.call("GET", previousKey)
  if requestsInPreviousWindow == false then
    requestsInPreviousWindow = 0
  end
  local percentageInCurrent = ( now % window ) / window
  -- weighted requests to consider from the previous window
  requestsInPreviousWindow = math.floor(( 1 - percentageInCurrent ) * requestsInPreviousWindow)

  -- Only check limit if not refunding (negative rate)
  if incrementBy > 0 and requestsInPreviousWindow + requestsInCurrentWindow >= effectiveLimit then
    return {-1, effectiveLimit}
  end

  local newValue = redis.call("INCRBY", currentKey, incrementBy)
  if newValue == incrementBy then
    -- The first time this key is set, the value will be equal to incrementBy.
    -- So we only need the expire command once
    redis.call("PEXPIRE", currentKey, window * 2 + 1000) -- Enough time to overlap with a new window + 1 second
  end
  return {effectiveLimit - ( newValue + requestsInPreviousWindow ), effectiveLimit}
`;
var slidingWindowRemainingTokensScript = `
  local currentKey  = KEYS[1]           -- identifier including prefixes
  local previousKey = KEYS[2]           -- key of the previous bucket
  local dynamicLimitKey = KEYS[3]       -- optional: key for dynamic limit in redis
  local tokens      = tonumber(ARGV[1]) -- default tokens per window
  local now         = ARGV[2]           -- current timestamp in milliseconds
  local window      = ARGV[3]           -- interval in milliseconds

  -- Check for dynamic limit
  local effectiveLimit = tokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end

  local requestsInCurrentWindow = redis.call("GET", currentKey)
  if requestsInCurrentWindow == false then
    requestsInCurrentWindow = 0
  end

  local requestsInPreviousWindow = redis.call("GET", previousKey)
  if requestsInPreviousWindow == false then
    requestsInPreviousWindow = 0
  end

  local percentageInCurrent = ( now % window ) / window
  -- weighted requests to consider from the previous window
  requestsInPreviousWindow = math.floor(( 1 - percentageInCurrent ) * requestsInPreviousWindow)

  local usedTokens = requestsInPreviousWindow + requestsInCurrentWindow
  return {effectiveLimit - usedTokens, effectiveLimit}
`;
var tokenBucketLimitScript = `
  local key         = KEYS[1]           -- identifier including prefixes
  local dynamicLimitKey = KEYS[2]       -- optional: key for dynamic limit in redis
  local maxTokens   = tonumber(ARGV[1]) -- default maximum number of tokens
  local interval    = tonumber(ARGV[2]) -- size of the window in milliseconds
  local refillRate  = tonumber(ARGV[3]) -- how many tokens are refilled after each interval
  local now         = tonumber(ARGV[4]) -- current timestamp in milliseconds
  local incrementBy = tonumber(ARGV[5]) -- how many tokens to consume, default is 1

  -- Check for dynamic limit
  local effectiveLimit = maxTokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end
        
  local bucket = redis.call("HMGET", key, "refilledAt", "tokens")
        
  local refilledAt
  local tokens

  if bucket[1] == false then
    refilledAt = now
    tokens = effectiveLimit
  else
    refilledAt = tonumber(bucket[1])
    tokens = tonumber(bucket[2])
  end
        
  if now >= refilledAt + interval then
    local numRefills = math.floor((now - refilledAt) / interval)
    tokens = math.min(effectiveLimit, tokens + numRefills * refillRate)

    refilledAt = refilledAt + numRefills * interval
  end

  -- Only reject if tokens are 0 and we're consuming (not refunding)
  if tokens == 0 and incrementBy > 0 then
    return {-1, refilledAt + interval, effectiveLimit}
  end

  local remaining = tokens - incrementBy
  local expireAt = math.ceil(((effectiveLimit - remaining) / refillRate)) * interval
        
  redis.call("HSET", key, "refilledAt", refilledAt, "tokens", remaining)

  if (expireAt > 0) then
    redis.call("PEXPIRE", key, expireAt)
  end
  return {remaining, refilledAt + interval, effectiveLimit}
`;
var tokenBucketIdentifierNotFound = -1;
var tokenBucketRemainingTokensScript = `
  local key         = KEYS[1]
  local dynamicLimitKey = KEYS[2]       -- optional: key for dynamic limit in redis
  local maxTokens   = tonumber(ARGV[1]) -- default maximum number of tokens

  -- Check for dynamic limit
  local effectiveLimit = maxTokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end
        
  local bucket = redis.call("HMGET", key, "refilledAt", "tokens")

  if bucket[1] == false then
    return {effectiveLimit, ${tokenBucketIdentifierNotFound}, effectiveLimit}
  end
        
  return {tonumber(bucket[2]), tonumber(bucket[1]), effectiveLimit}
`;
var cachedFixedWindowLimitScript = `
  local key     = KEYS[1]
  local window  = ARGV[1]
  local incrementBy   = ARGV[2] -- increment rate per request at a given value, default is 1

  local r = redis.call("INCRBY", key, incrementBy)
  if r == incrementBy then
  -- The first time this key is set, the value will be equal to incrementBy.
  -- So we only need the expire command once
  redis.call("PEXPIRE", key, window)
  end
      
  return r
`;
var cachedFixedWindowRemainingTokenScript = `
  local key = KEYS[1]
  local tokens = 0

  local value = redis.call('GET', key)
  if value then
      tokens = value
  end
  return tokens
`;
// src/lua-scripts/multi.ts
var fixedWindowLimitScript2 = `
	local key           = KEYS[1]
	local id            = ARGV[1]
	local window        = ARGV[2]
	local incrementBy   = tonumber(ARGV[3])

	redis.call("HSET", key, id, incrementBy)
	local fields = redis.call("HGETALL", key)
	if #fields == 2 and tonumber(fields[2])==incrementBy then
	-- The first time this key is set, and the value will be equal to incrementBy.
	-- So we only need the expire command once
	  redis.call("PEXPIRE", key, window)
	end

	return fields
`;
var fixedWindowRemainingTokensScript2 = `
      local key = KEYS[1]
      local tokens = 0

      local fields = redis.call("HGETALL", key)

      return fields
    `;
var slidingWindowLimitScript2 = `
	local currentKey    = KEYS[1]           -- identifier including prefixes
	local previousKey   = KEYS[2]           -- key of the previous bucket
	local tokens        = tonumber(ARGV[1]) -- tokens per window
	local now           = ARGV[2]           -- current timestamp in milliseconds
	local window        = ARGV[3]           -- interval in milliseconds
	local requestId     = ARGV[4]           -- uuid for this request
	local incrementBy   = tonumber(ARGV[5]) -- custom rate, default is  1

	local currentFields = redis.call("HGETALL", currentKey)
	local requestsInCurrentWindow = 0
	for i = 2, #currentFields, 2 do
	requestsInCurrentWindow = requestsInCurrentWindow + tonumber(currentFields[i])
	end

	local previousFields = redis.call("HGETALL", previousKey)
	local requestsInPreviousWindow = 0
	for i = 2, #previousFields, 2 do
	requestsInPreviousWindow = requestsInPreviousWindow + tonumber(previousFields[i])
	end

	local percentageInCurrent = ( now % window) / window

	-- Only check limit if not refunding (negative rate)
	if incrementBy > 0 and requestsInPreviousWindow * (1 - percentageInCurrent ) + requestsInCurrentWindow + incrementBy > tokens then
	  return {currentFields, previousFields, false}
	end

	redis.call("HSET", currentKey, requestId, incrementBy)

	if requestsInCurrentWindow == 0 then 
	  -- The first time this key is set, the value will be equal to incrementBy.
	  -- So we only need the expire command once
	  redis.call("PEXPIRE", currentKey, window * 2 + 1000) -- Enough time to overlap with a new window + 1 second
	end
	return {currentFields, previousFields, true}
`;
var slidingWindowRemainingTokensScript2 = `
	local currentKey    = KEYS[1]           -- identifier including prefixes
	local previousKey   = KEYS[2]           -- key of the previous bucket
	local now         	= ARGV[1]           -- current timestamp in milliseconds
  	local window      	= ARGV[2]           -- interval in milliseconds

	local currentFields = redis.call("HGETALL", currentKey)
	local requestsInCurrentWindow = 0
	for i = 2, #currentFields, 2 do
	requestsInCurrentWindow = requestsInCurrentWindow + tonumber(currentFields[i])
	end

	local previousFields = redis.call("HGETALL", previousKey)
	local requestsInPreviousWindow = 0
	for i = 2, #previousFields, 2 do
	requestsInPreviousWindow = requestsInPreviousWindow + tonumber(previousFields[i])
	end

	local percentageInCurrent = ( now % window) / window
  	requestsInPreviousWindow = math.floor(( 1 - percentageInCurrent ) * requestsInPreviousWindow)
	
	return requestsInCurrentWindow + requestsInPreviousWindow
`;
// src/lua-scripts/reset.ts
var resetScript = `
      local pattern = KEYS[1]

      -- Initialize cursor to start from 0
      local cursor = "0"

      repeat
          -- Scan for keys matching the pattern
          local scan_result = redis.call('SCAN', cursor, 'MATCH', pattern)

          -- Extract cursor for the next iteration
          cursor = scan_result[1]

          -- Extract keys from the scan result
          local keys = scan_result[2]

          for i=1, #keys do
          redis.call('DEL', keys[i])
          end

      -- Continue scanning until cursor is 0 (end of keyspace)
      until cursor == "0"
    `;
// src/lua-scripts/hash.ts
var SCRIPTS = {
    singleRegion: {
        fixedWindow: {
            limit: {
                script: fixedWindowLimitScript,
                hash: "472e55443b62f60d0991028456c57815a387066d"
            },
            getRemaining: {
                script: fixedWindowRemainingTokensScript,
                hash: "40515c9dd0a08f8584f5f9b593935f6a87c1c1c3"
            }
        },
        slidingWindow: {
            limit: {
                script: slidingWindowLimitScript,
                hash: "977fb636fb5ceb7e98a96d1b3a1272ba018efdae"
            },
            getRemaining: {
                script: slidingWindowRemainingTokensScript,
                hash: "ee3a3265fad822f83acad23f8a1e2f5c0b156b03"
            }
        },
        tokenBucket: {
            limit: {
                script: tokenBucketLimitScript,
                hash: "b35c5bc0b7fdae7dd0573d4529911cabaf9d1d89"
            },
            getRemaining: {
                script: tokenBucketRemainingTokensScript,
                hash: "deb03663e8af5a968deee895dd081be553d2611b"
            }
        },
        cachedFixedWindow: {
            limit: {
                script: cachedFixedWindowLimitScript,
                hash: "c26b12703dd137939b9a69a3a9b18e906a2d940f"
            },
            getRemaining: {
                script: cachedFixedWindowRemainingTokenScript,
                hash: "8e8f222ccae68b595ee6e3f3bf2199629a62b91a"
            }
        }
    },
    multiRegion: {
        fixedWindow: {
            limit: {
                script: fixedWindowLimitScript2,
                hash: "a8c14f3835aa87bd70e5e2116081b81664abcf5c"
            },
            getRemaining: {
                script: fixedWindowRemainingTokensScript2,
                hash: "8ab8322d0ed5fe5ac8eb08f0c2e4557f1b4816fd"
            }
        },
        slidingWindow: {
            limit: {
                script: slidingWindowLimitScript2,
                hash: "1e7ca8dcd2d600a6d0124a67a57ea225ed62921b"
            },
            getRemaining: {
                script: slidingWindowRemainingTokensScript2,
                hash: "558c9306b7ec54abb50747fe0b17e5d44bd24868"
            }
        }
    }
};
var RESET_SCRIPT = {
    script: resetScript,
    hash: "54bd274ddc59fb3be0f42deee2f64322a10e2b50"
};
// src/types.ts
var DenyListExtension = "denyList";
var IpDenyListKey = "ipDenyList";
var IpDenyListStatusKey = "ipDenyListStatus";
// src/deny-list/scripts.ts
var checkDenyListScript = `
  -- Checks if values provideed in ARGV are present in the deny lists.
  -- This is done using the allDenyListsKey below.

  -- Additionally, checks the status of the ip deny list using the
  -- ipDenyListStatusKey below. Here are the possible states of the
  -- ipDenyListStatusKey key:
  -- * status == -1: set to "disabled" with no TTL
  -- * status == -2: not set, meaning that is was set before but expired
  -- * status  >  0: set to "valid", with a TTL
  --
  -- In the case of status == -2, we set the status to "pending" with
  -- 30 second ttl. During this time, the process which got status == -2
  -- will update the ip deny list.

  local allDenyListsKey     = KEYS[1]
  local ipDenyListStatusKey = KEYS[2]

  local results = redis.call('SMISMEMBER', allDenyListsKey, unpack(ARGV))
  local status  = redis.call('TTL', ipDenyListStatusKey)
  if status == -2 then
    redis.call('SETEX', ipDenyListStatusKey, 30, "pending")
  end

  return { results, status }
`;
// src/deny-list/ip-deny-list.ts
var ip_deny_list_exports = {};
__export(ip_deny_list_exports, {
    ThresholdError: ()=>ThresholdError,
    disableIpDenyList: ()=>disableIpDenyList,
    updateIpDenyList: ()=>updateIpDenyList
});
// src/deny-list/time.ts
var MILLISECONDS_IN_HOUR = 60 * 60 * 1e3;
var MILLISECONDS_IN_DAY = 24 * MILLISECONDS_IN_HOUR;
var MILLISECONDS_TO_2AM = 2 * MILLISECONDS_IN_HOUR;
var getIpListTTL = (time)=>{
    const now = time || Date.now();
    const timeSinceLast2AM = (now - MILLISECONDS_TO_2AM) % MILLISECONDS_IN_DAY;
    return MILLISECONDS_IN_DAY - timeSinceLast2AM;
};
// src/deny-list/ip-deny-list.ts
var baseUrl = "https://raw.githubusercontent.com/stamparm/ipsum/master/levels";
var ThresholdError = class extends Error {
    constructor(threshold){
        super(`Allowed threshold values are from 1 to 8, 1 and 8 included. Received: ${threshold}`);
        this.name = "ThresholdError";
    }
};
var getIpDenyList = async (threshold)=>{
    if (typeof threshold !== "number" || threshold < 1 || threshold > 8) {
        throw new ThresholdError(threshold);
    }
    try {
        const response = await fetch(`${baseUrl}/${threshold}.txt`);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.text();
        const lines = data.split("\n");
        return lines.filter((value)=>value.length > 0);
    } catch (error) {
        throw new Error(`Failed to fetch ip deny list: ${error}`);
    }
};
var updateIpDenyList = async (redis, prefix, threshold, ttl)=>{
    const allIps = await getIpDenyList(threshold);
    const allDenyLists = [
        prefix,
        DenyListExtension,
        "all"
    ].join(":");
    const ipDenyList = [
        prefix,
        DenyListExtension,
        IpDenyListKey
    ].join(":");
    const statusKey = [
        prefix,
        IpDenyListStatusKey
    ].join(":");
    const transaction = redis.multi();
    transaction.sdiffstore(allDenyLists, allDenyLists, ipDenyList);
    transaction.del(ipDenyList);
    transaction.sadd(ipDenyList, allIps.at(0), ...allIps.slice(1));
    transaction.sdiffstore(ipDenyList, ipDenyList, allDenyLists);
    transaction.sunionstore(allDenyLists, allDenyLists, ipDenyList);
    transaction.set(statusKey, "valid", {
        px: ttl ?? getIpListTTL()
    });
    return await transaction.exec();
};
var disableIpDenyList = async (redis, prefix)=>{
    const allDenyListsKey = [
        prefix,
        DenyListExtension,
        "all"
    ].join(":");
    const ipDenyListKey = [
        prefix,
        DenyListExtension,
        IpDenyListKey
    ].join(":");
    const statusKey = [
        prefix,
        IpDenyListStatusKey
    ].join(":");
    const transaction = redis.multi();
    transaction.sdiffstore(allDenyListsKey, allDenyListsKey, ipDenyListKey);
    transaction.del(ipDenyListKey);
    transaction.set(statusKey, "disabled");
    return await transaction.exec();
};
// src/deny-list/deny-list.ts
var denyListCache = new Cache(/* @__PURE__ */ new Map());
var checkDenyListCache = (members)=>{
    return members.find((member)=>denyListCache.isBlocked(member).blocked);
};
var blockMember = (member)=>{
    if (denyListCache.size() > 1e3) denyListCache.empty();
    denyListCache.blockUntil(member, Date.now() + 6e4);
};
var checkDenyList = async (redis, prefix, members)=>{
    const [deniedValues, ipDenyListStatus] = await redis.eval(checkDenyListScript, [
        [
            prefix,
            DenyListExtension,
            "all"
        ].join(":"),
        [
            prefix,
            IpDenyListStatusKey
        ].join(":")
    ], members);
    let deniedValue = void 0;
    deniedValues.map((memberDenied, index)=>{
        if (memberDenied) {
            blockMember(members[index]);
            deniedValue = members[index];
        }
    });
    return {
        deniedValue,
        invalidIpDenyList: ipDenyListStatus === -2
    };
};
var resolveLimitPayload = (redis, prefix, [ratelimitResponse, denyListResponse], threshold)=>{
    if (denyListResponse.deniedValue) {
        ratelimitResponse.success = false;
        ratelimitResponse.remaining = 0;
        ratelimitResponse.reason = "denyList";
        ratelimitResponse.deniedValue = denyListResponse.deniedValue;
    }
    if (denyListResponse.invalidIpDenyList) {
        const updatePromise = updateIpDenyList(redis, prefix, threshold);
        ratelimitResponse.pending = Promise.all([
            ratelimitResponse.pending,
            updatePromise
        ]);
    }
    return ratelimitResponse;
};
var defaultDeniedResponse = (deniedValue)=>{
    return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: 0,
        pending: Promise.resolve(),
        reason: "denyList",
        deniedValue
    };
};
// src/ratelimit.ts
var Ratelimit = class {
    limiter;
    ctx;
    prefix;
    timeout;
    primaryRedis;
    analytics;
    enableProtection;
    denyListThreshold;
    dynamicLimits;
    constructor(config){
        this.ctx = config.ctx;
        this.limiter = config.limiter;
        this.timeout = config.timeout ?? 5e3;
        this.prefix = config.prefix ?? DEFAULT_PREFIX;
        this.dynamicLimits = config.dynamicLimits ?? false;
        this.enableProtection = config.enableProtection ?? false;
        this.denyListThreshold = config.denyListThreshold ?? 6;
        this.primaryRedis = "redis" in this.ctx ? this.ctx.redis : this.ctx.regionContexts[0].redis;
        if ("redis" in this.ctx) {
            this.ctx.dynamicLimits = this.dynamicLimits;
            this.ctx.prefix = this.prefix;
        }
        this.analytics = config.analytics ? new Analytics({
            redis: this.primaryRedis,
            prefix: this.prefix
        }) : void 0;
        if (config.ephemeralCache instanceof Map) {
            this.ctx.cache = new Cache(config.ephemeralCache);
        } else if (config.ephemeralCache === void 0) {
            this.ctx.cache = new Cache(/* @__PURE__ */ new Map());
        }
    }
    /**
   * Determine if a request should pass or be rejected based on the identifier and previously chosen ratelimit.
   *
   * Use this if you want to reject all requests that you can not handle right now.
   *
   * @example
   * ```ts
   *  const ratelimit = new Ratelimit({
   *    redis: Redis.fromEnv(),
   *    limiter: Ratelimit.slidingWindow(10, "10 s")
   *  })
   *
   *  const { success } = await ratelimit.limit(id)
   *  if (!success){
   *    return "Nope"
   *  }
   *  return "Yes"
   * ```
   *
   * @param req.rate - The rate at which tokens will be added or consumed from the token bucket. A higher rate allows for more requests to be processed. Defaults to 1 token per interval if not specified.
   *
   * Usage with `req.rate`
   * @example
   * ```ts
   *  const ratelimit = new Ratelimit({
   *    redis: Redis.fromEnv(),
   *    limiter: Ratelimit.slidingWindow(100, "10 s")
   *  })
   *
   *  const { success } = await ratelimit.limit(id, {rate: 10})
   *  if (!success){
   *    return "Nope"
   *  }
   *  return "Yes"
   * ```
   */ limit = async (identifier, req)=>{
        let timeoutId = null;
        try {
            const response = this.getRatelimitResponse(identifier, req);
            const { responseArray, newTimeoutId } = this.applyTimeout(response);
            timeoutId = newTimeoutId;
            const timedResponse = await Promise.race(responseArray);
            const finalResponse = this.submitAnalytics(timedResponse, identifier, req);
            return finalResponse;
        } finally{
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }
    };
    /**
   * Block until the request may pass or timeout is reached.
   *
   * This method returns a promise that resolves as soon as the request may be processed
   * or after the timeout has been reached.
   *
   * Use this if you want to delay the request until it is ready to get processed.
   *
   * @example
   * ```ts
   *  const ratelimit = new Ratelimit({
   *    redis: Redis.fromEnv(),
   *    limiter: Ratelimit.slidingWindow(10, "10 s")
   *  })
   *
   *  const { success } = await ratelimit.blockUntilReady(id, 60_000)
   *  if (!success){
   *    return "Nope"
   *  }
   *  return "Yes"
   * ```
   */ blockUntilReady = async (identifier, timeout)=>{
        if (timeout <= 0) {
            throw new Error("timeout must be positive");
        }
        let res;
        const deadline = Date.now() + timeout;
        while(true){
            res = await this.limit(identifier);
            if (res.success) {
                break;
            }
            if (res.reset === 0) {
                throw new Error("This should not happen");
            }
            const wait = Math.min(res.reset, deadline) - Date.now();
            await new Promise((r)=>setTimeout(r, wait));
            if (Date.now() > deadline) {
                break;
            }
        }
        return res;
    };
    resetUsedTokens = async (identifier)=>{
        const pattern = [
            this.prefix,
            identifier
        ].join(":");
        await this.limiter().resetTokens(this.ctx, pattern);
    };
    /**
   * Returns the remaining token count together with a reset timestamps
   * 
   * @param identifier identifir to check
   * @returns object with `remaining`, `reset`, and `limit` fields. `remaining` denotes
   *          the remaining tokens, `limit` is the effective limit (considering dynamic
   *          limits if enabled), and `reset` denotes the timestamp when the tokens reset.
   */ getRemaining = async (identifier)=>{
        const pattern = [
            this.prefix,
            identifier
        ].join(":");
        return await this.limiter().getRemaining(this.ctx, pattern);
    };
    /**
   * Checks if the identifier or the values in req are in the deny list cache.
   * If so, returns the default denied response.
   * 
   * Otherwise, calls redis to check the rate limit and deny list. Returns after
   * resolving the result. Resolving is overriding the rate limit result if
   * the some value is in deny list.
   * 
   * @param identifier identifier to block
   * @param req options with ip, user agent, country, rate and geo info
   * @returns rate limit response
   */ getRatelimitResponse = async (identifier, req)=>{
        const key = this.getKey(identifier);
        const definedMembers = this.getDefinedMembers(identifier, req);
        const deniedValue = checkDenyListCache(definedMembers);
        const result = deniedValue ? [
            defaultDeniedResponse(deniedValue),
            {
                deniedValue,
                invalidIpDenyList: false
            }
        ] : await Promise.all([
            this.limiter().limit(this.ctx, key, req?.rate),
            this.enableProtection ? checkDenyList(this.primaryRedis, this.prefix, definedMembers) : {
                deniedValue: void 0,
                invalidIpDenyList: false
            }
        ]);
        return resolveLimitPayload(this.primaryRedis, this.prefix, result, this.denyListThreshold);
    };
    /**
   * Creates an array with the original response promise and a timeout promise
   * if this.timeout > 0.
   * 
   * @param response Ratelimit response promise
   * @returns array with the response and timeout promise. also includes the timeout id
   */ applyTimeout = (response)=>{
        let newTimeoutId = null;
        const responseArray = [
            response
        ];
        if (this.timeout > 0) {
            const timeoutResponse = new Promise((resolve)=>{
                newTimeoutId = setTimeout(()=>{
                    resolve({
                        success: true,
                        limit: 0,
                        remaining: 0,
                        reset: 0,
                        pending: Promise.resolve(),
                        reason: "timeout"
                    });
                }, this.timeout);
            });
            responseArray.push(timeoutResponse);
        }
        return {
            responseArray,
            newTimeoutId
        };
    };
    /**
   * submits analytics if this.analytics is set
   * 
   * @param ratelimitResponse final rate limit response
   * @param identifier identifier to submit
   * @param req limit options
   * @returns rate limit response after updating the .pending field
   */ submitAnalytics = (ratelimitResponse, identifier, req)=>{
        if (this.analytics) {
            try {
                const geo = req ? this.analytics.extractGeo(req) : void 0;
                const analyticsP = this.analytics.record({
                    identifier: ratelimitResponse.reason === "denyList" ? ratelimitResponse.deniedValue : identifier,
                    time: Date.now(),
                    success: ratelimitResponse.reason === "denyList" ? "denied" : ratelimitResponse.success,
                    ...geo
                }).catch((error)=>{
                    let errorMessage = "Failed to record analytics";
                    if (`${error}`.includes("WRONGTYPE")) {
                        errorMessage = `
    Failed to record analytics. See the information below:

    This can occur when you uprade to Ratelimit version 1.1.2
    or later from an earlier version.

    This occurs simply because the way we store analytics data
    has changed. To avoid getting this error, disable analytics
    for *an hour*, then simply enable it back.

    `;
                    }
                    console.warn(errorMessage, error);
                });
                ratelimitResponse.pending = Promise.all([
                    ratelimitResponse.pending,
                    analyticsP
                ]);
            } catch (error) {
                console.warn("Failed to record analytics", error);
            }
            ;
        }
        ;
        return ratelimitResponse;
    };
    getKey = (identifier)=>{
        return [
            this.prefix,
            identifier
        ].join(":");
    };
    /**
   * returns a list of defined values from
   * [identifier, req.ip, req.userAgent, req.country]
   * 
   * @param identifier identifier
   * @param req limit options
   * @returns list of defined values
   */ getDefinedMembers = (identifier, req)=>{
        const members = [
            identifier,
            req?.ip,
            req?.userAgent,
            req?.country
        ];
        return members.filter(Boolean);
    };
    /**
   * Set a dynamic rate limit globally.
   * 
   * When dynamicLimits is enabled, this limit will override the default limit
   * set in the constructor for all requests.
   * 
   * @example
   * ```ts
   * const ratelimit = new Ratelimit({
   *   redis: Redis.fromEnv(),
   *   limiter: Ratelimit.slidingWindow(10, "10 s"),
   *   dynamicLimits: true
   * });
   * 
   * // Set global dynamic limit to 120 requests
   * await ratelimit.setDynamicLimit({ limit: 120 });
   * 
   * // Disable dynamic limit (falls back to default)
   * await ratelimit.setDynamicLimit({ limit: false });
   * ```
   * 
   * @param options.limit - The new rate limit to apply globally, or false to disable
   */ setDynamicLimit = async (options)=>{
        if (!this.dynamicLimits) {
            throw new Error("dynamicLimits must be enabled in the Ratelimit constructor to use setDynamicLimit()");
        }
        const globalKey = `${this.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}`;
        await (options.limit === false ? this.primaryRedis.del(globalKey) : this.primaryRedis.set(globalKey, options.limit));
    };
    /**
   * Get the current global dynamic rate limit.
   * 
   * @example
   * ```ts
   * const { dynamicLimit } = await ratelimit.getDynamicLimit();
   * console.log(dynamicLimit); // 120 or null if not set
   * ```
   * 
   * @returns Object containing the current global dynamic limit, or null if not set
   */ getDynamicLimit = async ()=>{
        if (!this.dynamicLimits) {
            throw new Error("dynamicLimits must be enabled in the Ratelimit constructor to use getDynamicLimit()");
        }
        const globalKey = `${this.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}`;
        const result = await this.primaryRedis.get(globalKey);
        return {
            dynamicLimit: result === null ? null : Number(result)
        };
    };
};
// src/multi.ts
function randomId() {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for(let i = 0; i < 16; i++){
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
var MultiRegionRatelimit = class extends Ratelimit {
    /**
   * Create a new Ratelimit instance by providing a `@upstash/redis` instance and the algorithn of your choice.
   */ constructor(config){
        super({
            prefix: config.prefix,
            limiter: config.limiter,
            timeout: config.timeout,
            analytics: config.analytics,
            dynamicLimits: config.dynamicLimits,
            ctx: {
                regionContexts: config.redis.map((redis)=>({
                        redis,
                        prefix: config.prefix ?? DEFAULT_PREFIX
                    })),
                cache: config.ephemeralCache ? new Cache(config.ephemeralCache) : void 0
            }
        });
        if (config.dynamicLimits) {
            console.warn("Warning: Dynamic limits are not yet supported for multi-region rate limiters. The dynamicLimits option will be ignored.");
        }
    }
    /**
   * Each request inside a fixed time increases a counter.
   * Once the counter reaches the maximum allowed number, all further requests are
   * rejected.
   *
   * **Pro:**
   *
   * - Newer requests are not starved by old ones.
   * - Low storage cost.
   *
   * **Con:**
   *
   * A burst of requests near the boundary of a window can result in a very
   * high request rate because two windows will be filled with requests quickly.
   *
   * @param tokens - How many requests a user can make in each time window.
   * @param window - A fixed timeframe
   */ static fixedWindow(tokens, window) {
        const windowDuration = ms(window);
        return ()=>({
                async limit (ctx, identifier, rate) {
                    const requestId = randomId();
                    const bucket = Math.floor(Date.now() / windowDuration);
                    const key = [
                        identifier,
                        bucket
                    ].join(":");
                    const incrementBy = rate ?? 1;
                    if (ctx.cache && incrementBy > 0) {
                        const { blocked, reset: reset2 } = ctx.cache.isBlocked(identifier);
                        if (blocked) {
                            return {
                                success: false,
                                limit: tokens,
                                remaining: 0,
                                reset: reset2,
                                pending: Promise.resolve(),
                                reason: "cacheBlock"
                            };
                        }
                    }
                    const dbs = ctx.regionContexts.map((regionContext)=>({
                            redis: regionContext.redis,
                            request: safeEval(regionContext, SCRIPTS.multiRegion.fixedWindow.limit, [
                                key
                            ], [
                                requestId,
                                windowDuration,
                                incrementBy
                            ])
                        }));
                    const firstResponse = await Promise.any(dbs.map((s)=>s.request));
                    const usedTokens = firstResponse.reduce((accTokens, usedToken, index)=>{
                        let parsedToken = 0;
                        if (index % 2) {
                            parsedToken = Number.parseInt(usedToken);
                        }
                        return accTokens + parsedToken;
                    }, 0);
                    const remaining = tokens - usedTokens;
                    async function sync() {
                        const individualIDs = await Promise.all(dbs.map((s)=>s.request));
                        const allIDs = [
                            ...new Set(individualIDs.flat().reduce((acc, curr, index)=>{
                                if (index % 2 === 0) {
                                    acc.push(curr);
                                }
                                return acc;
                            }, [])).values()
                        ];
                        for (const db of dbs){
                            const usedDbTokensRequest = await db.request;
                            const usedDbTokens = usedDbTokensRequest.reduce((accTokens, usedToken, index)=>{
                                let parsedToken = 0;
                                if (index % 2) {
                                    parsedToken = Number.parseInt(usedToken);
                                }
                                return accTokens + parsedToken;
                            }, 0);
                            const dbIdsRequest = await db.request;
                            const dbIds = dbIdsRequest.reduce((ids, currentId, index)=>{
                                if (index % 2 === 0) {
                                    ids.push(currentId);
                                }
                                return ids;
                            }, []);
                            if (usedDbTokens >= tokens) {
                                continue;
                            }
                            const diff = allIDs.filter((id)=>!dbIds.includes(id));
                            if (diff.length === 0) {
                                continue;
                            }
                            for (const requestId2 of diff){
                                await db.redis.hset(key, {
                                    [requestId2]: incrementBy
                                });
                            }
                        }
                    }
                    const success = remaining >= 0;
                    const reset = (bucket + 1) * windowDuration;
                    if (ctx.cache) {
                        if (!success) {
                            ctx.cache.blockUntil(identifier, reset);
                        } else if (incrementBy < 0) {
                            ctx.cache.pop(identifier);
                        }
                    }
                    return {
                        success,
                        limit: tokens,
                        remaining,
                        reset,
                        pending: sync()
                    };
                },
                async getRemaining (ctx, identifier) {
                    const bucket = Math.floor(Date.now() / windowDuration);
                    const key = [
                        identifier,
                        bucket
                    ].join(":");
                    const dbs = ctx.regionContexts.map((regionContext)=>({
                            redis: regionContext.redis,
                            request: safeEval(regionContext, SCRIPTS.multiRegion.fixedWindow.getRemaining, [
                                key
                            ], [
                                null
                            ])
                        }));
                    const firstResponse = await Promise.any(dbs.map((s)=>s.request));
                    const usedTokens = firstResponse.reduce((accTokens, usedToken, index)=>{
                        let parsedToken = 0;
                        if (index % 2) {
                            parsedToken = Number.parseInt(usedToken);
                        }
                        return accTokens + parsedToken;
                    }, 0);
                    return {
                        remaining: Math.max(0, tokens - usedTokens),
                        reset: (bucket + 1) * windowDuration,
                        limit: tokens
                    };
                },
                async resetTokens (ctx, identifier) {
                    const pattern = [
                        identifier,
                        "*"
                    ].join(":");
                    if (ctx.cache) {
                        ctx.cache.pop(identifier);
                    }
                    await Promise.all(ctx.regionContexts.map((regionContext)=>{
                        safeEval(regionContext, RESET_SCRIPT, [
                            pattern
                        ], [
                            null
                        ]);
                    }));
                }
            });
    }
    /**
   * Combined approach of `slidingLogs` and `fixedWindow` with lower storage
   * costs than `slidingLogs` and improved boundary behavior by calculating a
   * weighted score between two windows.
   *
   * **Pro:**
   *
   * Good performance allows this to scale to very high loads.
   *
   * **Con:**
   *
   * Nothing major.
   *
   * @param tokens - How many requests a user can make in each time window.
   * @param window - The duration in which the user can max X requests.
   */ static slidingWindow(tokens, window) {
        const windowSize = ms(window);
        const windowDuration = ms(window);
        return ()=>({
                async limit (ctx, identifier, rate) {
                    const requestId = randomId();
                    const now = Date.now();
                    const currentWindow = Math.floor(now / windowSize);
                    const currentKey = [
                        identifier,
                        currentWindow
                    ].join(":");
                    const previousWindow = currentWindow - 1;
                    const previousKey = [
                        identifier,
                        previousWindow
                    ].join(":");
                    const incrementBy = rate ?? 1;
                    if (ctx.cache && incrementBy > 0) {
                        const { blocked, reset: reset2 } = ctx.cache.isBlocked(identifier);
                        if (blocked) {
                            return {
                                success: false,
                                limit: tokens,
                                remaining: 0,
                                reset: reset2,
                                pending: Promise.resolve(),
                                reason: "cacheBlock"
                            };
                        }
                    }
                    const dbs = ctx.regionContexts.map((regionContext)=>({
                            redis: regionContext.redis,
                            request: safeEval(regionContext, SCRIPTS.multiRegion.slidingWindow.limit, [
                                currentKey,
                                previousKey
                            ], [
                                tokens,
                                now,
                                windowDuration,
                                requestId,
                                incrementBy
                            ])
                        }));
                    const percentageInCurrent = now % windowDuration / windowDuration;
                    const [current, previous, success] = await Promise.any(dbs.map((s)=>s.request));
                    if (success) {
                        current.push(requestId, incrementBy.toString());
                    }
                    const previousUsedTokens = previous.reduce((accTokens, usedToken, index)=>{
                        let parsedToken = 0;
                        if (index % 2) {
                            parsedToken = Number.parseInt(usedToken);
                        }
                        return accTokens + parsedToken;
                    }, 0);
                    const currentUsedTokens = current.reduce((accTokens, usedToken, index)=>{
                        let parsedToken = 0;
                        if (index % 2) {
                            parsedToken = Number.parseInt(usedToken);
                        }
                        return accTokens + parsedToken;
                    }, 0);
                    const previousPartialUsed = Math.ceil(previousUsedTokens * (1 - percentageInCurrent));
                    const usedTokens = previousPartialUsed + currentUsedTokens;
                    const remaining = tokens - usedTokens;
                    async function sync() {
                        const res = await Promise.all(dbs.map((s)=>s.request));
                        const allCurrentIds = [
                            ...new Set(res.flatMap(([current2])=>current2).reduce((acc, curr, index)=>{
                                if (index % 2 === 0) {
                                    acc.push(curr);
                                }
                                return acc;
                            }, [])).values()
                        ];
                        for (const db of dbs){
                            const [current2, _previous, _success] = await db.request;
                            const dbIds = current2.reduce((ids, currentId, index)=>{
                                if (index % 2 === 0) {
                                    ids.push(currentId);
                                }
                                return ids;
                            }, []);
                            const usedDbTokens = current2.reduce((accTokens, usedToken, index)=>{
                                let parsedToken = 0;
                                if (index % 2) {
                                    parsedToken = Number.parseInt(usedToken);
                                }
                                return accTokens + parsedToken;
                            }, 0);
                            if (usedDbTokens >= tokens) {
                                continue;
                            }
                            const diff = allCurrentIds.filter((id)=>!dbIds.includes(id));
                            if (diff.length === 0) {
                                continue;
                            }
                            for (const requestId2 of diff){
                                await db.redis.hset(currentKey, {
                                    [requestId2]: incrementBy
                                });
                            }
                        }
                    }
                    const reset = (currentWindow + 1) * windowDuration;
                    if (ctx.cache) {
                        if (!success) {
                            ctx.cache.blockUntil(identifier, reset);
                        } else if (incrementBy < 0) {
                            ctx.cache.pop(identifier);
                        }
                    }
                    return {
                        success: Boolean(success),
                        limit: tokens,
                        remaining: Math.max(0, remaining),
                        reset,
                        pending: sync()
                    };
                },
                async getRemaining (ctx, identifier) {
                    const now = Date.now();
                    const currentWindow = Math.floor(now / windowSize);
                    const currentKey = [
                        identifier,
                        currentWindow
                    ].join(":");
                    const previousWindow = currentWindow - 1;
                    const previousKey = [
                        identifier,
                        previousWindow
                    ].join(":");
                    const dbs = ctx.regionContexts.map((regionContext)=>({
                            redis: regionContext.redis,
                            request: safeEval(regionContext, SCRIPTS.multiRegion.slidingWindow.getRemaining, [
                                currentKey,
                                previousKey
                            ], [
                                now,
                                windowSize
                            ])
                        }));
                    const usedTokens = await Promise.any(dbs.map((s)=>s.request));
                    return {
                        remaining: Math.max(0, tokens - usedTokens),
                        reset: (currentWindow + 1) * windowSize,
                        limit: tokens
                    };
                },
                async resetTokens (ctx, identifier) {
                    const pattern = [
                        identifier,
                        "*"
                    ].join(":");
                    if (ctx.cache) {
                        ctx.cache.pop(identifier);
                    }
                    await Promise.all(ctx.regionContexts.map((regionContext)=>{
                        safeEval(regionContext, RESET_SCRIPT, [
                            pattern
                        ], [
                            null
                        ]);
                    }));
                }
            });
    }
};
// src/single.ts
var RegionRatelimit = class extends Ratelimit {
    /**
   * Create a new Ratelimit instance by providing a `@upstash/redis` instance and the algorithm of your choice.
   */ constructor(config){
        super({
            prefix: config.prefix,
            limiter: config.limiter,
            timeout: config.timeout,
            analytics: config.analytics,
            ctx: {
                redis: config.redis,
                prefix: config.prefix ?? DEFAULT_PREFIX
            },
            ephemeralCache: config.ephemeralCache,
            enableProtection: config.enableProtection,
            denyListThreshold: config.denyListThreshold,
            dynamicLimits: config.dynamicLimits
        });
    }
    /**
   * Each request inside a fixed time increases a counter.
   * Once the counter reaches the maximum allowed number, all further requests are
   * rejected.
   *
   * **Pro:**
   *
   * - Newer requests are not starved by old ones.
   * - Low storage cost.
   *
   * **Con:**
   *
   * A burst of requests near the boundary of a window can result in a very
   * high request rate because two windows will be filled with requests quickly.
   *
   * @param tokens - How many requests a user can make in each time window.
   * @param window - A fixed timeframe
   */ static fixedWindow(tokens, window) {
        const windowDuration = ms(window);
        return ()=>({
                async limit (ctx, identifier, rate) {
                    const bucket = Math.floor(Date.now() / windowDuration);
                    const key = [
                        identifier,
                        bucket
                    ].join(":");
                    const incrementBy = rate ?? 1;
                    if (ctx.cache && incrementBy > 0) {
                        const { blocked, reset: reset2 } = ctx.cache.isBlocked(identifier);
                        if (blocked) {
                            return {
                                success: false,
                                limit: tokens,
                                remaining: 0,
                                reset: reset2,
                                pending: Promise.resolve(),
                                reason: "cacheBlock"
                            };
                        }
                    }
                    const dynamicLimitKey = ctx.dynamicLimits ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}` : "";
                    const [usedTokensAfterUpdate, effectiveLimit] = await safeEval(ctx, SCRIPTS.singleRegion.fixedWindow.limit, [
                        key,
                        dynamicLimitKey
                    ], [
                        tokens,
                        windowDuration,
                        incrementBy
                    ]);
                    const success = usedTokensAfterUpdate <= effectiveLimit;
                    const remainingTokens = Math.max(0, effectiveLimit - usedTokensAfterUpdate);
                    const reset = (bucket + 1) * windowDuration;
                    if (ctx.cache) {
                        if (!success) {
                            ctx.cache.blockUntil(identifier, reset);
                        } else if (incrementBy < 0) {
                            ctx.cache.pop(identifier);
                        }
                    }
                    return {
                        success,
                        limit: effectiveLimit,
                        remaining: remainingTokens,
                        reset,
                        pending: Promise.resolve()
                    };
                },
                async getRemaining (ctx, identifier) {
                    const bucket = Math.floor(Date.now() / windowDuration);
                    const key = [
                        identifier,
                        bucket
                    ].join(":");
                    const dynamicLimitKey = ctx.dynamicLimits ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}` : "";
                    const [remaining, effectiveLimit] = await safeEval(ctx, SCRIPTS.singleRegion.fixedWindow.getRemaining, [
                        key,
                        dynamicLimitKey
                    ], [
                        tokens
                    ]);
                    return {
                        remaining: Math.max(0, remaining),
                        reset: (bucket + 1) * windowDuration,
                        limit: effectiveLimit
                    };
                },
                async resetTokens (ctx, identifier) {
                    const pattern = [
                        identifier,
                        "*"
                    ].join(":");
                    if (ctx.cache) {
                        ctx.cache.pop(identifier);
                    }
                    await safeEval(ctx, RESET_SCRIPT, [
                        pattern
                    ], [
                        null
                    ]);
                }
            });
    }
    /**
   * Combined approach of `slidingLogs` and `fixedWindow` with lower storage
   * costs than `slidingLogs` and improved boundary behavior by calculating a
   * weighted score between two windows.
   *
   * **Pro:**
   *
   * Good performance allows this to scale to very high loads.
   *
   * **Con:**
   *
   * Nothing major.
   *
   * @param tokens - How many requests a user can make in each time window.
   * @param window - The duration in which the user can max X requests.
   */ static slidingWindow(tokens, window) {
        const windowSize = ms(window);
        return ()=>({
                async limit (ctx, identifier, rate) {
                    const now = Date.now();
                    const currentWindow = Math.floor(now / windowSize);
                    const currentKey = [
                        identifier,
                        currentWindow
                    ].join(":");
                    const previousWindow = currentWindow - 1;
                    const previousKey = [
                        identifier,
                        previousWindow
                    ].join(":");
                    const incrementBy = rate ?? 1;
                    if (ctx.cache && incrementBy > 0) {
                        const { blocked, reset: reset2 } = ctx.cache.isBlocked(identifier);
                        if (blocked) {
                            return {
                                success: false,
                                limit: tokens,
                                remaining: 0,
                                reset: reset2,
                                pending: Promise.resolve(),
                                reason: "cacheBlock"
                            };
                        }
                    }
                    const dynamicLimitKey = ctx.dynamicLimits ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}` : "";
                    const [remainingTokens, effectiveLimit] = await safeEval(ctx, SCRIPTS.singleRegion.slidingWindow.limit, [
                        currentKey,
                        previousKey,
                        dynamicLimitKey
                    ], [
                        tokens,
                        now,
                        windowSize,
                        incrementBy
                    ]);
                    const success = remainingTokens >= 0;
                    const reset = (currentWindow + 1) * windowSize;
                    if (ctx.cache) {
                        if (!success) {
                            ctx.cache.blockUntil(identifier, reset);
                        } else if (incrementBy < 0) {
                            ctx.cache.pop(identifier);
                        }
                    }
                    return {
                        success,
                        limit: effectiveLimit,
                        remaining: Math.max(0, remainingTokens),
                        reset,
                        pending: Promise.resolve()
                    };
                },
                async getRemaining (ctx, identifier) {
                    const now = Date.now();
                    const currentWindow = Math.floor(now / windowSize);
                    const currentKey = [
                        identifier,
                        currentWindow
                    ].join(":");
                    const previousWindow = currentWindow - 1;
                    const previousKey = [
                        identifier,
                        previousWindow
                    ].join(":");
                    const dynamicLimitKey = ctx.dynamicLimits ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}` : "";
                    const [remaining, effectiveLimit] = await safeEval(ctx, SCRIPTS.singleRegion.slidingWindow.getRemaining, [
                        currentKey,
                        previousKey,
                        dynamicLimitKey
                    ], [
                        tokens,
                        now,
                        windowSize
                    ]);
                    return {
                        remaining: Math.max(0, remaining),
                        reset: (currentWindow + 1) * windowSize,
                        limit: effectiveLimit
                    };
                },
                async resetTokens (ctx, identifier) {
                    const pattern = [
                        identifier,
                        "*"
                    ].join(":");
                    if (ctx.cache) {
                        ctx.cache.pop(identifier);
                    }
                    await safeEval(ctx, RESET_SCRIPT, [
                        pattern
                    ], [
                        null
                    ]);
                }
            });
    }
    /**
   * You have a bucket filled with `{maxTokens}` tokens that refills constantly
   * at `{refillRate}` per `{interval}`.
   * Every request will remove one token from the bucket and if there is no
   * token to take, the request is rejected.
   *
   * **Pro:**
   *
   * - Bursts of requests are smoothed out and you can process them at a constant
   * rate.
   * - Allows to set a higher initial burst limit by setting `maxTokens` higher
   * than `refillRate`
   */ static tokenBucket(refillRate, interval, maxTokens) {
        const intervalDuration = ms(interval);
        return ()=>({
                async limit (ctx, identifier, rate) {
                    const now = Date.now();
                    const incrementBy = rate ?? 1;
                    if (ctx.cache && incrementBy > 0) {
                        const { blocked, reset: reset2 } = ctx.cache.isBlocked(identifier);
                        if (blocked) {
                            return {
                                success: false,
                                limit: maxTokens,
                                remaining: 0,
                                reset: reset2,
                                pending: Promise.resolve(),
                                reason: "cacheBlock"
                            };
                        }
                    }
                    const dynamicLimitKey = ctx.dynamicLimits ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}` : "";
                    const [remaining, reset, effectiveLimit] = await safeEval(ctx, SCRIPTS.singleRegion.tokenBucket.limit, [
                        identifier,
                        dynamicLimitKey
                    ], [
                        maxTokens,
                        intervalDuration,
                        refillRate,
                        now,
                        incrementBy
                    ]);
                    const success = remaining >= 0;
                    if (ctx.cache) {
                        if (!success) {
                            ctx.cache.blockUntil(identifier, reset);
                        } else if (incrementBy < 0) {
                            ctx.cache.pop(identifier);
                        }
                    }
                    return {
                        success,
                        limit: effectiveLimit,
                        remaining: Math.max(0, remaining),
                        reset,
                        pending: Promise.resolve()
                    };
                },
                async getRemaining (ctx, identifier) {
                    const dynamicLimitKey = ctx.dynamicLimits ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}` : "";
                    const [remainingTokens, refilledAt, effectiveLimit] = await safeEval(ctx, SCRIPTS.singleRegion.tokenBucket.getRemaining, [
                        identifier,
                        dynamicLimitKey
                    ], [
                        maxTokens
                    ]);
                    const freshRefillAt = Date.now() + intervalDuration;
                    const identifierRefillsAt = refilledAt + intervalDuration;
                    return {
                        remaining: Math.max(0, remainingTokens),
                        reset: refilledAt === tokenBucketIdentifierNotFound ? freshRefillAt : identifierRefillsAt,
                        limit: effectiveLimit
                    };
                },
                async resetTokens (ctx, identifier) {
                    const pattern = identifier;
                    if (ctx.cache) {
                        ctx.cache.pop(identifier);
                    }
                    await safeEval(ctx, RESET_SCRIPT, [
                        pattern
                    ], [
                        null
                    ]);
                }
            });
    }
    /**
   * cachedFixedWindow first uses the local cache to decide if a request may pass and then updates
   * it asynchronously.
   * This is experimental and not yet recommended for production use.
   *
   * @experimental
   *
   * Each request inside a fixed time increases a counter.
   * Once the counter reaches the maximum allowed number, all further requests are
   * rejected.
   *
   * **Pro:**
   *
   * - Newer requests are not starved by old ones.
   * - Low storage cost.
   *
   * **Con:**
   *
   * A burst of requests near the boundary of a window can result in a very
   * high request rate because two windows will be filled with requests quickly.
   *
   * @param tokens - How many requests a user can make in each time window.
   * @param window - A fixed timeframe
   */ static cachedFixedWindow(tokens, window) {
        const windowDuration = ms(window);
        return ()=>({
                async limit (ctx, identifier, rate) {
                    if (!ctx.cache) {
                        throw new Error("This algorithm requires a cache");
                    }
                    if (ctx.dynamicLimits) {
                        console.warn("Warning: Dynamic limits are not yet supported for cachedFixedWindow algorithm. The dynamicLimits option will be ignored.");
                    }
                    const bucket = Math.floor(Date.now() / windowDuration);
                    const key = [
                        identifier,
                        bucket
                    ].join(":");
                    const reset = (bucket + 1) * windowDuration;
                    const incrementBy = rate ?? 1;
                    const hit = typeof ctx.cache.get(key) === "number";
                    if (hit) {
                        const cachedTokensAfterUpdate = ctx.cache.incr(key, incrementBy);
                        const success = cachedTokensAfterUpdate < tokens;
                        const pending = success ? safeEval(ctx, SCRIPTS.singleRegion.cachedFixedWindow.limit, [
                            key
                        ], [
                            windowDuration,
                            incrementBy
                        ]) : Promise.resolve();
                        return {
                            success,
                            limit: tokens,
                            remaining: tokens - cachedTokensAfterUpdate,
                            reset,
                            pending
                        };
                    }
                    const usedTokensAfterUpdate = await safeEval(ctx, SCRIPTS.singleRegion.cachedFixedWindow.limit, [
                        key
                    ], [
                        windowDuration,
                        incrementBy
                    ]);
                    ctx.cache.set(key, usedTokensAfterUpdate);
                    const remaining = tokens - usedTokensAfterUpdate;
                    return {
                        success: remaining >= 0,
                        limit: tokens,
                        remaining,
                        reset,
                        pending: Promise.resolve()
                    };
                },
                async getRemaining (ctx, identifier) {
                    if (!ctx.cache) {
                        throw new Error("This algorithm requires a cache");
                    }
                    const bucket = Math.floor(Date.now() / windowDuration);
                    const key = [
                        identifier,
                        bucket
                    ].join(":");
                    const hit = typeof ctx.cache.get(key) === "number";
                    if (hit) {
                        const cachedUsedTokens = ctx.cache.get(key) ?? 0;
                        return {
                            remaining: Math.max(0, tokens - cachedUsedTokens),
                            reset: (bucket + 1) * windowDuration,
                            limit: tokens
                        };
                    }
                    const usedTokens = await safeEval(ctx, SCRIPTS.singleRegion.cachedFixedWindow.getRemaining, [
                        key
                    ], [
                        null
                    ]);
                    return {
                        remaining: Math.max(0, tokens - usedTokens),
                        reset: (bucket + 1) * windowDuration,
                        limit: tokens
                    };
                },
                async resetTokens (ctx, identifier) {
                    if (!ctx.cache) {
                        throw new Error("This algorithm requires a cache");
                    }
                    const bucket = Math.floor(Date.now() / windowDuration);
                    const key = [
                        identifier,
                        bucket
                    ].join(":");
                    ctx.cache.pop(key);
                    const pattern = [
                        identifier,
                        "*"
                    ].join(":");
                    await safeEval(ctx, RESET_SCRIPT, [
                        pattern
                    ], [
                        null
                    ]);
                }
            });
    }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
    Analytics,
    IpDenyList,
    MultiRegionRatelimit,
    Ratelimit
}); //# sourceMappingURL=index.js.map
}),
"[project]/node_modules/uncrypto/dist/crypto.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>_crypto,
    "getRandomValues",
    ()=>getRandomValues,
    "randomUUID",
    ()=>randomUUID,
    "subtle",
    ()=>subtle
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const subtle = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].webcrypto?.subtle || {};
const randomUUID = ()=>{
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomUUID();
};
const getRandomValues = (array)=>{
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].webcrypto.getRandomValues(array);
};
const _crypto = {
    randomUUID,
    getRandomValues,
    subtle
};
;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__aa8cad53._.js.map