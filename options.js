'use strict';

//////////////////////////////////////////////////////////////////////
// UI - status message.

var g_status_timeout = null;
function set_status(kind, msg) {
	var delay;
	if (kind == 'ok') {
		delay = 2000;
	} else if (kind == 'error') {
		delay = 60000;
	} else {
		throw new Error('Unrecognized kind: ' + kind + '.');
	}

	clear_status();

	var elem = document.getElementById('status');
	elem.textContent = msg;
	elem.classList.add(kind);

	g_status_timeout = setTimeout(clear_status, delay);
}
function clear_status() {
	clearTimeout(g_status_timeout);
	g_status_timeout = null;

	var elem = document.getElementById('status');
	elem.textContent = '';
	elem.classList.remove('ok', 'error');
}

function simple_error_reporter(err) {
	console.error(err);
	set_status('error', err.message);
}

//////////////////////////////////////////////////////////////////////
// UI - instantaneous feedback for font update

function apply_font_style(event_or_id) {
	var id;
	var input_element;

	// For convenience, this function supports two values for the argument.
	if (typeof event_or_id === 'string') {
		id = event_or_id;
		input_element = document.getElementById(id);
	} else {
		input_element = event.target;
		id = input_element.id;
	}

	if (!input_element.checkValidity()) {
		return;
	}

	var value = input_element.value;
	var style_templates = {
		// Warning: These styles are copy-pasted also in popup.js.
		'input_font': `
			input[type="email"],
			input[type="number"],
			input[type="password"],
			input[type="text"],
			input[type="url"] {
				font: ${value};
			}
		`,
		'textarea_font': `
			textarea {
				font: ${value};
			}
		`,
	};

	var text = style_templates[id];
	if (!text) {
		throw new Error('Invalid id');
	}
	var style_element = document.getElementById(id + '_style');
	style_element.textContent = text;

	if (id === 'textarea_font') {
		for (let name of g_datalist_names) {
			auto_size_textarea(document.getElementById(name));
		}
	}
}

//////////////////////////////////////////////////////////////////////
// Misc.

// Save the value of the datalist that was changed.
function datalist_save(ev) {
	var elem = ev.target;
	var name = elem.id;
	var data = {};
	data[name] = elem.value.trim().split(/\s*\n\s*/);
	save_options('sync', data).then(function() {
		set_status('ok', 'Saved');
	}, simple_error_reporter);
}

// Save the value of the changed option.
// Also reset the value to default in case the value is invalid.
function other_option_save(ev) {
	var elem = ev.target;
	var name = elem.name || elem.id;
	var value = elem.type.toLowerCase() === 'radio' ? input_value(elem.name) : input_value(elem);
	var is_valid= elem.checkValidity();
	var data = {};

	if (is_valid) {
		data[name] = value;
	} else {
		data[name] = g_default_options[name];
	}
	save_options('sync', data).then(function() {
		set_status('ok', (is_valid ? 'Saved' : 'Option reset'));
	}, simple_error_reporter);
}

function init() {
	detect_platform();

	let options_form = document.getElementById('options_form');
	load_options('sync', [].concat(g_datalist_names, g_other_options_names)).then(function(items) {
		for (let name of g_datalist_names) {
			let loaded_data = items[name];
			let elem = options_form[name];
			elem.value = loaded_data.map(
				item => ('' + item).trim()
			).filter(
				item => item.length > 0
			).join('\n');
			elem.addEventListener('input', auto_size_textarea);
			elem.addEventListener('input', debounce(1000, datalist_save));
			auto_size_textarea(elem);
		}
		for (let name of g_other_options_names) {
			let loaded_data = items[name];
			input_value(name, loaded_data);
			let elem = options_form[name];
			// Either a RadioNodeList, or a new Array of a single element.
			let elems = elem.length ? elem : [elem];
			for (let node of elems) {
				let event_name = 'input';
				if (/^(checkbox|radio)$/i.test(node.type)) {
					event_name = 'click';
				}
				node.addEventListener(event_name, debounce(1000, other_option_save));
			}
		}
		apply_font_style('input_font');
		apply_font_style('textarea_font');
		document.getElementById('input_font').addEventListener('input', apply_font_style);
		document.getElementById('textarea_font').addEventListener('input', apply_font_style);
		apply_ui_theme(items.ui_theme);
		for (let radio of options_form['ui_theme']) {
			radio.addEventListener('click', () => apply_ui_theme(options_form['ui_theme'].value));
		}
		apply_icon_theme(items.icon_theme);
		for (let radio of options_form['icon_theme']) {
			radio.addEventListener('click', () => apply_icon_theme(options_form['icon_theme'].value));
		}
	}, simple_error_reporter);

	if (chrome.commands && chrome.commands.getAll) {
		chrome.commands.getAll(function(cmds) {
			var output = document.getElementById('shortcut_key');
			if (!output) return;
			for (let cmd of cmds) {
				if (cmd.name = '_execute_browser_action') {
					output.value = cmd.shortcut || '(none)';
					return;
				}
			}
			output.value = '(unknown)';
			return;
		});
	} else {
		// Not supported in Firefox Android.
		// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/commands
		var output = document.getElementById('shortcut_key');
		if (output) {
			output.value = '(unsupported on this platform)';
		}
	}

	// Links to chrome:// are blocked by the browser, so I need these event
	// handler functions to make them work as the user would expect.
	document.getElementById('link_to_configurecommands').addEventListener('click', function(ev) {
		var url = ev.target.href;
		if (ev.shiftKey) {
			if (ev.ctrlKey || ev.metaKey) {
				open_url_in_new_tab(url);
				ev.preventDefault();
			} else {
				open_url_in_new_window(url);
				ev.preventDefault();
			}
		} else {
			if (ev.ctrlKey || ev.metaKey) {
				open_url_in_new_background_tab(url);
				ev.preventDefault();
			} else {
				open_url_in_this_tab(url);
				ev.preventDefault();
			}
		}
	});
	document.getElementById('link_to_configurecommands').addEventListener('auxclick', function(ev) {
		var url = ev.target.href;
		open_url_in_new_background_tab(url);
		ev.preventDefault();
	});
}

// This script is being included with the "defer" attribute, which means it
// will only be executed after the document has been parsed.
DEFAULT_ERROR_REPORTER = simple_error_reporter;
init();
