// src/index.mts
import {
  batch,
  createComponent,
  createContext,
  createSignal,
  useContext
} from "solid-js";

// ../runtime/src/core-utils.mts
var getFallbackProxy = () => (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new Proxy(Object.assign(() => "", {}), {
    get: (_target, key) => key === "length" ? 0 : getFallbackProxy()
  })
);

// ../parser/src/basic.mts
var removeEmptyValues = (object) => Object.fromEntries(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.entries(object).map(([key, value]) => key !== "i" && value && value != "0" && [key, value]).filter(Boolean)
);
var trimAllValues = (part) => Object.fromEntries(
  Object.keys(part).map((key) => {
    const val = part[key];
    return [
      key,
      Array.isArray(val) ? val.map((v) => v?.trim()) : val === !!val ? val : val?.trim()
    ];
  })
);
var parseArgumentPart = (text) => {
  const [keyPart = "", ...formatterKeys] = text.split("|");
  const [keyWithoutType = "", type] = keyPart.split(":");
  const [key, isOptional] = keyWithoutType.split("?");
  return { k: key, i: type, n: isOptional === "", f: formatterKeys };
};
var isBasicPluralPart = (part) => !!(part.o || part.r);
var parsePluralPart = (content, lastAccessor) => {
  let [key, values] = content.split(":");
  if (!values) {
    values = key;
    key = lastAccessor;
  }
  const entries = values.split("|");
  const [zero, one, two, few, many, rest] = entries;
  const nrOfEntries = entries.filter((entry) => entry !== void 0).length;
  if (nrOfEntries === 1) {
    return { k: key, r: zero };
  }
  if (nrOfEntries === 2) {
    return { k: key, o: zero, r: one };
  }
  if (nrOfEntries === 3) {
    return { k: key, z: zero, o: one, r: two };
  }
  return { k: key, z: zero, o: one, t: two, f: few, m: many, r: rest };
};
var REGEX_SWITCH_CASE = /^\{.*\}$/;
var parseCases = (text) => Object.fromEntries(
  removeOuterBrackets(text).split(",").map((part) => part.split(":")).reduce(
    (accumulator, entry) => {
      if (entry.length === 2) {
        return [...accumulator, entry.map((entry2) => entry2.trim())];
      }
      ;
      accumulator[accumulator.length - 1][1] += "," + entry[0];
      return accumulator;
    },
    []
  )
);
var REGEX_BRACKETS_SPLIT = /(\{(?:[^{}]+|\{(?:[^{}]+)*\})*\})/g;
var removeOuterBrackets = (text) => text.substring(1, text.length - 1);
var parseRawText = (rawText, optimize = true, firstKey = "", lastKey = "") => rawText.split(REGEX_BRACKETS_SPLIT).map((part) => {
  if (!part.match(REGEX_BRACKETS_SPLIT)) {
    return part;
  }
  const content = removeOuterBrackets(part);
  if (content.startsWith("{")) {
    return parsePluralPart(removeOuterBrackets(content), lastKey);
  }
  const parsedPart = parseArgumentPart(content);
  lastKey = parsedPart.k || lastKey;
  !firstKey && (firstKey = lastKey);
  return parsedPart;
}).map((part) => {
  if (typeof part === "string")
    return part;
  if (!part.k)
    part.k = firstKey || "0";
  const trimmed = trimAllValues(part);
  return optimize ? removeEmptyValues(trimmed) : trimmed;
});

// ../runtime/src/core.mts
var applyFormatters = (formatters, formatterKeys, initialValue) => formatterKeys.reduce(
  (value, formatterKey) => (formatterKey.match(REGEX_SWITCH_CASE) ? ((cases) => cases[value] ?? cases["*"])(parseCases(formatterKey)) : formatters[formatterKey]?.(value)) ?? value,
  initialValue
);
var getPlural = (pluralRules, { z, o, t, f, m, r }, value) => {
  switch (z && value == 0 ? "zero" : pluralRules.select(value)) {
    case "zero":
      return z;
    case "one":
      return o;
    case "two":
      return t;
    case "few":
      return f ?? r;
    case "many":
      return m ?? r;
    default:
      return r;
  }
};
var REGEX_PLURAL_VALUE_INJECTION = /\?\?/g;
var applyArguments = (textParts, pluralRules, formatters, args) => textParts.map((part) => {
  if (typeof part === "string") {
    return part;
  }
  const { k: key = "0", f: formatterKeys = [] } = part;
  const value = args[key];
  if (isBasicPluralPart(part)) {
    return ((typeof value === "boolean" ? value ? part.o : part.r : getPlural(pluralRules, part, value)) || "").replace(REGEX_PLURAL_VALUE_INJECTION, value);
  }
  const formattedValue = formatterKeys.length ? applyFormatters(formatters, formatterKeys, value) : value;
  return ("" + (formattedValue ?? "")).trim();
}).join("");
var translate = (textParts, pluralRules, formatters, args) => {
  const firstArg = args[0];
  const isObject = firstArg && typeof firstArg === "object" && firstArg.constructor === Object;
  const transformedArgs = args.length === 1 && isObject ? firstArg : args;
  return applyArguments(textParts, pluralRules, formatters, transformedArgs);
};

// ../runtime/src/util.string.mts
var getPartsFromString = (cache, text) => cache[text] || (cache[text] = parseRawText(text));

// ../runtime/src/util.object.mts
var getTranslateInstance = (locale, formatters) => {
  const cache = {};
  const pluralRules = new Intl.PluralRules(locale);
  return (text, ...args) => translate(getPartsFromString(cache, text), pluralRules, formatters, args);
};
function i18nObject(locale, translations, formatters = {}) {
  return createProxy(translations, getTranslateInstance(locale, formatters));
}
var wrap = (proxyObject = {}, translateFn) => typeof proxyObject === "string" ? translateFn.bind(null, proxyObject) : Object.assign(
  Object.defineProperty(() => "", "name", { writable: true }),
  proxyObject
);
var createProxy = (proxyObject, translateFn) => new Proxy(wrap(proxyObject, translateFn), {
  get: (target, key) => {
    if (key === Symbol.iterator)
      return [][Symbol.iterator].bind(Object.values(target).map((entry) => wrap(entry, translateFn)));
    return createProxy(target[key], translateFn);
  }
});

// src/index.mts
var initI18nSolid = (translations, formatters = {}) => {
  const I18nContext = createContext({});
  const TypesafeI18n = (props) => {
    const [locale, _setLocale] = createSignal(null);
    const [LL, setLL] = createSignal(getFallbackProxy());
    const setLocale = (newLocale) => batch(() => {
      _setLocale(() => newLocale);
      setLL(() => i18nObject(newLocale, translations[newLocale], formatters[newLocale]));
    });
    setLocale(props.locale);
    return createComponent(I18nContext.Provider, {
      value: { locale, LL, setLocale },
      get children() {
        return props.children;
      }
    });
  };
  const useI18nContext = () => useContext(I18nContext);
  return { TypesafeI18n, useI18nContext };
};
export {
  initI18nSolid
};