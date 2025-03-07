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

function init() {
	load_options('sync', ['icon_theme']).then(function(items) {
		apply_icon_theme(items.icon_theme);
	});
}

// Initialization when the extension is first installed.
// But it does not fire if the extension is turned off and then on.
// But it does not fire when the browser starts.
//chrome.runtime.onInstalled.addListener(init);

// Initialization when the extension is first installed.
// Also when the extension is turned off and on.
// But it does not fire when the browser starts.
// Also does not work on Firefox around version 136.
self.addEventListener("activate", init);

// Initialization when the browser is restarted.
// But it does not fire during the installation.
// But it does not fire if the extension is turned off and then on.
chrome.runtime.onStartup.addListener(init);

// Sometimes neither of those events triggers. (Usually on Firefox.)
// So, let's just call init() directly here.
init();
