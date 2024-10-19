export function isColorDark(color: string): boolean {
	if (color.length !== 7 || !color.match(/^#[0-9a-f]{6}$/i)) {
		console.error(`Invalid color: ${color}`);
		return false;
	}
	const rgb = parseInt(color.replace('#', ''), 16);
	const r = (rgb >> 16) & 0xff;
	const g = (rgb >> 8) & 0xff;
	const b = (rgb >> 0) & 0xff;
	const a = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return a > 0.5;
}
