import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";

export const accountSearchParamsParsers = {
  q: parseAsString.withDefault(""),
  eligibility: parseAsString.withDefault("all"),
  smartMarketing: parseAsString.withDefault("all"),
  page: parseAsInteger.withDefault(1),
};

export const accountSearchParamsCache = createSearchParamsCache(
  accountSearchParamsParsers,
);
