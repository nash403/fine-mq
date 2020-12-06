/* eslint-disable unicorn/prevent-abbreviations */
import { QueryObject } from 'json2mq'


export type MediaQueryToMatch = string;

export type MediaQueryMatcherHandlerParams = {
  readonly matches: boolean;
  readonly mediaQuery: MediaQueryToMatch;
  readonly alias: string;
};

export type MediaQueryMatcherHandler = (matchedMq: MediaQueryMatcherHandlerParams) => void;

export type MediaQueryMatchListener = {
  readonly handlers: MediaQueryMatcherHandler[];
  readonly matcher: MediaQueryList;
  readonly listener: (e: MediaQueryListEvent | { matches: boolean; }) => void;
};

export type MediaQueryObject = string | number | [number, number?] | MediaQueryToMatch | QueryObject;

export type MediaQueryObjectWithShortcuts = MediaQueryObject | number | [number, number?];

export type MediaQueryAliases = {
  [alias: string]: MediaQueryToMatch;
};

export type MediaQueryMatchers = {
  [alias: string]: MediaQueryMatchListener;
};

export type MatchingAliases = {
  [alias: string]: boolean;
};

export type Mq = {
  aliases: MediaQueryAliases;
  matchers: MediaQueryMatchers;
  matchingAliases: MatchingAliases;
};

export type FineMediaQueries = {
  mq: Mq;
  setMatchingAliases: (matchingAliases: MatchingAliases) => void;
  on: (aliasOrMediaQuery: string, callback: MediaQueryMatcherHandler) => void;
  off: (aliasOrMediaQuery?: string, callback?: MediaQueryMatcherHandler) => void;
  addAlias: (alias: string | { [key: string]: MediaQueryToMatch | QueryObject; }, mediaQuery?: MediaQueryToMatch | QueryObject) => void;
  removeAlias: (alias: string) => void;
};
