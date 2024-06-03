#!/bin/sh

rm -f crx-uri-splitter{,-chrome,-firefox}.zip

for browser in chrome firefox ; do
	cp -a "manifest-${browser}.json" "manifest.json"

	# -j junk (don't record) directory names
	zip -9Xj "crx-uri-splitter-${browser}.zip" \
		common.css \
		common.js \
		icon-dark-128.png \
		icon-dark-16.png \
		icon-dark-24.png \
		icon-dark-32.png \
		icon-dark-48.png \
		icon-light-128.png \
		icon-light-16.png \
		icon-light-24.png \
		icon-light-32.png \
		icon-light-48.png \
		manifest.json \
		options.html \
		options.js \
		popup.html \
		popup.js \
		punycode-v1.4.1.js \
		serviceworker.js
done
rm manifest.json
