export const copy = (text: string) => {
  void window.navigator.clipboard.writeText(text);
};
