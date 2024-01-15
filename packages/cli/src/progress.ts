export function progress(total: number, index: number) {
  return `${pad(Math.floor((100 * index + 1) / total), 2)}% (${pad(index + 1, Math.log10(total))}/${total})`;
}

function pad(input: number, length: number) {
  return String(input).padStart(length, '0');
}
