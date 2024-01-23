const operators = ["∧", "∨", "⇒", "⇔"];
const variables = ["A", "B", "C", "D", "E", "G"];

export function createRandomFormula() {
  const formula = generateFormula(randomRange(1, 6));
  return formula[0] === "¬"
    ? formula
    : formula.substring(1, formula.length - 1);
}

function generateFormula(level) {
  if (level === 0) {
    const negate = Math.random() < 0.5 ? "¬" : "";
    const variable = variables[Math.floor(Math.random() * variables.length)];
    return `${negate}${variable}`;
  } else {
    const randomOperator =
      operators[Math.floor(Math.random() * operators.length)];
    const subFormula1 = generateFormula(level - 1);
    const subFormula2 = generateFormula(level - 1);
    const formula = `(${subFormula1} ${randomOperator} ${subFormula2})`;

    return Math.random() < 0.5 ? `¬${formula}` : formula;
  }
}

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
