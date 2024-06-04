#!/bin/bash

# Generates many PNG icon files based on a single SVG file.
#
# Note: this function would benefit from running in parallel.

for color in white black gray lightgray darkgray dimgray ; do
	for size in 16 24 32 48 64 128 256 ; do
		name="icon-${color}-${size}.png"
		cat scalable-icon.svg | sed 's/fill="black"/fill="'"${color}"'"/' | rsvg-convert --width $size --height $size --output "z${name}" -
		zopflipng -y "z${name}" "${name}"
		rm "z${name}"
	done
done
