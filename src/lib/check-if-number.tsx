export function checkIfNumber(event: React.KeyboardEvent<HTMLInputElement>) {
  const regex = new RegExp(
    /(^\d*$)|(Backspace|Tab|Delete|ArrowLeft|ArrowRight|\.)/
  );

  return !event.key.match(regex) && event.preventDefault();
}
