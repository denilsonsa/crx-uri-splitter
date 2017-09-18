#!/bin/sh

rm -f crx-uri-splitter.zip
# -j junk (don't record) directory names
zip -9Xj crx-uri-splitter.zip \
	common.css \
	common.js \
	icon128.png \
	icon16.png \
	icon24.png \
	icon32.png \
	icon48.png \
	manifest.json \
	options.html \
	options.js \
	popup.html \
	popup.js \
	punycode-v1.4.1.js
