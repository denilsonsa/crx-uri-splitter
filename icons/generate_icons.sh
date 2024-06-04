#!/bin/sh

for color in white black gray lightgray darkgray dimgray ; do
	for size in 16 24 32 48 64 128 256 ; do
		cat scalable-icon.svg | sed 's/fill="black"/fill="'"${color}"'"/' | rsvg-convert --width $size --height $size --output "icon-${color}-${size}.png" -
	done
done
