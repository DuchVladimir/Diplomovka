let wasLetter = false;
let closures = 0;

export function checkClosure(letter) {
  if (letter == "(") closures++;
  if (letter == ")") closures--;
  return !(closures < 0);
}

export function checkClosureAndOperands(letter, pervLetter, pervPervLetter) {
  let correctChars = ["∧", "∨", "⇒", "⇔", "("];
  if (letter == "(") {
    if (pervLetter != undefined && pervLetter == "¬") {
      if (pervPervLetter != undefined && !correctChars.includes(pervPervLetter))
        return false;
    } else if (pervLetter != undefined && !correctChars.includes(pervLetter))
      return false;
  }
  return true;
}

export function checkCorrectChars(letter) {
  let correctChars = ["¬", "∧", "∨", "⇒", "⇔", "(", ")"];
  return checkCharacters(letter) || correctChars.includes(letter);
}

export function checkDoubleChars(letter) {
  let operands = ["∧", "∨", "⇒", "⇔"];
  if (!checkCharacters(letter) && !operands.includes(letter)) return true;
  if (checkCharacters(letter) && wasLetter == false) {
    wasLetter = true;
    return true;
  }
  if (operands.includes(letter) && wasLetter == true) {
    wasLetter = false;
    return true;
  }
  return false;
}

export function checkNeg(letter, nextLetter) {
  return (
    letter != "¬" ||
    (letter == "¬" && (checkCharacters(nextLetter) || nextLetter == "("))
  );
}

export function checkOperands(perviousLetter, letter, nextLetter) {
  let operands = ["∧", "∨", "⇒", "⇔"];
  if (!operands.includes(letter)) return true;
  return (
    operands.includes(letter) &&
    (checkCharacters(perviousLetter) || perviousLetter == ")") &&
    (checkCharacters(nextLetter) || nextLetter == "(" || nextLetter == "¬")
  );
}

export function checkCharacters(letter) {
  return letter.toUpperCase().match(/[a-z]/i);
}
