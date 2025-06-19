export function hexToVec4(hex: string): [number, number, number, number] {
  hex = hex.replace(/^#/, "");
  if (hex.length <= 6) hex = hex + "FF";

  const match = hex.match(/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
  if (!match) return [0, 0, 0, 1];

  const [, r, g, b, a] = match;
  return [
    parseInt(r, 16) / 255,
    parseInt(g, 16) / 255,
    parseInt(b, 16) / 255,
    parseInt(a, 16) / 255
  ];
}
