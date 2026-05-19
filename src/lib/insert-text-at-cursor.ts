export function insertTextAtCursor(
  currentValue: string,
  selectionStart: number,
  selectionEnd: number,
  textToInsert: string,
): { value: string; cursorPosition: number } {
  const before = currentValue.slice(0, selectionStart);
  const after = currentValue.slice(selectionEnd);
  const value = `${before}${textToInsert}${after}`;
  const cursorPosition = selectionStart + textToInsert.length;

  return { value, cursorPosition };
}
