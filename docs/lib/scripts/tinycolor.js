function w3color(t, e) {
	return this instanceof w3color
		? "object" == typeof t
			? t
			: (this.attachValues(toColorObject(t)),
			  void (e && (e.style.backgroundColor = this.toRgbString())))
		: new w3color(t, e);
}
function toColorObject(t) {
	var e,
		r,
		a,
		n,
		i,
		s,
		o,
		h,
		f,
		u,
		l,
		c = [],
		b = [],
		d = [];
	if (
		((e = (t = w3trim(t.toLowerCase())).substr(0, 1).toUpperCase()),
		(r = t.substr(1)),
		(h = 1),
		("R" != e &&
			"Y" != e &&
			"G" != e &&
			"C" != e &&
			"B" != e &&
			"M" != e &&
			"W" != e) ||
			isNaN(r) ||
			((6 != t.length || -1 != t.indexOf(",")) &&
				(t = "ncol(" + t + ")")),
		3 == t.length || 6 == t.length || isNaN(t) || (t = "ncol(" + t + ")"),
		t.indexOf(",") > 0 && -1 == t.indexOf("(") && (t = "ncol(" + t + ")"),
		"rgb" == t.substr(0, 3) ||
			"hsl" == t.substr(0, 3) ||
			"hwb" == t.substr(0, 3) ||
			"ncol" == t.substr(0, 4) ||
			"cmyk" == t.substr(0, 4))
	) {
		if (
			("ncol" == t.substr(0, 4)
				? (4 == t.split(",").length &&
						-1 == t.indexOf("ncola") &&
						(t = t.replace("ncol", "ncola")),
				  (a = "ncol"),
				  (t = t.substr(4)))
				: "cmyk" == t.substr(0, 4)
				? ((a = "cmyk"), (t = t.substr(4)))
				: ((a = t.substr(0, 3)), (t = t.substr(3))),
			(n = 3),
			(s = !1),
			"a" == t.substr(0, 1).toLowerCase()
				? ((n = 4), (s = !0), (t = t.substr(1)))
				: "cmyk" == a &&
				  ((n = 4), 5 == t.split(",").length && ((n = 5), (s = !0))),
			(c = (t = (t = t.replace("(", "")).replace(")", "")).split(",")),
			"rgb" == a)
		) {
			if (c.length != n) return emptyObject();
			for (i = 0; i < n; i++) {
				if (
					(("" == c[i] || " " == c[i]) && (c[i] = "0"),
					c[i].indexOf("%") > -1 &&
						((c[i] = c[i].replace("%", "")),
						(c[i] = Number(c[i] / 100)),
						i < 3 && (c[i] = Math.round(255 * c[i]))),
					isNaN(c[i]))
				)
					return emptyObject();
				parseInt(c[i]) > 255 && (c[i] = 255),
					i < 3 && (c[i] = parseInt(c[i])),
					3 == i && Number(c[i]) > 1 && (c[i] = 1);
			}
			(l = { r: c[0], g: c[1], b: c[2] }), 1 == s && (h = Number(c[3]));
		}
		if ("hsl" == a || "hwb" == a || "ncol" == a) {
			for (; c.length < n; ) c.push("0");
			for (
				("hsl" == a || "hwb" == a) &&
					parseInt(c[0]) >= 360 &&
					(c[0] = 0),
					i = 1;
				i < n;
				i++
			) {
				if (c[i].indexOf("%") > -1) {
					if (
						((c[i] = c[i].replace("%", "")),
						(c[i] = Number(c[i])),
						isNaN(c[i]))
					)
						return emptyObject();
					c[i] = c[i] / 100;
				} else c[i] = Number(c[i]);
				Number(c[i]) > 1 && (c[i] = 1), 0 > Number(c[i]) && (c[i] = 0);
			}
			"hsl" == a &&
				((l = hslToRgb(c[0], c[1], c[2])),
				(f = Number(c[0])),
				(u = Number(c[1]))),
				"hwb" == a && (l = hwbToRgb(c[0], c[1], c[2])),
				"ncol" == a && (l = ncolToRgb(c[0], c[1], c[2])),
				1 == s && (h = Number(c[3]));
		}
		if ("cmyk" == a) {
			for (; c.length < n; ) c.push("0");
			for (i = 0; i < n; i++) {
				if (c[i].indexOf("%") > -1) {
					if (
						((c[i] = c[i].replace("%", "")),
						(c[i] = Number(c[i])),
						isNaN(c[i]))
					)
						return emptyObject();
					c[i] = c[i] / 100;
				} else c[i] = Number(c[i]);
				Number(c[i]) > 1 && (c[i] = 1), 0 > Number(c[i]) && (c[i] = 0);
			}
			(l = cmykToRgb(c[0], c[1], c[2], c[3])),
				1 == s && (h = Number(c[4]));
		}
	} else if ("ncs" == t.substr(0, 3)) l = ncsToRgb(t);
	else {
		for (i = 0, o = !1, b = getColorArr("names"); i < b.length; i++)
			if (t.toLowerCase() == b[i].toLowerCase()) {
				(d = getColorArr("hexs")),
					(o = !0),
					(l = {
						r: parseInt(d[i].substr(0, 2), 16),
						g: parseInt(d[i].substr(2, 2), 16),
						b: parseInt(d[i].substr(4, 2), 16),
					});
				break;
			}
		if (0 == o) {
			for (
				3 == (t = t.replace("#", "")).length &&
					(t =
						t.substr(0, 1) +
						t.substr(0, 1) +
						t.substr(1, 1) +
						t.substr(1, 1) +
						t.substr(2, 1) +
						t.substr(2, 1)),
					i = 0;
				i < t.length;
				i++
			)
				if (!isHex(t.substr(i, 1))) return emptyObject();
			for (
				i = 0,
					c[0] = parseInt(t.substr(0, 2), 16),
					c[1] = parseInt(t.substr(2, 2), 16),
					c[2] = parseInt(t.substr(4, 2), 16);
				i < 3;
				i++
			)
				if (isNaN(c[i])) return emptyObject();
			l = { r: c[0], g: c[1], b: c[2] };
		}
	}
	return colorObject(l, h, f, u);
}
function colorObject(t, e, r, a) {
	var n, i, s, o, h, f;
	return t
		? (null === e && (e = 1),
		  (n = rgbToHsl(t.r, t.g, t.b)),
		  (i = rgbToHwb(t.r, t.g, t.b)),
		  (s = rgbToCmyk(t.r, t.g, t.b)),
		  (h = r || n.h),
		  (f = a || n.s),
		  (o = hueToNcol(h)),
		  roundDecimals({
				red: t.r,
				green: t.g,
				blue: t.b,
				hue: h,
				sat: f,
				lightness: n.l,
				whiteness: i.w,
				blackness: i.b,
				cyan: s.c,
				magenta: s.m,
				yellow: s.y,
				black: s.k,
				ncol: o,
				opacity: e,
				valid: !0,
		  }))
		: emptyObject();
}
function emptyObject() {
	return {
		red: 0,
		green: 0,
		blue: 0,
		hue: 0,
		sat: 0,
		lightness: 0,
		whiteness: 0,
		blackness: 0,
		cyan: 0,
		magenta: 0,
		yellow: 0,
		black: 0,
		ncol: "R",
		opacity: 1,
		valid: !1,
	};
}
function getColorArr(t) {
	return "names" == t
		? [
				"AliceBlue",
				"AntiqueWhite",
				"Aqua",
				"Aquamarine",
				"Azure",
				"Beige",
				"Bisque",
				"Black",
				"BlanchedAlmond",
				"Blue",
				"BlueViolet",
				"Brown",
				"BurlyWood",
				"CadetBlue",
				"Chartreuse",
				"Chocolate",
				"Coral",
				"CornflowerBlue",
				"Cornsilk",
				"Crimson",
				"Cyan",
				"DarkBlue",
				"DarkCyan",
				"DarkGoldenRod",
				"DarkGray",
				"DarkGrey",
				"DarkGreen",
				"DarkKhaki",
				"DarkMagenta",
				"DarkOliveGreen",
				"DarkOrange",
				"DarkOrchid",
				"DarkRed",
				"DarkSalmon",
				"DarkSeaGreen",
				"DarkSlateBlue",
				"DarkSlateGray",
				"DarkSlateGrey",
				"DarkTurquoise",
				"DarkViolet",
				"DeepPink",
				"DeepSkyBlue",
				"DimGray",
				"DimGrey",
				"DodgerBlue",
				"FireBrick",
				"FloralWhite",
				"ForestGreen",
				"Fuchsia",
				"Gainsboro",
				"GhostWhite",
				"Gold",
				"GoldenRod",
				"Gray",
				"Grey",
				"Green",
				"GreenYellow",
				"HoneyDew",
				"HotPink",
				"IndianRed",
				"Indigo",
				"Ivory",
				"Khaki",
				"Lavender",
				"LavenderBlush",
				"LawnGreen",
				"LemonChiffon",
				"LightBlue",
				"LightCoral",
				"LightCyan",
				"LightGoldenRodYellow",
				"LightGray",
				"LightGrey",
				"LightGreen",
				"LightPink",
				"LightSalmon",
				"LightSeaGreen",
				"LightSkyBlue",
				"LightSlateGray",
				"LightSlateGrey",
				"LightSteelBlue",
				"LightYellow",
				"Lime",
				"LimeGreen",
				"Linen",
				"Magenta",
				"Maroon",
				"MediumAquaMarine",
				"MediumBlue",
				"MediumOrchid",
				"MediumPurple",
				"MediumSeaGreen",
				"MediumSlateBlue",
				"MediumSpringGreen",
				"MediumTurquoise",
				"MediumVioletRed",
				"MidnightBlue",
				"MintCream",
				"MistyRose",
				"Moccasin",
				"NavajoWhite",
				"Navy",
				"OldLace",
				"Olive",
				"OliveDrab",
				"Orange",
				"OrangeRed",
				"Orchid",
				"PaleGoldenRod",
				"PaleGreen",
				"PaleTurquoise",
				"PaleVioletRed",
				"PapayaWhip",
				"PeachPuff",
				"Peru",
				"Pink",
				"Plum",
				"PowderBlue",
				"Purple",
				"RebeccaPurple",
				"Red",
				"RosyBrown",
				"RoyalBlue",
				"SaddleBrown",
				"Salmon",
				"SandyBrown",
				"SeaGreen",
				"SeaShell",
				"Sienna",
				"Silver",
				"SkyBlue",
				"SlateBlue",
				"SlateGray",
				"SlateGrey",
				"Snow",
				"SpringGreen",
				"SteelBlue",
				"Tan",
				"Teal",
				"Thistle",
				"Tomato",
				"Turquoise",
				"Violet",
				"Wheat",
				"White",
				"WhiteSmoke",
				"Yellow",
				"YellowGreen",
		  ]
		: "hexs" == t
		? [
				"f0f8ff",
				"faebd7",
				"00ffff",
				"7fffd4",
				"f0ffff",
				"f5f5dc",
				"ffe4c4",
				"000000",
				"ffebcd",
				"0000ff",
				"8a2be2",
				"a52a2a",
				"deb887",
				"5f9ea0",
				"7fff00",
				"d2691e",
				"ff7f50",
				"6495ed",
				"fff8dc",
				"dc143c",
				"00ffff",
				"00008b",
				"008b8b",
				"b8860b",
				"a9a9a9",
				"a9a9a9",
				"006400",
				"bdb76b",
				"8b008b",
				"556b2f",
				"ff8c00",
				"9932cc",
				"8b0000",
				"e9967a",
				"8fbc8f",
				"483d8b",
				"2f4f4f",
				"2f4f4f",
				"00ced1",
				"9400d3",
				"ff1493",
				"00bfff",
				"696969",
				"696969",
				"1e90ff",
				"b22222",
				"fffaf0",
				"228b22",
				"ff00ff",
				"dcdcdc",
				"f8f8ff",
				"ffd700",
				"daa520",
				"808080",
				"808080",
				"008000",
				"adff2f",
				"f0fff0",
				"ff69b4",
				"cd5c5c",
				"4b0082",
				"fffff0",
				"f0e68c",
				"e6e6fa",
				"fff0f5",
				"7cfc00",
				"fffacd",
				"add8e6",
				"f08080",
				"e0ffff",
				"fafad2",
				"d3d3d3",
				"d3d3d3",
				"90ee90",
				"ffb6c1",
				"ffa07a",
				"20b2aa",
				"87cefa",
				"778899",
				"778899",
				"b0c4de",
				"ffffe0",
				"00ff00",
				"32cd32",
				"faf0e6",
				"ff00ff",
				"800000",
				"66cdaa",
				"0000cd",
				"ba55d3",
				"9370db",
				"3cb371",
				"7b68ee",
				"00fa9a",
				"48d1cc",
				"c71585",
				"191970",
				"f5fffa",
				"ffe4e1",
				"ffe4b5",
				"ffdead",
				"000080",
				"fdf5e6",
				"808000",
				"6b8e23",
				"ffa500",
				"ff4500",
				"da70d6",
				"eee8aa",
				"98fb98",
				"afeeee",
				"db7093",
				"ffefd5",
				"ffdab9",
				"cd853f",
				"ffc0cb",
				"dda0dd",
				"b0e0e6",
				"800080",
				"663399",
				"ff0000",
				"bc8f8f",
				"4169e1",
				"8b4513",
				"fa8072",
				"f4a460",
				"2e8b57",
				"fff5ee",
				"a0522d",
				"c0c0c0",
				"87ceeb",
				"6a5acd",
				"708090",
				"708090",
				"fffafa",
				"00ff7f",
				"4682b4",
				"d2b48c",
				"008080",
				"d8bfd8",
				"ff6347",
				"40e0d0",
				"ee82ee",
				"f5deb3",
				"ffffff",
				"f5f5f5",
				"ffff00",
				"9acd32",
		  ]
		: void 0;
}
function roundDecimals(t) {
	return (
		(t.red = Number(t.red.toFixed(0))),
		(t.green = Number(t.green.toFixed(0))),
		(t.blue = Number(t.blue.toFixed(0))),
		(t.hue = Number(t.hue.toFixed(0))),
		(t.sat = Number(t.sat.toFixed(2))),
		(t.lightness = Number(t.lightness.toFixed(2))),
		(t.whiteness = Number(t.whiteness.toFixed(2))),
		(t.blackness = Number(t.blackness.toFixed(2))),
		(t.cyan = Number(t.cyan.toFixed(2))),
		(t.magenta = Number(t.magenta.toFixed(2))),
		(t.yellow = Number(t.yellow.toFixed(2))),
		(t.black = Number(t.black.toFixed(2))),
		(t.ncol = t.ncol.substr(0, 1) + Math.round(Number(t.ncol.substr(1)))),
		(t.opacity = Number(t.opacity.toFixed(2))),
		t
	);
}
function hslToRgb(t, e, r) {
	var a, n;
	return {
		r:
			255 *
			hueToRgb(
				(a = 2 * r - (n = r <= 0.5 ? r * (e + 1) : r + e - r * e)),
				n,
				(t /= 60) + 2
			),
		g: 255 * hueToRgb(a, n, t),
		b: 255 * hueToRgb(a, n, t - 2),
	};
}
function hueToRgb(t, e, r) {
	return (
		r < 0 && (r += 6),
		r >= 6 && (r -= 6),
		r < 1 ? (e - t) * r + t : r < 3 ? e : r < 4 ? (e - t) * (4 - r) + t : t
	);
}
function hwbToRgb(t, e, r) {
	var a,
		n,
		i,
		s = [];
	for (
		n = hslToRgb(t, 1, 0.5),
			s[0] = n.r / 255,
			s[1] = n.g / 255,
			s[2] = n.b / 255,
			(i = e + r) > 1 &&
				((e = Number((e / i).toFixed(2))),
				(r = Number((r / i).toFixed(2)))),
			a = 0;
		a < 3;
		a++
	)
		(s[a] *= 1 - e - r), (s[a] += e), (s[a] = Number(255 * s[a]));
	return { r: s[0], g: s[1], b: s[2] };
}
function cmykToRgb(t, e, r, a) {
	return {
		r: 255 - 255 * Math.min(1, t * (1 - a) + a),
		g: 255 - 255 * Math.min(1, e * (1 - a) + a),
		b: 255 - 255 * Math.min(1, r * (1 - a) + a),
	};
}
function ncolToRgb(t, e, r) {
	var a, n, i;
	if (((i = t), isNaN(t.substr(0, 1)))) {
		if (
			((a = t.substr(0, 1).toUpperCase()),
			"" == (n = t.substr(1)) && (n = 0),
			isNaN((n = Number(n))))
		)
			return !1;
		"R" == a && (i = 0 + 0.6 * n),
			"Y" == a && (i = 60 + 0.6 * n),
			"G" == a && (i = 120 + 0.6 * n),
			"C" == a && (i = 180 + 0.6 * n),
			"B" == a && (i = 240 + 0.6 * n),
			"M" == a && (i = 300 + 0.6 * n),
			"W" == a && ((i = 0), (e = 1 - n / 100), (r = n / 100));
	}
	return hwbToRgb(i, e, r);
}
function hueToNcol(t) {
	for (; t >= 360; ) t -= 360;
	return t < 60
		? "R" + t / 0.6
		: t < 120
		? "Y" + (t - 60) / 0.6
		: t < 180
		? "G" + (t - 120) / 0.6
		: t < 240
		? "C" + (t - 180) / 0.6
		: t < 300
		? "B" + (t - 240) / 0.6
		: t < 360
		? "M" + (t - 300) / 0.6
		: void 0;
}
function ncsToRgb(t) {
	var e, r, a, n, i, s, o, h, f, u, l, c, b, d, g, m, p;
	return (
		-1 ==
			(t = (t = (t = (t = (t = w3trim(t).toUpperCase()).replace(
				"(",
				""
			)).replace(")", "")).replace("NCS", "NCS ")).replace(
				/  /g,
				" "
			)).indexOf("NCS") && (t = "NCS " + t),
		null !==
			(t = t.match(
				/^(?:NCS|NCS\sS)\s(\d{2})(\d{2})-(N|[A-Z])(\d{2})?([A-Z])?$/
			)) &&
			((e = parseInt(t[1], 10)),
			(r = parseInt(t[2], 10)),
			("N" == (a = t[3]) ||
				"Y" == a ||
				"R" == a ||
				"B" == a ||
				"G" == a) &&
				((n = parseInt(t[4], 10) || 0),
				"N" !== a
					? ((i = 1.05 * e - 5.25),
					  (s = r),
					  "Y" === a && n <= 60
							? (o = 1)
							: ("Y" === a && n > 60) || ("R" === a && n <= 80)
							? (o =
									(Math.sqrt(
										14884 -
											Math.pow(
												(h =
													"Y" === a
														? n - 60
														: n + 40),
												2
											)
									) -
										22) /
									100)
							: ("R" === a && n > 80) || "B" === a
							? (o = 0)
							: "G" === a &&
							  (o =
									(Math.sqrt(
										33800 - Math.pow((h = n - 170), 2)
									) -
										70) /
									100),
					  "Y" === a && n <= 80
							? (f = 0)
							: ("Y" === a && n > 80) || ("R" === a && n <= 60)
							? (f =
									(104 -
										Math.sqrt(
											11236 -
												Math.pow(
													(h =
														"Y" === a
															? n - 80 + 20.5
															: n + 20 + 20.5),
													2
												)
										)) /
									100)
							: ("R" === a && n > 60) || ("B" === a && n <= 80)
							? (f =
									(Math.sqrt(
										1e4 -
											Math.pow(
												(h =
													"R" === a
														? n - 60 - 60
														: n + 40 - 60),
												2
											)
									) -
										10) /
									100)
							: ("B" === a && n > 80) || ("G" === a && n <= 40)
							? (f =
									(122 -
										Math.sqrt(
											19881 -
												Math.pow(
													(h =
														"B" === a
															? n - 80 - 131
															: n + 20 - 131),
													2
												)
										)) /
									100)
							: "G" === a && n > 40 && (f = 0),
					  "Y" === a
							? (green1 = (85 - 0.85 * n) / 100)
							: "R" === a && n <= 60
							? (green1 = 0)
							: "R" === a && n > 60
							? (green1 =
									(67.5 -
										Math.sqrt(
											5776 -
												Math.pow((h = n - 60 + 35), 2)
										)) /
									100)
							: "B" === a && n <= 60
							? (green1 =
									(6.5 +
										Math.sqrt(
											7044.5 -
												Math.pow((h = 1 * n - 68.5), 2)
										)) /
									100)
							: ("B" === a && n > 60) || ("G" === a && n <= 60)
							? (green1 = 0.9)
							: "G" === a &&
							  n > 60 &&
							  (green1 = (90 - (1 / 8) * (h = n - 60)) / 100),
					  (u =
							(((h = (o + green1 + f) / 3) - o) * (100 - s)) /
								100 +
							o),
					  (c = ((h - f) * (100 - s)) / 100 + f),
					  (b =
							1 /
							(u >
								(l =
									((h - green1) * (100 - s)) / 100 +
									green1) && u > c
								? u
								: l > u && l > c
								? l
								: c > u && c > l
								? c
								: (u + l + c) / 3)),
					  (g = parseInt(((u * b * (100 - i)) / 100) * 255, 10)) >
							255 && (g = 255),
					  (m = parseInt(((l * b * (100 - i)) / 100) * 255, 10)) >
							255 && (m = 255),
					  (p = parseInt(((c * b * (100 - i)) / 100) * 255, 10)) >
							255 && (p = 255),
					  g < 0 && (g = 0),
					  m < 0 && (m = 0),
					  p < 0 && (p = 0))
					: ((d = parseInt(255 * (1 - e / 100), 10)) > 255 &&
							(d = 255),
					  d < 0 && (d = 0),
					  (g = d),
					  (m = d),
					  (p = d)),
				{ r: g, g: m, b: p }))
	);
}
function rgbToHsl(t, e, r) {
	var a,
		n,
		i,
		s,
		o,
		h,
		f = [];
	for (
		i = 0,
			f[0] = t / 255,
			f[1] = e / 255,
			f[2] = r / 255,
			a = f[0],
			n = f[0],
			o = 0;
		i < f.length - 1;
		i++
	)
		f[i + 1] <= a && (a = f[i + 1]),
			f[i + 1] >= n && ((n = f[i + 1]), (o = i + 1));
	return (
		0 == o && (h = (f[1] - f[2]) / (n - a)),
		1 == o && (h = 2 + (f[2] - f[0]) / (n - a)),
		2 == o && (h = 4 + (f[0] - f[1]) / (n - a)),
		isNaN(h) && (h = 0),
		(h *= 60) < 0 && (h += 360),
		(s = (a + n) / 2),
		{
			h: h,
			s: a == n ? 0 : s < 0.5 ? (n - a) / (n + a) : (n - a) / (2 - n - a),
			l: s,
		}
	);
}
function rgbToHwb(t, e, r) {
	return (
		(t /= 255),
		(e /= 255),
		(r /= 255),
		{
			h:
				0 ==
				(chroma = (max = Math.max(t, e, r)) - (min = Math.min(t, e, r)))
					? 0
					: t == max
					? (((e - r) / chroma) % 6) * 360
					: e == max
					? (((r - t) / chroma + 2) % 6) * 360
					: (((t - e) / chroma + 4) % 6) * 360,
			w: min,
			b: 1 - max,
		}
	);
}
function rgbToCmyk(t, e, r) {
	var a, n, i, s;
	return (
		(t /= 255),
		(e /= 255),
		(r /= 255),
		1 == (s = 1 - (max = Math.max(t, e, r)))
			? ((a = 0), (n = 0), (i = 0))
			: ((a = (1 - t - s) / (1 - s)),
			  (n = (1 - e - s) / (1 - s)),
			  (i = (1 - r - s) / (1 - s))),
		{ c: a, m: n, y: i, k: s }
	);
}
function toHex(t) {
	for (var e = t.toString(16); e.length < 2; ) e = "0" + e;
	return e;
}
function cl(t) {
	console.log(t);
}
function w3trim(t) {
	return t.replace(/^\s+|\s+$/g, "");
}
function isHex(t) {
	return "0123456789ABCDEFabcdef".indexOf(t) > -1;
}
function w3SetColorsByAttribute() {
	var t, e, r;
	for (e = 0, t = document.getElementsByTagName("*"); e < t.length; e++)
		(r = t[e].getAttribute("data-w3-color")) &&
			(t[e].style.backgroundColor = w3color(r).toRgbString());
}
!(function (t, e) {
	"object" == typeof exports && "undefined" != typeof module
		? (module.exports = e())
		: "function" == typeof define && define.amd
		? define(e)
		: ((t =
				"undefined" != typeof globalThis
					? globalThis
					: t || self).tinycolor = e());
})(this, function () {
	"use strict";
	function t(e) {
		return (t =
			"function" == typeof Symbol && "symbol" == typeof Symbol.iterator
				? function (t) {
						return typeof t;
				  }
				: function (t) {
						return t &&
							"function" == typeof Symbol &&
							t.constructor === Symbol &&
							t !== Symbol.prototype
							? "symbol"
							: typeof t;
				  })(e);
	}
	var e = /^\s+/,
		r = /\s+$/;
	function a(n, i) {
		if (((i = i || {}), (n = n || "") instanceof a)) return n;
		if (!(this instanceof a)) return new a(n, i);
		var s,
			o,
			h,
			f,
			u,
			l,
			c,
			b,
			d,
			g,
			m,
			p,
			y,
			M,
			v,
			x,
			A,
			R,
			H,
			G =
				((o = { r: 0, g: 0, b: 0 }),
				(h = 1),
				(f = null),
				null,
				(u = null),
				(l = !1),
				(c = !1),
				"string" == typeof (s = n) &&
					(s = (function (t) {
						t = t.replace(e, "").replace(r, "").toLowerCase();
						var a,
							n = !1;
						if (k[t]) (t = k[t]), (n = !0);
						else if ("transparent" == t)
							return { r: 0, g: 0, b: 0, a: 0, format: "name" };
						return (a = T.rgb.exec(t))
							? { r: a[1], g: a[2], b: a[3] }
							: (a = T.rgba.exec(t))
							? { r: a[1], g: a[2], b: a[3], a: a[4] }
							: (a = T.hsl.exec(t))
							? { h: a[1], s: a[2], l: a[3] }
							: (a = T.hsla.exec(t))
							? { h: a[1], s: a[2], l: a[3], a: a[4] }
							: (a = T.hsv.exec(t))
							? { h: a[1], s: a[2], v: a[3] }
							: (a = T.hsva.exec(t))
							? { h: a[1], s: a[2], v: a[3], a: a[4] }
							: (a = T.hex8.exec(t))
							? {
									r: S(a[1]),
									g: S(a[2]),
									b: S(a[3]),
									a: C(a[4]),
									format: n ? "name" : "hex8",
							  }
							: (a = T.hex6.exec(t))
							? {
									r: S(a[1]),
									g: S(a[2]),
									b: S(a[3]),
									format: n ? "name" : "hex",
							  }
							: (a = T.hex4.exec(t))
							? {
									r: S(a[1] + "" + a[1]),
									g: S(a[2] + "" + a[2]),
									b: S(a[3] + "" + a[3]),
									a: C(a[4] + "" + a[4]),
									format: n ? "name" : "hex8",
							  }
							: !!(a = T.hex3.exec(t)) && {
									r: S(a[1] + "" + a[1]),
									g: S(a[2] + "" + a[2]),
									b: S(a[3] + "" + a[3]),
									format: n ? "name" : "hex",
							  };
					})(s)),
				"object" == t(s) &&
					(F(s.r) && F(s.g) && F(s.b)
						? ((b = s.r),
						  (d = s.g),
						  (g = s.b),
						  (o = {
								r: 255 * w(b, 255),
								g: 255 * w(d, 255),
								b: 255 * w(g, 255),
						  }),
						  (l = !0),
						  (c = "%" === String(s.r).substr(-1) ? "prgb" : "rgb"))
						: F(s.h) && F(s.s) && F(s.v)
						? ((p = f = N(s.s)),
						  (y = N(s.v)),
						  (m = 6 * w((m = s.h), 360)),
						  (p = w(p, 100)),
						  (o = {
								r:
									255 *
									[
										(y = w(y, 100)),
										(A =
											y *
											(1 -
												(v = m - (M = Math.floor(m))) *
													p)),
										(x = y * (1 - p)),
										x,
										(R = y * (1 - (1 - v) * p)),
										y,
									][(H = M % 6)],
								g: 255 * [R, y, y, A, x, x][H],
								b: 255 * [x, x, R, y, y, A][H],
						  }),
						  (l = !0),
						  (c = "hsv"))
						: F(s.h) &&
						  F(s.s) &&
						  F(s.l) &&
						  ((f = N(s.s)),
						  (u = N(s.l)),
						  (o = (function (t, e, r) {
								var a, n, i;
								function s(t, e, r) {
									return (
										r < 0 && (r += 1),
										r > 1 && (r -= 1),
										r < 1 / 6
											? t + 6 * (e - t) * r
											: r < 0.5
											? e
											: r < 2 / 3
											? t + (e - t) * (2 / 3 - r) * 6
											: t
									);
								}
								if (
									((t = w(t, 360)),
									(e = w(e, 100)),
									(r = w(r, 100)),
									0 === e)
								)
									a = n = i = r;
								else {
									var o =
											r < 0.5
												? r * (1 + e)
												: r + e - r * e,
										h = 2 * r - o;
									(a = s(h, o, t + 1 / 3)),
										(n = s(h, o, t)),
										(i = s(h, o, t - 1 / 3));
								}
								return { r: 255 * a, g: 255 * n, b: 255 * i };
						  })(s.h, f, u)),
						  (l = !0),
						  (c = "hsl")),
					s.hasOwnProperty("a") && (h = s.a)),
				(h = _(h)),
				{
					ok: l,
					format: s.format || c,
					r: Math.min(255, Math.max(o.r, 0)),
					g: Math.min(255, Math.max(o.g, 0)),
					b: Math.min(255, Math.max(o.b, 0)),
					a: h,
				});
		(this._originalInput = n),
			(this._r = G.r),
			(this._g = G.g),
			(this._b = G.b),
			(this._a = G.a),
			(this._roundA = Math.round(100 * this._a) / 100),
			(this._format = i.format || G.format),
			(this._gradientType = i.gradientType),
			this._r < 1 && (this._r = Math.round(this._r)),
			this._g < 1 && (this._g = Math.round(this._g)),
			this._b < 1 && (this._b = Math.round(this._b)),
			(this._ok = G.ok);
	}
	function n(t, e, r) {
		(t = w(t, 255)), (e = w(e, 255)), (r = w(r, 255));
		var a,
			n,
			i = Math.max(t, e, r),
			s = Math.min(t, e, r),
			o = (i + s) / 2;
		if (i == s) a = n = 0;
		else {
			var h = i - s;
			switch (((n = o > 0.5 ? h / (2 - i - s) : h / (i + s)), i)) {
				case t:
					a = (e - r) / h + (e < r ? 6 : 0);
					break;
				case e:
					a = (r - t) / h + 2;
					break;
				case r:
					a = (t - e) / h + 4;
			}
			a /= 6;
		}
		return { h: a, s: n, l: o };
	}
	function i(t, e, r) {
		(t = w(t, 255)), (e = w(e, 255)), (r = w(r, 255));
		var a,
			n,
			i = Math.max(t, e, r),
			s = Math.min(t, e, r),
			o = i - s;
		if (((n = 0 === i ? 0 : o / i), i == s)) a = 0;
		else {
			switch (i) {
				case t:
					a = (e - r) / o + (e < r ? 6 : 0);
					break;
				case e:
					a = (r - t) / o + 2;
					break;
				case r:
					a = (t - e) / o + 4;
			}
			a /= 6;
		}
		return { h: a, s: n, v: i };
	}
	function s(t, e, r, a) {
		var n = [
			A(Math.round(t).toString(16)),
			A(Math.round(e).toString(16)),
			A(Math.round(r).toString(16)),
		];
		return a &&
			n[0].charAt(0) == n[0].charAt(1) &&
			n[1].charAt(0) == n[1].charAt(1) &&
			n[2].charAt(0) == n[2].charAt(1)
			? n[0].charAt(0) + n[1].charAt(0) + n[2].charAt(0)
			: n.join("");
	}
	function o(t, e, r, a) {
		return [
			A(R(a)),
			A(Math.round(t).toString(16)),
			A(Math.round(e).toString(16)),
			A(Math.round(r).toString(16)),
		].join("");
	}
	function h(t, e) {
		e = 0 === e ? 0 : e || 10;
		var r = a(t).toHsl();
		return (r.s -= e / 100), (r.s = x(r.s)), a(r);
	}
	function f(t, e) {
		e = 0 === e ? 0 : e || 10;
		var r = a(t).toHsl();
		return (r.s += e / 100), (r.s = x(r.s)), a(r);
	}
	function u(t) {
		return a(t).desaturate(100);
	}
	function l(t, e) {
		e = 0 === e ? 0 : e || 10;
		var r = a(t).toHsl();
		return (r.l += e / 100), (r.l = x(r.l)), a(r);
	}
	function c(t, e) {
		e = 0 === e ? 0 : e || 10;
		var r = a(t).toRgb();
		return (
			(r.r = Math.max(
				0,
				Math.min(255, r.r - Math.round((-e / 100) * 255))
			)),
			(r.g = Math.max(
				0,
				Math.min(255, r.g - Math.round((-e / 100) * 255))
			)),
			(r.b = Math.max(
				0,
				Math.min(255, r.b - Math.round((-e / 100) * 255))
			)),
			a(r)
		);
	}
	function b(t, e) {
		e = 0 === e ? 0 : e || 10;
		var r = a(t).toHsl();
		return (r.l -= e / 100), (r.l = x(r.l)), a(r);
	}
	function d(t, e) {
		var r = a(t).toHsl(),
			n = (r.h + e) % 360;
		return (r.h = n < 0 ? 360 + n : n), a(r);
	}
	function g(t) {
		var e = a(t).toHsl();
		return (e.h = (e.h + 180) % 360), a(e);
	}
	function m(t, e) {
		if (isNaN(e) || e <= 0)
			throw Error("Argument to polyad must be a positive number");
		for (var r = a(t).toHsl(), n = [a(t)], i = 360 / e, s = 1; s < e; s++)
			n.push(a({ h: (r.h + s * i) % 360, s: r.s, l: r.l }));
		return n;
	}
	function p(t) {
		var e = a(t).toHsl(),
			r = e.h;
		return [
			a(t),
			a({ h: (r + 72) % 360, s: e.s, l: e.l }),
			a({ h: (r + 216) % 360, s: e.s, l: e.l }),
		];
	}
	function y(t, e, r) {
		(e = e || 6), (r = r || 30);
		var n = a(t).toHsl(),
			i = 360 / r,
			s = [a(t)];
		for (n.h = (n.h - ((i * e) >> 1) + 720) % 360; --e; )
			(n.h = (n.h + i) % 360), s.push(a(n));
		return s;
	}
	function M(t, e) {
		e = e || 6;
		for (
			var r = a(t).toHsv(), n = r.h, i = r.s, s = r.v, o = [], h = 1 / e;
			e--;

		)
			o.push(a({ h: n, s: i, v: s })), (s = (s + h) % 1);
		return o;
	}
	(a.prototype = {
		isDark: function () {
			return 128 > this.getBrightness();
		},
		isLight: function () {
			return !this.isDark();
		},
		isValid: function () {
			return this._ok;
		},
		getOriginalInput: function () {
			return this._originalInput;
		},
		getFormat: function () {
			return this._format;
		},
		getAlpha: function () {
			return this._a;
		},
		getBrightness: function () {
			var t = this.toRgb();
			return (299 * t.r + 587 * t.g + 114 * t.b) / 1e3;
		},
		getLuminance: function () {
			var t,
				e,
				r,
				a = this.toRgb();
			return (
				(t = a.r / 255),
				(e = a.g / 255),
				(r = a.b / 255),
				0.2126 *
					(t <= 0.03928
						? t / 12.92
						: Math.pow((t + 0.055) / 1.055, 2.4)) +
					0.7152 *
						(e <= 0.03928
							? e / 12.92
							: Math.pow((e + 0.055) / 1.055, 2.4)) +
					0.0722 *
						(r <= 0.03928
							? r / 12.92
							: Math.pow((r + 0.055) / 1.055, 2.4))
			);
		},
		setAlpha: function (t) {
			return (
				(this._a = _(t)),
				(this._roundA = Math.round(100 * this._a) / 100),
				this
			);
		},
		toHsv: function () {
			var t = i(this._r, this._g, this._b);
			return { h: 360 * t.h, s: t.s, v: t.v, a: this._a };
		},
		toHsvString: function () {
			var t = i(this._r, this._g, this._b),
				e = Math.round(360 * t.h),
				r = Math.round(100 * t.s),
				a = Math.round(100 * t.v);
			return 1 == this._a
				? "hsv(" + e + ", " + r + "%, " + a + "%)"
				: "hsva(" +
						e +
						", " +
						r +
						"%, " +
						a +
						"%, " +
						this._roundA +
						")";
		},
		toHsl: function () {
			var t = n(this._r, this._g, this._b);
			return { h: 360 * t.h, s: t.s, l: t.l, a: this._a };
		},
		toHslString: function () {
			var t = n(this._r, this._g, this._b),
				e = Math.round(360 * t.h),
				r = Math.round(100 * t.s),
				a = Math.round(100 * t.l);
			return 1 == this._a
				? "hsl(" + e + ", " + r + "%, " + a + "%)"
				: "hsla(" +
						e +
						", " +
						r +
						"%, " +
						a +
						"%, " +
						this._roundA +
						")";
		},
		toHex: function (t) {
			return s(this._r, this._g, this._b, t);
		},
		toHexString: function (t) {
			return "#" + this.toHex(t);
		},
		toHexNumber: function () {
			return Number("0x" + this.toHex());
		},
		toHex8: function (t) {
			var e, r, a, n, i, s;
			return (
				(e = this._r),
				(r = this._g),
				(a = this._b),
				(n = this._a),
				(i = t),
				(s = [
					A(Math.round(e).toString(16)),
					A(Math.round(r).toString(16)),
					A(Math.round(a).toString(16)),
					A(R(n)),
				]),
				i &&
				s[0].charAt(0) == s[0].charAt(1) &&
				s[1].charAt(0) == s[1].charAt(1) &&
				s[2].charAt(0) == s[2].charAt(1) &&
				s[3].charAt(0) == s[3].charAt(1)
					? s[0].charAt(0) +
					  s[1].charAt(0) +
					  s[2].charAt(0) +
					  s[3].charAt(0)
					: s.join("")
			);
		},
		toHex8String: function (t) {
			return "#" + this.toHex8(t);
		},
		toRgb: function () {
			return {
				r: Math.round(this._r),
				g: Math.round(this._g),
				b: Math.round(this._b),
				a: this._a,
			};
		},
		toRgbString: function () {
			return 1 == this._a
				? "rgb(" +
						Math.round(this._r) +
						", " +
						Math.round(this._g) +
						", " +
						Math.round(this._b) +
						")"
				: "rgba(" +
						Math.round(this._r) +
						", " +
						Math.round(this._g) +
						", " +
						Math.round(this._b) +
						", " +
						this._roundA +
						")";
		},
		toPercentageRgb: function () {
			return {
				r: Math.round(100 * w(this._r, 255)) + "%",
				g: Math.round(100 * w(this._g, 255)) + "%",
				b: Math.round(100 * w(this._b, 255)) + "%",
				a: this._a,
			};
		},
		toPercentageRgbString: function () {
			return 1 == this._a
				? "rgb(" +
						Math.round(100 * w(this._r, 255)) +
						"%, " +
						Math.round(100 * w(this._g, 255)) +
						"%, " +
						Math.round(100 * w(this._b, 255)) +
						"%)"
				: "rgba(" +
						Math.round(100 * w(this._r, 255)) +
						"%, " +
						Math.round(100 * w(this._g, 255)) +
						"%, " +
						Math.round(100 * w(this._b, 255)) +
						"%, " +
						this._roundA +
						")";
		},
		toName: function () {
			return 0 === this._a
				? "transparent"
				: !(this._a < 1 || !v[s(this._r, this._g, this._b, !0)]);
		},
		toFilter: function (t) {
			var e = "#" + o(this._r, this._g, this._b, this._a),
				r = e,
				n = this._gradientType ? "GradientType = 1, " : "";
			if (t) {
				var i = a(t);
				r = "#" + o(i._r, i._g, i._b, i._a);
			}
			return (
				"progid:DXImageTransform.Microsoft.gradient(" +
				n +
				"startColorstr=" +
				e +
				",endColorstr=" +
				r +
				")"
			);
		},
		toString: function (t) {
			var e = !!t;
			t = t || this._format;
			var r = !1,
				a = this._a < 1 && this._a >= 0;
			return e ||
				!a ||
				("hex" !== t &&
					"hex6" !== t &&
					"hex3" !== t &&
					"hex4" !== t &&
					"hex8" !== t &&
					"name" !== t)
				? ("rgb" === t && (r = this.toRgbString()),
				  "prgb" === t && (r = this.toPercentageRgbString()),
				  ("hex" === t || "hex6" === t) && (r = this.toHexString()),
				  "hex3" === t && (r = this.toHexString(!0)),
				  "hex4" === t && (r = this.toHex8String(!0)),
				  "hex8" === t && (r = this.toHex8String()),
				  "name" === t && (r = this.toName()),
				  "hsl" === t && (r = this.toHslString()),
				  "hsv" === t && (r = this.toHsvString()),
				  r || this.toHexString())
				: "name" === t && 0 === this._a
				? this.toName()
				: this.toRgbString();
		},
		clone: function () {
			return a(this.toString());
		},
		_applyModification: function (t, e) {
			var r = t.apply(null, [this].concat([].slice.call(e)));
			return (
				(this._r = r._r),
				(this._g = r._g),
				(this._b = r._b),
				this.setAlpha(r._a),
				this
			);
		},
		lighten: function () {
			return this._applyModification(l, arguments);
		},
		brighten: function () {
			return this._applyModification(c, arguments);
		},
		darken: function () {
			return this._applyModification(b, arguments);
		},
		desaturate: function () {
			return this._applyModification(h, arguments);
		},
		saturate: function () {
			return this._applyModification(f, arguments);
		},
		greyscale: function () {
			return this._applyModification(u, arguments);
		},
		spin: function () {
			return this._applyModification(d, arguments);
		},
		_applyCombination: function (t, e) {
			return t.apply(null, [this].concat([].slice.call(e)));
		},
		analogous: function () {
			return this._applyCombination(y, arguments);
		},
		complement: function () {
			return this._applyCombination(g, arguments);
		},
		monochromatic: function () {
			return this._applyCombination(M, arguments);
		},
		splitcomplement: function () {
			return this._applyCombination(p, arguments);
		},
		triad: function () {
			return this._applyCombination(m, [3]);
		},
		tetrad: function () {
			return this._applyCombination(m, [4]);
		},
	}),
		(a.fromRatio = function (e, r) {
			if ("object" == t(e)) {
				var n = {};
				for (var i in e)
					e.hasOwnProperty(i) && (n[i] = "a" === i ? e[i] : N(e[i]));
				e = n;
			}
			return a(e, r);
		}),
		(a.equals = function (t, e) {
			return !!t && !!e && a(t).toRgbString() == a(e).toRgbString();
		}),
		(a.random = function () {
			return a.fromRatio({
				r: Math.random(),
				g: Math.random(),
				b: Math.random(),
			});
		}),
		(a.mix = function (t, e, r) {
			r = 0 === r ? 0 : r || 50;
			var n = a(t).toRgb(),
				i = a(e).toRgb(),
				s = r / 100;
			return a({
				r: (i.r - n.r) * s + n.r,
				g: (i.g - n.g) * s + n.g,
				b: (i.b - n.b) * s + n.b,
				a: (i.a - n.a) * s + n.a,
			});
		}),
		(a.readability = function (t, e) {
			var r = a(t),
				n = a(e);
			return (
				(Math.max(r.getLuminance(), n.getLuminance()) + 0.05) /
				(Math.min(r.getLuminance(), n.getLuminance()) + 0.05)
			);
		}),
		(a.isReadable = function (t, e, r) {
			var n,
				i,
				s,
				o,
				h,
				f = a.readability(t, e);
			switch (
				((i = !1),
				((s = r),
				(o = (
					(s = s || { level: "AA", size: "small" }).level || "AA"
				).toUpperCase()),
				(h = (s.size || "small").toLowerCase()),
				"AA" !== o && "AAA" !== o && (o = "AA"),
				"small" !== h && "large" !== h && (h = "small"),
				(n = { level: o, size: h })).level + n.size)
			) {
				case "AAsmall":
				case "AAAlarge":
					i = f >= 4.5;
					break;
				case "AAlarge":
					i = f >= 3;
					break;
				case "AAAsmall":
					i = f >= 7;
			}
			return i;
		}),
		(a.mostReadable = function (t, e, r) {
			var n,
				i,
				s,
				o,
				h = null,
				f = 0;
			(i = (r = r || {}).includeFallbackColors),
				(s = r.level),
				(o = r.size);
			for (var u = 0; u < e.length; u++)
				(n = a.readability(t, e[u])) > f && ((f = n), (h = a(e[u])));
			return a.isReadable(t, h, { level: s, size: o }) || !i
				? h
				: ((r.includeFallbackColors = !1),
				  a.mostReadable(t, ["#fff", "#000"], r));
		});
	var k = (a.names = {
			aliceblue: "f0f8ff",
			antiquewhite: "faebd7",
			aqua: "0ff",
			aquamarine: "7fffd4",
			azure: "f0ffff",
			beige: "f5f5dc",
			bisque: "ffe4c4",
			black: "000",
			blanchedalmond: "ffebcd",
			blue: "00f",
			blueviolet: "8a2be2",
			brown: "a52a2a",
			burlywood: "deb887",
			burntsienna: "ea7e5d",
			cadetblue: "5f9ea0",
			chartreuse: "7fff00",
			chocolate: "d2691e",
			coral: "ff7f50",
			cornflowerblue: "6495ed",
			cornsilk: "fff8dc",
			crimson: "dc143c",
			cyan: "0ff",
			darkblue: "00008b",
			darkcyan: "008b8b",
			darkgoldenrod: "b8860b",
			darkgray: "a9a9a9",
			darkgreen: "006400",
			darkgrey: "a9a9a9",
			darkkhaki: "bdb76b",
			darkmagenta: "8b008b",
			darkolivegreen: "556b2f",
			darkorange: "ff8c00",
			darkorchid: "9932cc",
			darkred: "8b0000",
			darksalmon: "e9967a",
			darkseagreen: "8fbc8f",
			darkslateblue: "483d8b",
			darkslategray: "2f4f4f",
			darkslategrey: "2f4f4f",
			darkturquoise: "00ced1",
			darkviolet: "9400d3",
			deeppink: "ff1493",
			deepskyblue: "00bfff",
			dimgray: "696969",
			dimgrey: "696969",
			dodgerblue: "1e90ff",
			firebrick: "b22222",
			floralwhite: "fffaf0",
			forestgreen: "228b22",
			fuchsia: "f0f",
			gainsboro: "dcdcdc",
			ghostwhite: "f8f8ff",
			gold: "ffd700",
			goldenrod: "daa520",
			gray: "808080",
			green: "008000",
			greenyellow: "adff2f",
			grey: "808080",
			honeydew: "f0fff0",
			hotpink: "ff69b4",
			indianred: "cd5c5c",
			indigo: "4b0082",
			ivory: "fffff0",
			khaki: "f0e68c",
			lavender: "e6e6fa",
			lavenderblush: "fff0f5",
			lawngreen: "7cfc00",
			lemonchiffon: "fffacd",
			lightblue: "add8e6",
			lightcoral: "f08080",
			lightcyan: "e0ffff",
			lightgoldenrodyellow: "fafad2",
			lightgray: "d3d3d3",
			lightgreen: "90ee90",
			lightgrey: "d3d3d3",
			lightpink: "ffb6c1",
			lightsalmon: "ffa07a",
			lightseagreen: "20b2aa",
			lightskyblue: "87cefa",
			lightslategray: "789",
			lightslategrey: "789",
			lightsteelblue: "b0c4de",
			lightyellow: "ffffe0",
			lime: "0f0",
			limegreen: "32cd32",
			linen: "faf0e6",
			magenta: "f0f",
			maroon: "800000",
			mediumaquamarine: "66cdaa",
			mediumblue: "0000cd",
			mediumorchid: "ba55d3",
			mediumpurple: "9370db",
			mediumseagreen: "3cb371",
			mediumslateblue: "7b68ee",
			mediumspringgreen: "00fa9a",
			mediumturquoise: "48d1cc",
			mediumvioletred: "c71585",
			midnightblue: "191970",
			mintcream: "f5fffa",
			mistyrose: "ffe4e1",
			moccasin: "ffe4b5",
			navajowhite: "ffdead",
			navy: "000080",
			oldlace: "fdf5e6",
			olive: "808000",
			olivedrab: "6b8e23",
			orange: "ffa500",
			orangered: "ff4500",
			orchid: "da70d6",
			palegoldenrod: "eee8aa",
			palegreen: "98fb98",
			paleturquoise: "afeeee",
			palevioletred: "db7093",
			papayawhip: "ffefd5",
			peachpuff: "ffdab9",
			peru: "cd853f",
			pink: "ffc0cb",
			plum: "dda0dd",
			powderblue: "b0e0e6",
			purple: "800080",
			rebeccapurple: "663399",
			red: "f00",
			rosybrown: "bc8f8f",
			royalblue: "4169e1",
			saddlebrown: "8b4513",
			salmon: "fa8072",
			sandybrown: "f4a460",
			seagreen: "2e8b57",
			seashell: "fff5ee",
			sienna: "a0522d",
			silver: "c0c0c0",
			skyblue: "87ceeb",
			slateblue: "6a5acd",
			slategray: "708090",
			slategrey: "708090",
			snow: "fffafa",
			springgreen: "00ff7f",
			steelblue: "4682b4",
			tan: "d2b48c",
			teal: "008080",
			thistle: "d8bfd8",
			tomato: "ff6347",
			turquoise: "40e0d0",
			violet: "ee82ee",
			wheat: "f5deb3",
			white: "fff",
			whitesmoke: "f5f5f5",
			yellow: "ff0",
			yellowgreen: "9acd32",
		}),
		v = (a.hexNames = (function (t) {
			var e = {};
			for (var r in t) t.hasOwnProperty(r) && (e[t[r]] = r);
			return e;
		})(k));
	function _(t) {
		return (isNaN((t = parseFloat(t))) || t < 0 || t > 1) && (t = 1), t;
	}
	function w(t, e) {
		"string" == typeof (r = t) &&
			-1 != r.indexOf(".") &&
			1 === parseFloat(r) &&
			(t = "100%");
		var r,
			a,
			n = "string" == typeof (a = t) && -1 != a.indexOf("%");
		return (
			(t = Math.min(e, Math.max(0, parseFloat(t)))),
			n && (t = parseInt(t * e, 10) / 100),
			1e-6 > Math.abs(t - e) ? 1 : (t % e) / parseFloat(e)
		);
	}
	function x(t) {
		return Math.min(1, Math.max(0, t));
	}
	function S(t) {
		return parseInt(t, 16);
	}
	function A(t) {
		return 1 == t.length ? "0" + t : "" + t;
	}
	function N(t) {
		return t <= 1 && (t = 100 * t + "%"), t;
	}
	function R(t) {
		return Math.round(255 * parseFloat(t)).toString(16);
	}
	function C(t) {
		return S(t) / 255;
	}
	var H,
		G,
		B,
		T =
			((G =
				"[\\s|\\(]+(" +
				(H = "(?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?)") +
				")[,|\\s]+(" +
				H +
				")[,|\\s]+(" +
				H +
				")\\s*\\)?"),
			(B =
				"[\\s|\\(]+(" +
				H +
				")[,|\\s]+(" +
				H +
				")[,|\\s]+(" +
				H +
				")[,|\\s]+(" +
				H +
				")\\s*\\)?"),
			{
				CSS_UNIT: RegExp(H),
				rgb: RegExp("rgb" + G),
				rgba: RegExp("rgba" + B),
				hsl: RegExp("hsl" + G),
				hsla: RegExp("hsla" + B),
				hsv: RegExp("hsv" + G),
				hsva: RegExp("hsva" + B),
				hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
				hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
				hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
				hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
			});
	function F(t) {
		return !!T.CSS_UNIT.exec(t);
	}
	return a;
}),
	(w3color.prototype = {
		toRgbString: function () {
			return (
				"rgb(" + this.red + ", " + this.green + ", " + this.blue + ")"
			);
		},
		toRgbaString: function () {
			return (
				"rgba(" +
				this.red +
				", " +
				this.green +
				", " +
				this.blue +
				", " +
				this.opacity +
				")"
			);
		},
		toHwbString: function () {
			return (
				"hwb(" +
				this.hue +
				", " +
				Math.round(100 * this.whiteness) +
				"%, " +
				Math.round(100 * this.blackness) +
				"%)"
			);
		},
		toHwbStringDecimal: function () {
			return (
				"hwb(" +
				this.hue +
				", " +
				this.whiteness +
				", " +
				this.blackness +
				")"
			);
		},
		toHwbaString: function () {
			return (
				"hwba(" +
				this.hue +
				", " +
				Math.round(100 * this.whiteness) +
				"%, " +
				Math.round(100 * this.blackness) +
				"%, " +
				this.opacity +
				")"
			);
		},
		toHslString: function () {
			return (
				"hsl(" +
				this.hue +
				", " +
				Math.round(100 * this.sat) +
				"%, " +
				Math.round(100 * this.lightness) +
				"%)"
			);
		},
		toHslStringDecimal: function () {
			return (
				"hsl(" +
				this.hue +
				", " +
				this.sat +
				", " +
				this.lightness +
				")"
			);
		},
		toHslaString: function () {
			return (
				"hsla(" +
				this.hue +
				", " +
				Math.round(100 * this.sat) +
				"%, " +
				Math.round(100 * this.lightness) +
				"%, " +
				this.opacity +
				")"
			);
		},
		toCmykString: function () {
			return (
				"cmyk(" +
				Math.round(100 * this.cyan) +
				"%, " +
				Math.round(100 * this.magenta) +
				"%, " +
				Math.round(100 * this.yellow) +
				"%, " +
				Math.round(100 * this.black) +
				"%)"
			);
		},
		toCmykStringDecimal: function () {
			return (
				"cmyk(" +
				this.cyan +
				", " +
				this.magenta +
				", " +
				this.yellow +
				", " +
				this.black +
				")"
			);
		},
		toNcolString: function () {
			return (
				this.ncol +
				", " +
				Math.round(100 * this.whiteness) +
				"%, " +
				Math.round(100 * this.blackness) +
				"%"
			);
		},
		toNcolStringDecimal: function () {
			return this.ncol + ", " + this.whiteness + ", " + this.blackness;
		},
		toNcolaString: function () {
			return (
				this.ncol +
				", " +
				Math.round(100 * this.whiteness) +
				"%, " +
				Math.round(100 * this.blackness) +
				"%, " +
				this.opacity
			);
		},
		toName: function () {
			var t,
				e,
				r,
				a = getColorArr("hexs");
			for (i = 0; i < a.length; i++)
				if (
					((t = parseInt(a[i].substr(0, 2), 16)),
					(e = parseInt(a[i].substr(2, 2), 16)),
					(r = parseInt(a[i].substr(4, 2), 16)),
					this.red == t && this.green == e && this.blue == r)
				)
					return getColorArr("names")[i];
			return "";
		},
		toHexString: function () {
			return "#" + toHex(this.red) + toHex(this.green) + toHex(this.blue);
		},
		toRgb: function () {
			return {
				r: this.red,
				g: this.green,
				b: this.blue,
				a: this.opacity,
			};
		},
		toHsl: function () {
			return {
				h: this.hue,
				s: this.sat,
				l: this.lightness,
				a: this.opacity,
			};
		},
		toHwb: function () {
			return {
				h: this.hue,
				w: this.whiteness,
				b: this.blackness,
				a: this.opacity,
			};
		},
		toCmyk: function () {
			return {
				c: this.cyan,
				m: this.magenta,
				y: this.yellow,
				k: this.black,
				a: this.opacity,
			};
		},
		toNcol: function () {
			return {
				ncol: this.ncol,
				w: this.whiteness,
				b: this.blackness,
				a: this.opacity,
			};
		},
		isDark: function (t) {
			return (
				(299 * this.red + 587 * this.green + 114 * this.blue) / 1e3 <
				(t || 128)
			);
		},
		saturate: function (t) {
			var e, r;
			(e = t / 100 || 0.1),
				(this.sat += e),
				this.sat > 1 && (this.sat = 1),
				(r = colorObject(
					hslToRgb(this.hue, this.sat, this.lightness),
					this.opacity,
					this.hue,
					this.sat
				)),
				this.attachValues(r);
		},
		desaturate: function (t) {
			var e, r;
			(e = t / 100 || 0.1),
				(this.sat -= e),
				this.sat < 0 && (this.sat = 0),
				(r = colorObject(
					hslToRgb(this.hue, this.sat, this.lightness),
					this.opacity,
					this.hue,
					this.sat
				)),
				this.attachValues(r);
		},
		lighter: function (t) {
			var e, r;
			(e = t / 100 || 0.1),
				(this.lightness += e),
				this.lightness > 1 && (this.lightness = 1),
				(r = colorObject(
					hslToRgb(this.hue, this.sat, this.lightness),
					this.opacity,
					this.hue,
					this.sat
				)),
				this.attachValues(r);
		},
		darker: function (t) {
			var e, r;
			(e = t / 100 || 0.1),
				(this.lightness -= e),
				this.lightness < 0 && (this.lightness = 0),
				(r = colorObject(
					hslToRgb(this.hue, this.sat, this.lightness),
					this.opacity,
					this.hue,
					this.sat
				)),
				this.attachValues(r);
		},
		attachValues: function (t) {
			(this.red = t.red),
				(this.green = t.green),
				(this.blue = t.blue),
				(this.hue = t.hue),
				(this.sat = t.sat),
				(this.lightness = t.lightness),
				(this.whiteness = t.whiteness),
				(this.blackness = t.blackness),
				(this.cyan = t.cyan),
				(this.magenta = t.magenta),
				(this.yellow = t.yellow),
				(this.black = t.black),
				(this.ncol = t.ncol),
				(this.opacity = t.opacity),
				(this.valid = t.valid);
		},
	});
