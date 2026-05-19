import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";

export const campaignSearchParamsParsers = {
  q: parseAsString.withDefault(""),
  dealer: parseAsString.withDefault("all"),
  timeZone: parseAsString.withDefault("all"),
  status: parseAsString.withDefault("all"),
  page: parseAsInteger.withDefault(1),
};

export const campaignSearchParamsCache = createSearchParamsCache(
  campaignSearchParamsParsers,
);
