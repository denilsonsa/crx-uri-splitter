'use strict';

//////////////////////////////////////////////////////////////////////
// Global variables (constants).

const g_datalist_names = [
	'protocols',
	'ports',
	'hostnames',
	'pathnames',
];

const g_other_options_names = [
	'hide_tooltips',
	'new_tab_next_to_current',
	'window_width',
	'input_font',
	'textarea_font',
];

const g_default_options = {
	// -- Sync storage --
	// Datalists:
	'protocols': [
		'http',
		'https',
	],
	'ports': [
		'80',
		'443',
		'8000',
		'8008',
		'8080',
		'8888',
	],
	'hostnames': [],
	'pathnames': [],
	// Other options:
	'hide_tooltips': false,
	'new_tab_next_to_current': false,
	'window_width': 500,
	'input_font': '1em/1.66 sans-serif',
	'textarea_font': '1em/1.66 monospace',
	// Quick options:
	'search_sort': true,
	'search_encode': true,
	'search_plus': true,
	'search_trim': true,
	'search_sep': '&',
	'hash_sort': true,
	'hash_encode': true,
	'hash_plus': true,
	'hash_trim': true,
	'hash_sep': '&',
	// -- Local storage --
	// (nothing)
};

//////////////////////////////////////////////////////////////////////
// Options/settings.
//
// They both work the same way:
//   First argument is either 'local' or 'sync'.
//   Second argument is either a list of strings or an object of {key: value}.
//   They return a Promise.

function load_options(which_storage, keys) {
	return new Promise(function(resolve, reject) {
		if (which_storage != 'local' && which_storage != 'sync') {
			throw new Error('Unrecognized storage.');
		}
		chrome.storage[which_storage].get(keys, function(items) {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				for (let name of keys) {
					if (!(name in items)) {
						items[name] = g_default_options[name];
					}
				}
				resolve(items);
			}
		});
	});
}

function save_options(which_storage, items) {
	return new Promise(function(resolve, reject) {
		if (which_storage != 'local' && which_storage != 'sync') {
			throw new Error('Unrecognized storage.');
		}
		chrome.storage[which_storage].set(items, function() {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve();
			}
		});
	});
}

//////////////////////////////////////////////////////////////////////
// Misc. convenience functions.

// Throttles down a function, so that it is only called after the burst of
// calls (events) have ended.
function debounce(interval, callback) {
	var timer = null;
	return function() {
		var context = this;
		var args = arguments;
		clearTimeout(timer);
		timer = setTimeout(function() {
			timer = null;
			callback.apply(context, args);
		}, interval);
	};
}

// Automatically changes the height of the <textarea> based on the content.
// For convenience, the argument can be either an HTMLElement or an Event.
// Note: "overflow: hidden" is required.
function auto_size_textarea(event_or_textarea) {
	var elem = (event_or_textarea.target
		? event_or_textarea.target
		: event_or_textarea
	);

	elem.style.height = 'auto';

	var height = elem.scrollHeight;
	elem.style.height = height + 'px';

	// Adjusting a few remaining pixels.
	// Why? Because I had to do it in order to prevent vertical scrolling.
	height += elem.scrollHeight - elem.clientHeight;
	elem.style.height = height + 'px';
}

// Gets or sets the value of a form input element.
// Automatically handles different types.
//   var whatever = input_value('element_id');
//   input_value('element_id', 'new_value);
function input_value(id_or_elem, value) {
	// The first argument can be either an id (string), or an HTMLElement.
	var elem = id_or_elem;
	if (typeof elem == 'string') {
		elem = document.getElementById(elem);
	}
	if (!elem) {
		throw new Error('Element not found');
	}

	// Is this a "get" or "set" call?
	// "Get" only receives one argument, "set" receives two.
	var get = (arguments.length == 1);

	var tagname = elem.tagName.toLowerCase();
	var type = elem.type.toLowerCase();

	if (tagname == 'input' || tagname == 'textarea') {
		if (tagname == 'textarea' || /^(text|password|hidden|url|email|tel|search)$/.test(type)) {
			if (get) return elem.value;
			elem.value = value;
			return;
		} else if (/^(number|range)$/.test(type)) {
			if (get) return elem.valueAsNumber;
			elem.valueAsNumber = value;
			return;
		} else if (/^(checkbox|radio)$/.test(type)) {
			if (get) return elem.checked;
			elem.checked = value;
			return;
		}
	}

	throw new Error('Element not supported (not implemented yet)');
}

// Gets the current Chrome tab, returning a promise.
function current_tab() {
	return new Promise(function(resolve, reject) {
		chrome.tabs.query({
			'active': true,
			'currentWindow': true,
		}, function(tabs) {
			if (tabs && tabs[0]) {
				resolve(tabs[0]);
			} else {
				reject(new Error('No tab found.'));
			}
		});
	});
}

// options.js and popup.js will put here their specific error reporting
// functions.
var DEFAULT_ERROR_REPORTER = null;

function open_url_in_this_tab(url) {
	current_tab().then(function(tab) {
		chrome.tabs.update(tab.id, {'url': url});
	}, DEFAULT_ERROR_REPORTER);
}
function _open_url_in_new_tab(url, active) {
	load_options('sync', ['new_tab_next_to_current']).then(function(items) {
		if (items['new_tab_next_to_current']) {
			current_tab().then(function(tab) {
				chrome.tabs.create({'url': url, 'index': tab.index + 1, 'active': active});
			}, DEFAULT_ERROR_REPORTER);
		} else {
			chrome.tabs.create({'url': url, 'active': active});
		}
	}, DEFAULT_ERROR_REPORTER);
}
function open_url_in_new_tab(url) {
	_open_url_in_new_tab(url, true);
}
function open_url_in_new_background_tab(url) {
	_open_url_in_new_tab(url, false);
}
function open_url_in_new_window(url) {
	chrome.windows.create({'url': url});
}
function open_url_in_new_incognito(url) {
	chrome.windows.create({'url': url, 'incognito': true});
}
