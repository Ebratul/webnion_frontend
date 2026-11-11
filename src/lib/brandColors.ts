// Builds the site's colour tokens from the one brand colour an admin picks. Text colours are adjusted until they reach
// the WCAG contrast of 4.5 against the backgrounds they sit on, so any choice stays readable.

type Rgb = [number, number, number];

const parse = (hex: string): Rgb => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16)) as Rgb;
const format = (rgb: Rgb) => `#${rgb.map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;
const mix = (a: Rgb, b: Rgb, amount: number): Rgb => a.map((value, index) => value + (b[index]! - value) * amount) as Rgb;

const luminance = (rgb: Rgb) => {
  const [r, g, b] = rgb.map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a: string, b: string) => {
  const [light, dark] = [luminance(parse(a)), luminance(parse(b))].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
};

const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];
// The darkest card colour in dark mode and the lightest grey card in light mode: text must read on both
const DARK_SURFACE = '#17171f';
const LIGHT_SURFACE = '#efedf8';

// Moves towards white or black in small steps until the text reads on the given background
const readableOn = (start: Rgb, toward: Rgb, background: string) => {
  for (let step = 0; step <= 20; step++) {
    const colour = format(mix(start, toward, step * 0.05));
    if (contrast(colour, background) >= 4.5) return colour;
  }
  return format(toward);
};

export const DEFAULT_PRIMARY = '#8224e3';

export const brandPalette = (primaryHex: string) => {
  const primary = parse(primaryHex);
  const hover = mix(primary, BLACK, 0.17);
  return {
    primary: format(primary),
    primaryHover: format(hover),
    // Starting points match the original purple's lighter and darker text shades
    accentDark: readableOn(mix(primary, WHITE, 0.4), WHITE, DARK_SURFACE),
    accentLight: readableOn(hover, BLACK, LIGHT_SURFACE),
    // White button text on the brand colour
    buttonContrast: contrast('#ffffff', format(primary)),
  };
};

// The stylesheet that replaces the default colour. Only a validated #rrggbb value reaches it.
export const brandStyle = (primaryHex: string | undefined) => {
  if (!primaryHex || !/^#[0-9a-f]{6}$/i.test(primaryHex) || primaryHex.toLowerCase() === DEFAULT_PRIMARY) return null;
  const palette = brandPalette(primaryHex);
  return `:root{--primary:${palette.primary};--primary-hover:${palette.primaryHover};--accent-dark:${palette.accentDark};--accent-light:${palette.accentLight}}`;
};
