'use strict';

//////////////////////////////////////////////////////////////////////
// Misc. convenience functions.

// %-encode the matched character.
function percent_encode(match) {
	var replacement = '%' + match.codePointAt(0).toString(16);
	if (replacement.length != 3) {
		throw new Error('Characters outside 0x10..0xFF range are not supported in this function.');
	}
	return replacement;
}

// Splits the string s at the first occurrence of sep.
// Always returns an Array of 3 items.
// This function is inpired by the Python's method of the same name.
function partition(sep, s) {
	var index = s.indexOf(sep);
	if (index == -1) {
		return [s, '', ''];
	} else {
		return [
			s.substring(0, index),
			sep,
			s.substring(index + sep.length)
		];
	}
}

//////////////////////////////////////////////////////////////////////
// Main functions.

function multiline_split(value) {
	if (!value) return '';

	var kind;
	if (value[0] == '?') {
		kind = 'search';
	} else if (value[0] == '#') {
		kind = 'hash';
	} else {
		throw new Error('Unrecognized kind. Expected parameter with leading "?" or "#", found "' + value[0] + '"');
	}

	// Removing the leading ? or #.
	value = value.substring(1);

	// Separator.
	var sep_chars = input_value(kind + '_sep');
	// Escaping the special characters.
	var sep_regex_str = '[' + sep_chars.replace(/[-\\^\]]/g, '\\$&') + ']';
	var sep_regex = new RegExp(sep_regex_str, 'g');

	var lines = value.split(sep_regex);

	// Decoding "+" as space.
	if (input_value(kind + '_plus')) {
		lines = lines.map(
			line => line.replace(/\+/g, ' ')
		);
	}

	// Decoding %xx sequences.
	if (input_value(kind + '_encode')) {
		lines = lines.map(function(line) {
			try {
				return decodeURIComponent(line);
			} catch (ex) {
				// Malformed URI. Just ignore (and log) the error.
				console.info(ex);
				return line;
			}
		});
	}

	// Stripping whitespace and empty lines.
	if (input_value(kind + '_trim')) {
		lines = lines.map(
			line => line.trim()
		).filter(
			line => line.length > 0
		);
	}

	// Sorting.
	if (input_value(kind + '_sort')) {
		lines.sort();
	}

	return lines.join('\n');
}

function multiline_join(kind, value) {
	if (!/^(search|hash)$/.test(kind)) {
		throw new Error('Unrecognized kind: ' + kind);
	}

	var lines = value.replace(/\r\n/g, '\n').split('\n');

	// Stripping whitespace and empty lines.
	if (input_value(kind + '_trim')) {
		lines = lines.map(
			line => line.trim()
		).filter(
			line => line.length > 0
		);
	}

	// Encoding %xx sequences.
	if (input_value(kind + '_encode')) {
		lines = lines.map(function(line) {
			var pieces = partition('=', line);
			pieces[0] = encodeURIComponent(pieces[0]);
			pieces[2] = encodeURIComponent(pieces[2]);
			return pieces.join('');

		});
	}

	// Encoding space as "+".
	if (input_value(kind + '_plus')) {
		if (input_value(kind + '_encode')) {
			lines = lines.map(
				line => line.replace(/%20/g, '+')
			);
		} else {
			lines = lines.map(
				line => line.replace(/ /g, '+')
			);
		}
	}

	var sep_chars = input_value(kind + '_sep');

	// Use the first char, or use an empty string.
	var separator = sep_chars.substring(0, 1);

	return lines.join(separator);
}

function full_uri_to_fields() {
	var uri_elem = document.getElementById('uri');
	var uri = uri_elem.value;
	var url;
	try {
		url = new URL(uri);
	} catch (ex) {
		uri_elem.setCustomValidity(ex.message);
		return;
	}
	uri_elem.setCustomValidity('');

	document.getElementById('protocol').value = url.protocol.replace(/:$/, '');
	// document.getElementById('hostname').value = decodeURIComponent(url.hostname);
	document.getElementById('hostname').value = punycode.toUnicode(url.hostname);
	document.getElementById('port').value = url.port;
	document.getElementById('username').value = decodeURIComponent(url.username);
	document.getElementById('password').value = decodeURIComponent(url.password);
	document.getElementById('pathname').value = decodeURIComponent(url.pathname);
	document.getElementById('search').value = multiline_split(url.search);
	document.getElementById('hash').value = multiline_split(url.hash);

	auto_size_textarea(document.getElementById('search'));
	auto_size_textarea(document.getElementById('hash'));
}

function fields_to_full_uri() {
	// Names of the pieces.
	var names = [
		'protocol',
		'hostname',
		'port',
		'username',
		'password',
		'pathname',
		'search',
		'hash',
	];

	// Loading field values from DOM.
	var s = {};
	for (let name of names) {
		let elem = document.getElementById(name);
		if (!elem.checkValidity()) {
			// Invalid input. Abort.
			return;
		}
		if (elem.tagName.toLowerCase() == 'textarea') {
			s[name] = multiline_join(name, elem.value);
		} else if (elem.type == 'number') {
			s[name] = elem.valueAsNumber;
		} else {
			s[name] = elem.value.trim();
		}
	}

	if (s.protocol) {
		s.protocol = s.protocol.toLowerCase();
	} else {
		// Default protocol if empty.
		// I need one in order to generate a valid URL.
		s.protocol = 'http';
	}

	// https://url.spec.whatwg.org/#special-scheme
	// Also chrome:// and chrome-extension://
	var protocol_is_special = /^(ftp|file|gopher|http|https|ws|wss|chrome|chrome-extension)$/.test(s.protocol);

	// var encoded_hostname = encodeURIComponent(s.hostname);
	var encoded_hostname = punycode.toASCII(s.hostname);

	// All this string concatenation emulates the "new URL()" behavior.
	//
	// But why not use "new URL()" directly? Because that one only works for
	// known protocols, because it can throw exceptions, and because before
	// using it I'd have to concatenate all pieces anyway (the constructor
	// requires a valid URL). Overall, I don't see any real advantage on using
	// it.
	var concatenation = (
		s.protocol +
		(protocol_is_special
			? '://'
			: ':'
		) +
		(s.username || s.password
			? encodeURIComponent(s.username) +
				(s.password
					? ':' + encodeURIComponent(s.password)
					: ''
				) +
				'@'
			: ''
		) +
		encoded_hostname +
		(isNaN(s.port)
			? ''
			: ':' + s.port
		)
	);
	if (s.pathname) {
		concatenation += (
			(protocol_is_special && s.pathname[0] != '/'
				? '/'
				: ''
			) +
			s.pathname.replace(/[%#\\? ]/g, percent_encode)
		);
	}
	if (s.search) {
		concatenation += '?' + s.search;
		//concatenation += '?' + s.search.replace(/[%# ]/g, percent_encode);
	}
	if (s.hash) {
		concatenation += '#' + s.hash;
		//concatenation += '#' + s.hash.replace(/[ ]/g, percent_encode);
	}

	// var url;
	// try {
	// 	url = new URL(concatenation);
	// } catch (ex) {
	// 	console.log(ex);
	// }
	//
	// if (s.protocol) url.protocol = s.protocol;
	// url.hostname = s.hostname;
	// if (!isNaN(s.port)) url.port = s.port;
	// url.username = s.username;
	// url.password = s.password;
	// url.pathname = s.pathname;
	// url.search = s.search;
	// url.hash = s.hash;
	//
	// document.getElementById('uri').value = url.href;

	var uri_elem = document.getElementById('uri');
	uri_elem.value = concatenation;
	uri_elem.setCustomValidity('');
}

//////////////////////////////////////////////////////////////////////
// UI-related functions.

// Simple error handler that logs the error and shows an alert box.
function alert_error_reporter(err) {
	console.error(err);
	alert(err.message);
}

// Saves the current quick option.
function quick_option_save(ev) {
	var elem = ev.target;
	var name = elem.id;
	var data = {};
	data[name] = input_value(elem);
	save_options('sync', data).then(function() {
		// Do nothing.
	}, alert_error_reporter);
}

function quick_option_has_changed(ev) {
	// Keep the window scrolled at the same position from the bottom.

	var old_scrollY = window.scrollY;
	var old_scrollHeight = document.body.scrollHeight;
	// Should be similar to document.body.clientHeight, document.body.offsetHeight.
	var old_windowHeight = window.innerHeight;
	var old_distance_from_bottom = old_scrollHeight - (old_scrollY + old_windowHeight);

	full_uri_to_fields(ev);

	var new_windowHeight = window.innerHeight;
	var new_scrollHeight = document.body.scrollHeight;
	var new_scrollY = new_scrollHeight - old_distance_from_bottom - new_windowHeight;
	window.scrollTo(window.scrollX, new_scrollY);
}

// Open the current URI...
function open_in_current_tab() {
	var uri = document.getElementById('uri').value;
	open_url_in_this_tab(uri);
}
function open_in_new_tab() {
	var uri = document.getElementById('uri').value;
	open_url_in_new_tab(uri);
}
function open_in_new_background_tab() {
	var uri = document.getElementById('uri').value;
	open_url_in_new_background_tab(uri);
}
function open_in_new_window() {
	var uri = document.getElementById('uri').value;
	open_url_in_new_window(uri);
}
function open_in_new_incognito() {
	var uri = document.getElementById('uri').value;
	open_url_in_new_incognito(uri);
}

//////////////////////////////////////////////////////////////////////
// Keyboard-related functions.
//
// Why not just use HTML's accesskeys? Because it gives me very little control,
// it is too limited, and provides a poor UX.

// Map from single characters to HTML elements.
// For instance, an element <input type="text" … data-Keyboard="4 x"> will be
// referenced from keys "4", "x" and "X".
var g_keyboard_shortcut_map = {};

var g_shortcuts_overlay_timeout = null;
function show_shortcuts() {
	clearTimeout(g_shortcuts_overlay_timeout);
	g_shortcuts_overlay_timeout = null;

	var margin = 0;
	var elem = document.getElementById('shortcuts_overlay');
	for (let shadow of elem.getElementsByClassName('shadow')) {
		let field = document.getElementById(shadow.dataset.fieldid);
		if (field) {
			let rect = field.getBoundingClientRect();
			shadow.style.top = (rect.top + margin) + 'px';
			shadow.style.left = (rect.left + margin) + 'px';
			shadow.style.width  = (rect.width - 2 * margin) + 'px';
			shadow.style.height = (rect.height - 2 * margin) + 'px';
		}
	}
	elem.classList.add('visible');
}
function show_shortcuts_after(delay) {
	clearTimeout(g_shortcuts_overlay_timeout);
	g_shortcuts_overlay_timeout = setTimeout(show_shortcuts, delay);
}
function hide_shortcuts() {
	clearTimeout(g_shortcuts_overlay_timeout);
	g_shortcuts_overlay_timeout = null;

	var elem = document.getElementById('shortcuts_overlay');
	elem.classList.remove('visible');
}

// Initialization.
function prepare_keyboard_shortcuts(hide_tooltips) {
	var is_mac = /\bMac OS X\b/.test(window.navigator.appVersion);
	var shortcuts_overlay = document.getElementById('shortcuts_overlay');
	for (let elem of document.querySelectorAll('[data-keyboard]')) {
		let keys = elem.dataset.keyboard.trim().split(/\s+/);
		for (let key of keys) {
			if (key.length == 1) {
				g_keyboard_shortcut_map[key.toLowerCase()] = elem;
				g_keyboard_shortcut_map[key.toUpperCase()] = elem;
			}
		}
		let entermodifier = elem.dataset.entermodifier;
		if (entermodifier) {
			if (is_mac) {
				// Note: that character is ⌃ 8963, U+2303 UP ARROWHEAD
				// It looks similar, but it is NOT ^ 94, U+005E CIRCUMFLEX ACCENT
				entermodifier = entermodifier.replace(/⌃/g, '⌘');
				elem.dataset.entermodifier = entermodifier;
			}
			keys.push(entermodifier);
		}
		if (hide_tooltips) {
			elem.title = '';
		} else {
			elem.title += '\nShortcut' + (keys.length == 1 ? '' : 's') + ': ' + keys.join(', ');

			let shadow = document.createElement('div');
			shadow.setAttribute('class', 'shadow');
			shadow.dataset.fieldid = elem.id;
			shortcuts_overlay.appendChild(shadow);
			for (let key of keys) {
				let elem = document.createElement('kbd');
				elem.textContent = (key.length == 1) ? '⌥' + key : key;
				shadow.appendChild(elem);
			}
		}
		// Idea: Show keyboard shorcuts when ctrl/alt/meta is pressed, and hide
		// them when not needed anymore.
		// Issue: It requires a lot of effort to do it properly (CSS
		// positioning, JavaSript), and provides very little gain over the
		// standard tooltip provided by title attribute.
	}
}

function keydown_handler(ev) {
	if (ev.repeat || ev.isComposing) {
		return;
	}

	const only_shift = 1;
	const only_ctrl  = 2;
	const only_alt   = 4;
	const only_meta  = 8;
	let modifiers = (  // Each bit is one modifier.
		(ev.shiftKey ? only_shift : 0) |
		(ev.ctrlKey  ? only_ctrl  : 0) |
		(ev.altKey   ? only_alt   : 0) |
		(ev.metaKey  ? only_meta  : 0)
	);
	let modifiers_ignoring_shift = modifiers & (0xFF ^ only_shift);
	let is_mac = /\bMac OS X\b/.test(window.navigator.appVersion);
	let platform_control = is_mac ? only_meta : only_ctrl;

	if (ev.key == 'Enter') {
		if (modifiers === only_alt) {
			// "Enter" does a submit, and opens in the current tab.
			// "Alt+Enter" is an alternative for when "Enter" would enter a newline instead.
			open_in_current_tab();
		} else if (modifiers === platform_control) {
			// "Ctrl+click" opens a link in a background tab.
			open_in_new_background_tab();
		} else if (modifiers === only_shift) {
			// "Shift+click" opens a link in a new window.
			open_in_new_window();
		} else if (modifiers === (only_shift | platform_control)) {
			// "Ctrl+Shift+click" opens a link in a new tab.
			open_in_new_tab();
		}
	} else if (modifiers_ignoring_shift === only_alt || modifiers_ignoring_shift === platform_control) {
		let elem = g_keyboard_shortcut_map[ev.key];
		if (elem) {
			if (elem.tagName.toLowerCase() == 'button' || elem.type == 'button' || elem.type == 'submit') {
				elem.click();
			} else {
				elem.focus();
				elem.select();
			}
			ev.preventDefault();
		}
	}

	if (
		(ev.key == 'Alt' && modifiers_ignoring_shift === only_alt) ||
		((ev.key == 'Meta' || ev.key == 'Control') && modifiers_ignoring_shift === platform_control)
	) {
		let shortcuts_overlay = document.getElementById('shortcuts_overlay');
		if (shortcuts_overlay && shortcuts_overlay.classList.contains('visible')) {
			hide_shortcuts();
		} else {
			show_shortcuts_after(375);
		}
	} else if (ev.key == 'Shift') {
		// Do nothing.
	} else {
		hide_shortcuts();
	}
}


//////////////////////////////////////////////////////////////////////
// Initialization.

function init() {
	// Quick options: listing them and adding event listeners.
	let quick_option_names = [];
	for (let input of document.querySelectorAll('#options_panel input')) {
		if (input.type != 'text' && input.type != 'checkbox') continue;
		quick_option_names.push(input.id);
		let event_name = (/^(checkbox|radio)$/i.test(input.type) ? 'click' : 'input');
		input.addEventListener(event_name, quick_option_has_changed);
		input.addEventListener(event_name, debounce(1000, quick_option_save));
	}

	// Running several promises (almost in parallel) and running some code only
	// after all of them have resolved.
	Promise.all([
		// Getting the current URL.
		current_tab().then(function(tab) {
			let elem = document.getElementById('uri');
			elem.value = tab.url;
			elem.focus();
			elem.select();
		}),

		// Loading datalist options.
		load_options('sync', g_datalist_names).then(function(items) {
			for (let name of g_datalist_names) {
				let loaded_data = items[name];
				let elem = document.getElementById(name);
				for (let item of loaded_data) {
					let option = document.createElement('option');
					option.value = item;
					elem.appendChild(option);
				}
			}
		}),

		// Applying other options.
		load_options('sync', g_other_options_names).then(function(items) {
			let style = document.createElement('style');
			// Warning: This style is copy-pasted also in options.js.
			style.textContent = `
				html {
					width: ${items.window_width}px;
				}
				input[type="email"],
				input[type="number"],
				input[type="password"],
				input[type="text"],
				input[type="url"] {
					font: ${items.input_font};
				}
				textarea {
					font: ${items.textarea_font};
				}
			`;
			document.head.appendChild(style);

			prepare_keyboard_shortcuts(items.hide_tooltips);
		}),

		// Loading quick options.
		load_options('sync', quick_option_names).then(function(items) {
			for (let name of quick_option_names) {
				input_value(name, items[name]);
			}
		}),
	]).then(function() {
		// Split the initial URI only after all other promises have resolved.
		// In other words, wait until all options have loaded.
		full_uri_to_fields();
	}, alert_error_reporter);

	// Buttons.
	document.getElementById('options').addEventListener('click', function(ev) {
		document.getElementById('options_panel').classList.toggle('hidden');
	});
	document.getElementById('background').addEventListener('click', open_in_new_background_tab);
	document.getElementById('tab').addEventListener('click', open_in_new_tab);
	document.getElementById('window').addEventListener('click', open_in_new_window);
	document.getElementById('incognito').addEventListener('click', open_in_new_incognito);
	document.getElementById('other_options').addEventListener('click', function(ev) {
		ev.preventDefault();
		chrome.runtime.openOptionsPage();
	});
	document.getElementById('form').addEventListener('submit', function(ev) {
		ev.preventDefault();
		open_in_current_tab();
	});

	// Main interaction.
	document.getElementById('form').addEventListener('input', function(ev) {
		if (/^(uri|search_sep|hash_sep)$/.test(ev.target.id)) {
			full_uri_to_fields();
		} else {
			fields_to_full_uri();
		}
	});

	// Auto-size.
	document.getElementById('search').addEventListener('input', auto_size_textarea);
	document.getElementById('hash').addEventListener('input', auto_size_textarea);

	// Keyboard shortcuts.
	window.addEventListener('keydown', keydown_handler);
}

// This script is being included with the "defer" attribute, which means it
// will only be executed after the document has been parsed.
DEFAULT_ERROR_REPORTER = alert_error_reporter;
init();
