export const copy = (text: string) => {
  window.navigator.clipboard.writeText(text);
};
