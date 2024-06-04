#!/bin/bash

# Generates many PNG icon files based on a single SVG file.

generate_icon() {
	local color size name sedexpr

	color="$1"
	size="$2"
	name="icon-${color}-${size}.png"

	if [ "${color}" = "logo" ] ; then
		sedexpr=''
	else
		sedexpr='
			s/fill="black"/fill="'"${color}"'"/
			s/stroke-width="[0-9.]*"/stroke-width="0"/
		'
	fi

	sed "${sedexpr}" scalable-icon.svg | rsvg-convert --width $size --height $size --output "z${name}" -
	zopflipng -y "z${name}" "${name}"
	rm "z${name}"
}

for size in 16 24 32 48 64 128 256 ; do
	for color in logo black dimgray gray silver white ; do
		# Generating all colors of the same size in parallel.
		generate_icon "$color" "$size" &
	done
	# And waiting to avoid running too many parallel tasks.
	# This isn't the best nor the correct way to parallelize,
	# but it's a quick and simple solution that works well.
	wait
done
