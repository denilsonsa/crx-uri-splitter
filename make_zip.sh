#!/bin/sh

rm -f crx-uri-splitter{,-chrome,-firefox}.zip

for browser in chrome firefox ; do
	cp -a "manifest-${browser}.json" "manifest.json"

	zip -9X "crx-uri-splitter-${browser}.zip" \
		common.css \
		common.js \
		icons/icon-*.png \
		manifest.json \
		options.html \
		options.js \
		popup.html \
		popup.js \
		punycode-v1.4.1.js \
		serviceworker.js
done
rm manifest.json
