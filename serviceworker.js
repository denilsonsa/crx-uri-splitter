'use strict';

// As of June 2024:
//
// - Chrome is deprecating Manifest V2 and is requiring V3.
// - Firefox is implementing Manifest V3 but still doesn't support service workers.
// - V3 uses "background": { "service_worker": "..." }
// - V2 uses "background": { "scripts": [...], "persistent": false }
// - Chrome shows warnings about having background pages/scripts on manifest V3.
// - Chrome also shows warnings about unrecognized "browser_specific_settings".
// - Firefox shows warnings about unexpected properties in the manifest.
// - Firefox doesn't support importScripts, as that function is only available in service workers.
//   Instead, it loads multiple scripts by listing them all on the manifest.
// - Chrome with V3 loads a single script, which can call importScripts(...) to load more scripts.
//   Alternatively, it can load the script as a JS module, which then enables the `import` statement.
//
// See also: https://stackoverflow.com/a/78088358

if (typeof apply_icon_theme === 'undefined') {
	importScripts('common.js');
}

load_options('sync', ['icon_theme']).then(function(items) {
	apply_icon_theme(items.icon_theme);
});
