require("dotenv").config();

// Parses the tag schedule configuration and resolves an order to a single tag.
//
// ZENDESK_TAG_SCHEDULE          "Mon-Fri 11:00-18:00=N; Sat,Sun 12:00-16:00=W; default=I"
// ZENDESK_TAG_TIMEZONE          "America/Los_Angeles"
// ZENDESK_TAG_DELIVERY_OVERRIDES "Later Date=N"   (unset -> no overrides)
//
// Delivery-option overrides are opt-in: with nothing configured every order,
// including "Later Date", is tagged purely from the schedule.
//
// Any number of distinct tags may be used. Windows are matched in the order
// they are written and the first one that matches wins; "default" applies when
// none do. A window whose end is at or before its start is treated as crossing
// midnight. Start is inclusive, end is exclusive.

const DAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const DEFAULT_TIMEZONE = "America/Los_Angeles";
const DEFAULT_SCHEDULE = "11:00-18:00=N; default=I";
const DEFAULT_DELIVERY_OVERRIDES = "";

const parseTimeOfDay = (value) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 24 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
};

const parseDayList = (value) => {
  const days = new Set();
  for (const chunk of value.split(",")) {
    const range = chunk.trim().toLowerCase().split("-");
    if (range.length > 2) {
      return null;
    }
    const from = DAY_NAMES.indexOf(range[0].slice(0, 3));
    const to = DAY_NAMES.indexOf(range[range.length - 1].slice(0, 3));
    if (from < 0 || to < 0) {
      return null;
    }
    // Ranges wrap, so Fri-Mon means Fri, Sat, Sun, Mon.
    for (let i = from; ; i = (i + 1) % 7) {
      days.add(i);
      if (i === to) {
        break;
      }
    }
  }
  return days;
};

const parseWindow = (left, tag) => {
  const parts = left.split(/\s+/).filter((part) => part.length > 0);
  if (parts.length === 0 || parts.length > 2) {
    return null;
  }
  const days = parts.length === 2 ? parseDayList(parts[0]) : null;
  if (parts.length === 2 && days === null) {
    return null;
  }
  const bounds = parts[parts.length - 1].split("-");
  if (bounds.length !== 2) {
    return null;
  }
  const start = parseTimeOfDay(bounds[0]);
  const end = parseTimeOfDay(bounds[1]);
  if (start === null || end === null) {
    return null;
  }
  return { days: days, start: start, end: end, tag: tag };
};

const parseSchedule = (raw) => {
  const windows = [];
  let defaultTag = null;
  for (const rule of raw.split(";")) {
    const text = rule.trim();
    if (text.length === 0) {
      continue;
    }
    const separator = text.indexOf("=");
    if (separator < 0) {
      console.log("Ignoring tag schedule rule without a tag: " + text);
      continue;
    }
    const left = text.slice(0, separator).trim();
    const tag = text.slice(separator + 1).trim();
    if (tag.length === 0) {
      console.log("Ignoring tag schedule rule with an empty tag: " + text);
      continue;
    }
    if (left.toLowerCase() === "default") {
      defaultTag = tag;
      continue;
    }
    const parsed = parseWindow(left, tag);
    if (parsed === null) {
      console.log("Ignoring unparseable tag schedule rule: " + text);
      continue;
    }
    windows.push(parsed);
  }
  return { windows: windows, defaultTag: defaultTag };
};

const parseDeliveryOverrides = (raw) => {
  const overrides = new Map();
  for (const entry of raw.split(";")) {
    const text = entry.trim();
    if (text.length === 0) {
      continue;
    }
    const separator = text.indexOf("=");
    if (separator < 0) {
      console.log("Ignoring delivery override without a tag: " + text);
      continue;
    }
    const option = text.slice(0, separator).trim().toLowerCase();
    const tag = text.slice(separator + 1).trim();
    if (option.length === 0 || tag.length === 0) {
      console.log("Ignoring incomplete delivery override: " + text);
      continue;
    }
    overrides.set(option, tag);
  }
  return overrides;
};

// Day of week and minutes-since-midnight as observed in the configured zone,
// independent of the server's own timezone.
const getZonedParts = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const lookup = {};
  for (const part of parts) {
    lookup[part.type] = part.value;
  }

  return {
    day: DAY_NAMES.indexOf(lookup.weekday.slice(0, 3).toLowerCase()),
    minutes: Number(lookup.hour) * 60 + Number(lookup.minute),
  };
};

const matchesWindow = (window, zoned) => {
  if (window.start < window.end) {
    if (zoned.minutes < window.start || zoned.minutes >= window.end) {
      return false;
    }
    return window.days === null || window.days.has(zoned.day);
  }

  // Crosses midnight: the evening leg belongs to the configured day, the
  // morning leg to the day after it.
  if (zoned.minutes >= window.start) {
    return window.days === null || window.days.has(zoned.day);
  }
  if (zoned.minutes < window.end) {
    return window.days === null || window.days.has((zoned.day + 6) % 7);
  }
  return false;
};

const resolveTimeZone = (timeZone) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timeZone }).format(new Date());
    return timeZone;
  } catch (err) {
    console.log(
      "Invalid ZENDESK_TAG_TIMEZONE '" +
        timeZone +
        "', falling back to " +
        DEFAULT_TIMEZONE
    );
    return DEFAULT_TIMEZONE;
  }
};

// Reads one setting, reporting whether the value came from the environment or
// from the built-in default.
const resolveSetting = (env, name, fallback) => {
  const raw = env[name];
  const configured =
    raw === undefined || raw === null ? undefined : String(raw);
  if (configured === undefined || configured.trim().length === 0) {
    return { name: name, value: fallback, source: "default" };
  }
  return { name: name, value: configured, source: "env" };
};

// Logged once per distinct configuration rather than once per ticket, so a
// restart or a config change is visible without flooding the log.
let lastLoggedConfig = null;

// Resolves all three settings together and logs where each one came from.
const resolveConfig = (env) => {
  const settings = [
    resolveSetting(env, "ZENDESK_TAG_SCHEDULE", DEFAULT_SCHEDULE),
    resolveSetting(env, "ZENDESK_TAG_TIMEZONE", DEFAULT_TIMEZONE),
    resolveSetting(
      env,
      "ZENDESK_TAG_DELIVERY_OVERRIDES",
      DEFAULT_DELIVERY_OVERRIDES
    ),
  ];

  const summary = settings
    .map(
      (setting) =>
        setting.name +
        " (" +
        setting.source +
        ") = " +
        JSON.stringify(setting.value)
    )
    .join(", ");
  if (summary !== lastLoggedConfig) {
    lastLoggedConfig = summary;
    console.log("Zendesk tag configuration: " + summary);
  }

  return { schedule: settings[0], timeZone: settings[1], overrides: settings[2] };
};

const getScheduledTag = (orderedAt, env = process.env, config = null) => {
  const resolved = config || resolveConfig(env);
  const schedule = parseSchedule(resolved.schedule.value);
  const timeZone = resolveTimeZone(resolved.timeZone.value);
  const zoned = getZonedParts(orderedAt, timeZone);

  for (const window of schedule.windows) {
    if (matchesWindow(window, zoned)) {
      return window.tag;
    }
  }
  return schedule.defaultTag;
};

// The tag for an order: a configured delivery-option override if one applies,
// otherwise whichever schedule window the order time falls in. Returns null
// when nothing matches and no default is configured, meaning "no tag".
const resolveOrderTag = (formSubmission, env) => {
  const config = resolveConfig(env);
  const overrides = parseDeliveryOverrides(config.overrides.value);

  const deliveryOption = (formSubmission.formData || {}).deliveryOptionValue;
  if (typeof deliveryOption === "string") {
    const override = overrides.get(deliveryOption.trim().toLowerCase());
    if (override) {
      return override;
    }
  }

  const orderedAt = formSubmission.createdAt
    ? new Date(formSubmission.createdAt)
    : new Date();
  if (isNaN(orderedAt.getTime())) {
    console.log(
      "Unusable createdAt on submission, tagging from the current time instead"
    );
    return getScheduledTag(new Date(), env, config);
  }
  return getScheduledTag(orderedAt, env, config);
};

// Tagging must never be the reason an order fails to reach Zendesk, so this
// never throws: anything unexpected is logged and the order goes out untagged.
// A tag is only returned when it is a usable non-empty string.
const getOrderTag = (formSubmission, env = process.env) => {
  try {
    const tag = resolveOrderTag(formSubmission || {}, env || {});
    if (typeof tag !== "string" || tag.trim().length === 0) {
      return null;
    }
    return tag.trim();
  } catch (err) {
    console.log(
      "Error determining the Zendesk tag, continuing untagged. Error: " +
        (err && err.stack ? err.stack : err)
    );
    return null;
  }
};

module.exports = { getOrderTag, getScheduledTag };
