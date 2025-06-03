import bcd from '../index.js';
import { walk } from '../utils/index.js';
import packageJson from '../package.json' with { type: 'json' };

const version = packageJson.version;
const with_bug = {};
const without_bug = {};
for (const { path, compat } of walk(undefined, bcd)) {
  const { description, mdn_url, spec_url, status, support } = compat;
  let { chrome, firefox, safari } = support;
  chrome = Array.isArray(chrome) ? chrome[0] : chrome;
  firefox = Array.isArray(firefox) ? firefox[0] : firefox;
  safari = Array.isArray(safari) ? safari[0] : safari;

  const deprecated = status?.deprecated === true ? true : undefined;
  const nonstandard = status?.standard_track === false ? true : undefined;

  if (
    chrome?.version_added &&
    !chrome?.partial_implementation &&
    safari?.version_added &&
    !safari?.partial_implementation &&
    !firefox?.version_added
  ) {
    const firefox_bug = firefox?.impl_url;
    const target = firefox_bug ? with_bug : without_bug;
    target[path] = {
      chrome: chrome.version_added,
      safari: safari.version_added,
      deprecated,
      nonstandard,
      firefox_bug,
      mdn_url,
      spec_url,
      description,
    };
  }
}

console.log(
  JSON.stringify(
    {
      __meta: {
        version,
        description:
          'This file contains all BCD features with support in Chrome and Safari, but not in Firefox.',
      },
      with_bug,
      without_bug,
    },
    null,
    2,
  ),
);
