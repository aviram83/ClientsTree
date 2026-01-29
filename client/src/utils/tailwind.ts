/**
 * Converts a Tailwind background color class to its hex equivalent.
 * @param tailwindColor The tailwind class (e.g., "bg-yellow-400").
 * @returns The hex color code (e.g., "#facc15").
 */
export const tailwindToHex = (tailwindColor: string): string => {
  const colorMap: { [key: string]: string } = {
    'bg-yellow-400': '#facc15',
    'bg-blue-400': '#60a5fa',
    'bg-red-400': '#f87171',
    'bg-green-400': '#4ade80',
  };
  return colorMap[tailwindColor] || '#000000'; // Fallback to black
};