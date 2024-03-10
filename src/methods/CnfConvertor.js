import * as constants from "./../assets/data/constants";

/* eslint-disable prettier/prettier */
export function createFormula(input) {
  let index = 1;
  return createFormulaMain(index, input).data;

  function createFormulaMain(index, input) {
    let correctOperands = ["∧", "∨", "⇒", "⇔"];
    let operands = [];
    let variables = [];
    let isNeg = input[index - 2] == "¬" ? true : false;
    while (input[index] !== ")") {
      if (
        input[index].toUpperCase().match(/[a-z]/i) ||
        input[index] === "⊤" ||
        input[index] === "⊥"
      ) {
        let createdVar = createVariable(
          input[index],
          input[index - 1] == "¬" ? true : false
        );
        if (createdVar != null) variables.push(createdVar);
        else console.log("Cannot create variable - ERROR");
      }
      if (correctOperands.includes(input[index])) {
        operands.push(input[index]);
      }

      if (input[index] == "(") {
        index++;
        let newFormula = createFormulaMain(index, input);
        index++;
        variables.push(newFormula.data);
        index = newFormula.index;
      }
      index++;
    }

    if (variables.length == 1 && variables[0].hasVariables == false) {
      return {
        data: createVariable(
          variables[0].variable,
          variables[0].isNeg !== isNeg
        ),
        index,
      };
    }

    setClosuresByOperands(variables, operands);

    while (variables.length == 1 && variables[0].hasVariables == true) {
      isNeg = isNeg !== variables[0].isNeg;
      operands = variables[0].operands;
      variables = variables[0].variable;
    }
    return { data: createVariables(variables, operands, isNeg), index };
  }
}

function reduceToAndOrOperands(variables, operands) {
  if (operands.length != 1 || !(operands[0] == "⇒" || operands[0] == "⇔")) {
    return false;
  }
  if (operands[0] == "⇔") {
    let varr = [];
    let vars1 = [];
    let vars2 = [];
    if (variables[0].hasVariables) {
      let obj = createVariables(
        variables[0].variable,
        variables[0].operands,
        variables[0].isNeg !== true
      );
      let objCopy = structuredClone(obj);
      vars1.push(objCopy);
    } else
      vars1.push(
        createVariable(variables[0].variable, variables[0].isNeg !== true)
      );
    if (variables[1].hasVariables)
      vars1.push(
        createVariables(
          variables[1].variable,
          variables[1].operands,
          variables[1].isNeg
        )
      );
    else vars1.push(createVariable(variables[1].variable, variables[1].isNeg));
    varr.push(createVariables(vars1, ["∨"], false));

    if (variables[1].hasVariables) {
      let obj = createVariables(
        variables[1].variable,
        variables[1].operands,
        variables[1].isNeg !== true
      );
      let objCopy = structuredClone(obj);
      vars2.push(objCopy);
    } else
      vars2.push(
        createVariable(variables[1].variable, variables[1].isNeg !== true)
      );
    if (variables[0].hasVariables)
      vars2.push(
        createVariables(
          variables[0].variable,
          variables[0].operands,
          variables[0].isNeg
        )
      );
    else vars2.push(createVariable(variables[0].variable, variables[0].isNeg));
    varr.push(createVariables(vars2, ["∨"], false));

    return createVariables(varr, ["∧"], false);
  }

  if (operands[0] == "⇒") {
    let vars = [];
    if (variables[0].hasVariables)
      vars.push(
        createVariables(
          variables[0].variable,
          variables[0].operands,
          variables[0].isNeg !== true
        )
      );
    else
      vars.push(
        createVariable(variables[0].variable, variables[0].isNeg !== true)
      );

    if (variables[1].hasVariables)
      vars.push(
        createVariables(
          variables[1].variable,
          variables[1].operands,
          variables[1].isNeg
        )
      );
    else vars.push(createVariable(variables[1].variable, variables[1].isNeg));

    return createVariables(vars, ["∨"], false);
  }
  return false;
}

export function setClosuresByOperands(variables, operands) {
  if (operands.length > 1) {
    for (let index = 0; index < operands.length; index++) {
      let result = getOperandsTogether(variables, operands, index, "∧", true);
      if (result) {
        operands.splice(index, result.operands.length);
        variables.splice(index, result.operands.length + 1);
        variables.splice(index, 0, result);
      }
    }
    for (let index = 0; index < operands.length; index++) {
      let result = getOperandsTogether(variables, operands, index, "∨", true);
      if (result) {
        operands.splice(index, result.operands.length);
        variables.splice(index, result.operands.length + 1);
        variables.splice(index, 0, result);
      }
    }
    for (let index = 0; index < operands.length; index++) {
      let result = getOperandsTogether(variables, operands, index, "⇒", true);
      if (result) {
        let operandsLength = result.operands.length;
        let variablesLength = result.operands.length + 1;
        applyClosureToImplication(result.variable, result.operands);
        operands.splice(index, operandsLength);
        variables.splice(index, variablesLength);
        variables.splice(index, 0, result);
      }
    }

    for (let index = operands.length - 1; index > 0; index--) {
      if (operands[index] == "⇔") {
        let result = createVariables(
          [variables[index], variables[index + 1]],
          operands[index],
          false
        );
        operands.splice(index, 1);
        variables.splice(index, 1);
        variables.splice(index, 0, result);
      } else console.log("Error - wrong operand");
    }
  }

  function applyClosureToImplication(variables, operands) {
    for (let index = operands.length - 1; index > 0; index--) {
      if (operands[index] == "⇒") {
        let result = createVariables(
          [variables[index], variables[index + 1]],
          operands[index],
          false
        );
        operands.splice(index, 1);
        variables.splice(index, 1);
        variables.splice(index, 0, result);
      }
    }
  }

  function getOperandsTogether(
    variables,
    operands,
    index,
    specificOperand,
    repeat
  ) {
    if (operands[index] == specificOperand) {
      let newOperands = [specificOperand];
      let newVariables = [variables[index], variables[index + 1]];
      if (repeat) {
        for (let i = index + 1; i < operands.length; i++) {
          if (operands[i] == specificOperand) {
            newOperands.push(specificOperand);
            newVariables.push(variables[i + 1]);
          } else break;
        }
      }
      return createVariables(newVariables, newOperands, false);
    }
    return false;
  }
}

export function createVariables(variable, operands, isNeg) {
  let varLength = 0;

  if (variable.length == 0) return null;
  variable.forEach((element) => {
    varLength += element.variableLength;
  });

  let result = reduceToAndOrOperands(variable, operands);
  if (result) {
    result.isNeg = isNeg;
    return result;
  }

  return {
    isNeg: isNeg,
    variable: variable,
    operands: operands,
    hasVariables: true,
    variableLength: varLength,
  };
}

export function createVariable(variable, isNeg) {
  return {
    isNeg: isNeg,
    variable: variable,
    operands: [],
    hasVariables: false,
    variableLength: 1,
  };
}

export function removeClosuresNegations(rootClause) {
  if (rootClause.isNeg) {
    rootClause.operands = rootClause.operands.map((element) =>
      element === "∧" ? "∨" : "∧"
    );
  }
  rootClause.variable.forEach((clause) => {
    if (rootClause.isNeg) {
      clause.isNeg = !clause.isNeg;
    }

    if (clause.hasVariables) {
      removeClosuresNegations(clause);
    } else {
      removeConstantNegations(clause);
    }
  });
  rootClause.isNeg = false;

  function removeConstantNegations(element) {
    if (!element.isNeg) return;

    const negationMap = {
      "⊤": "⊥",
      "⊥": "⊤",
    };

    if (negationMap.hasOwnProperty(element.variable)) {
      element.variable = negationMap[element.variable];
      element.isNeg = false;
    }
  }
}

export function joinClauses(rootClause) {
  let repeat = false;
  do {
    repeat = false;
    for (let index = 0; index < rootClause.variable.length; index++) {
      const element = rootClause.variable[index];
      if (element.hasVariables) {
        joinClauses(element);
        if (element.operands[0] == rootClause.operands[0]) {
          rootClause.variable.splice(index, 1);
          rootClause.variable = rootClause.variable.concat(element.variable);
          rootClause.operands = rootClause.operands.concat(element.operands);
          repeat = true;
        }
      }
    }
  } while (repeat);
}

export function reduceVariables(rootClause) {
  rootClause.variableLength = rootClause.variable.length;
  for (let index = 0; index < rootClause.variableLength; index++) {
    const element = rootClause.variable[index];
    if (element.hasVariables) {
      reduceVariables(element);
    }
  }

  if(reduceFinalVariables(rootClause)){
    reduceVariables(rootClause);
  };
}

function reduceFinalVariables(rootClause) {
  let wasReduced = false;
  rootClause.variableLength = rootClause.variable.length;
  reduceTautologyAndContradiction(0);

  for (let i = 0; i < rootClause.variableLength - 1; i++) {
    for (let j = i + 1; j < rootClause.variableLength; j++) {
      let reducingResult = getReduce(i, j);
      if (reducingResult) {
        wasReduced = true;
        i--;
        j--;
        if (rootClause.variableLength == 1) {
          return wasReduced;
        }
        break;
      }
    }
  }

  return wasReduced;

  function getReduce(i, j) {
    if (!rootClause.variable[i].hasVariables) {
      return (
        reduceTautologyAndContradiction(j) || areSame(i, j) || areOpposite(i, j)
      );
    }
  }

  function reduceTautologyAndContradiction(index) {
    if (rootClause.variableLength == 1) return false;
    if (rootClause.variable[index].variable === "⊥") {
      return reduceContradiction();
    }
    if (rootClause.variable[index].variable === "⊤") {
      return reduceTautology();
    }
    return false;

    function reduceTautology() {
      if (rootClause.operands[0] === "∧") {
        rootClause.variable.splice(index, 1);
        rootClause.operands.splice(0, 1);
        rootClause.variableLength--;
        if (rootClause.variableLength == 1) {
          rootClause.operands = rootClause.variable[0].operands;
          rootClause.variableLength = rootClause.variable[0].variableLength;
          rootClause.hasVariables = rootClause.variable[0].hasVariables;
          rootClause.isNeg = rootClause.variable[0].isNeg;
          rootClause.variable = rootClause.variable[0].variable;
        }
        return true;
      }
      if (rootClause.operands[0] === "∨") {
        rootClause.operands = [];
        rootClause.variable = "⊤";
        rootClause.hasVariables = false;
        rootClause.variableLength = 1;
        return true;
      }
      return false;
    }

    function reduceContradiction() {
      if (rootClause.operands[0] === "∧") {
        rootClause.operands = [];
        rootClause.variable = "⊥";
        rootClause.hasVariables = false;
        rootClause.variableLength = 1;
        return true;
      }
      if (rootClause.operands[0] === "∨") {
        rootClause.variable.splice(index, 1);
        rootClause.operands.splice(0, 1);
        rootClause.variableLength--;
        if (rootClause.variableLength == 1) {
          rootClause.operands = rootClause.variable[0].operands;
          rootClause.variableLength = rootClause.variable[0].variableLength;
          rootClause.hasVariables = rootClause.variable[0].hasVariables;
          rootClause.isNeg = rootClause.variable[0].isNeg;
          rootClause.variable = rootClause.variable[0].variable;
        }
        return true;
      }
      return false;
    }
  }

  function areSame(objIndex1, objIndex2) {
    if (rootClause.variableLength == 1) return false;
    if (
      rootClause.variable[objIndex1].variable ==
        rootClause.variable[objIndex2].variable &&
      rootClause.variable[objIndex1].isNeg ==
        rootClause.variable[objIndex2].isNeg
    ) {
      return reduceConjunction();
    }
    return false;

    function reduceConjunction() {
      rootClause.variable.splice(objIndex1, 1);
      rootClause.operands.splice(0, 1);
      rootClause.variableLength--;
      if (rootClause.variableLength == 1) {
        rootClause.operands = [];
        rootClause.hasVariables = false;
        rootClause.isNeg = rootClause.variable[0].isNeg;
        rootClause.variable = rootClause.variable[0].variable;
      }
      return true;
    }
  }

  function areOpposite(objIndex1, objIndex2) {
    if (rootClause.variableLength == 1) return false;
    if (
      rootClause.variable[objIndex1].variable ==
        rootClause.variable[objIndex2].variable &&
      rootClause.variable[objIndex1].isNeg !=
        rootClause.variable[objIndex2].isNeg
    ) {
      let conjunctionResult = reduceConjunction();
      let disjunctionResult = reduceDisjunction();
      return conjunctionResult || disjunctionResult;
    }
    return false;

    function reduceConjunction() {
      if (rootClause.operands[0] === "∧") {
        rootClause.operands = [];
        rootClause.variable = "⊥";
        rootClause.hasVariables = false;
        rootClause.variableLength = 1;
        return true;
      }
    }

    function reduceDisjunction() {
      if (rootClause.operands[0] === "∨") {
        rootClause.operands = [];
        rootClause.variable = "⊤";
        rootClause.hasVariables = false;
        rootClause.variableLength = 1;
        return true;
      }
    }
  }
}

export function distributiveRule(rootClause) {
  formulaLog(rootClause);

  let isCnf = true;
  for (let index = 0; index < rootClause.variable.length; index++) {
    const variable = rootClause.variable[index];
    if (variable.hasVariables) isCnf = false;
  }
  if (isCnf) return;

  if (rootClause.operands[0] === "∨") {
    for (let index = rootClause.variable.length - 1; index >= 0; index--) {
      let variable = rootClause.variable[index];
      if (variable.hasVariables) {
        let result = applyDistributiveRule(index, rootClause, variable);
        rootClause.operands = result.operands;
        rootClause.variable = result.variable;
        joinClauses(rootClause);
        break;
      }
    }
  }

  for (let i = rootClause.variable.length - 1; i >= 0; i--) {
    let rootVariable = rootClause.variable[i];
    if (rootVariable.hasVariables && hasInsideVariables(rootVariable)) {
      outerLoop: for (let j = rootVariable.variable.length - 1; j >= 0; j--) {
        let variable = rootVariable.variable[j];
        if (variable.hasVariables) {
          let result = applyDistributiveRule(j, rootVariable, variable);
          reduceVariables(result);
          if (result.hasVariables && result.operands[0] == "∧") {
            rootClause.variable.splice(i, 1, ...result.variable);
            rootClause.operands.splice(i, 0, ...result.operands);
            joinClauses(rootClause);
            reduceVariables(rootClause);
          } else {
            rootClause.variable.splice(i, 1, result);
            joinClauses(rootClause);
          }
          i = rootClause.variable.length;
          break outerLoop;
        }
      }
    }
  }
  joinClauses(rootClause);
  reduceVariables(rootClause);

  function applyDistributiveRule(index, clause, variable) {
    let resultVariables = [];
    let resultOperands = [];
    for (let i = 0; i < variable.variable.length; i++) {
      let copyVariable = JSON.parse(JSON.stringify(variable.variable[i]));
      let copyOperands = JSON.parse(JSON.stringify(clause.operands));
      var otherVariables = JSON.parse(JSON.stringify(clause.variable));
      otherVariables.splice(index, 1);
      resultVariables.push(
        createVariables([...otherVariables, copyVariable], copyOperands, false)
      );
      resultOperands.push(variable.operands[0]);
    }
    resultOperands.splice(0, 1);
    let result = createVariables(resultVariables, resultOperands, false);
    return result;
  }

  function hasInsideVariables(clause) {
    let result = false;
    clause.variable.forEach((variable) => {
      if (variable.hasVariables) result = true;
    });

    return result;
  }
}

export function sortVariables(rootClause) {
  for (let index = 0; index < rootClause.variable.length; index++) {
    sortFinalClause(rootClause.variable[index].variable);
  }

  function sortFinalClause(variables) {
    try {
      variables.sort((a, b) => {
        const variableComparison = a.variable.localeCompare(b.variable);
        if (variableComparison === 0) {
          return a.isNeg - b.isNeg;
        }
        return variableComparison;
      });
    } catch (error) {
      return;
    }
  }

  removeDuplicateObjects(rootClause);
  if (rootClause.operands.length === 0 && rootClause.variable[0].hasVariables) {
    rootClause.operands = rootClause.variable[0].operands;
    rootClause.variable = rootClause.variable[0].variable;
  }

  sortArrayByTypeAndLength(rootClause.variable);
}

export function convertObjectToFinalArray(obj) {
  let clausesArray = [];
  let index = 0;
  try {
    if (obj.operands.length > 0 && obj.operands[0] == constants.OR_OPERAND) {
      convertElement(obj);
    } else {
      obj.variable.forEach((element) => {
        convertElement(element);
      });
    }
  } catch (error) {
    clausesArray.push({
      variables: [{ variable: obj.variable, isNeg: obj.isNeg }],
      isRoot: true,
      index: index,
      parents: [],
    });
    index++;
  }
  return clausesArray;

  function convertElement(element) {
    let variableArray = {
      variables: [],
      isRoot: true,
      index: 0,
      parents: [],
    };
    try {
      element.variable.forEach((element) => {
        variableArray.variables.push({
          variable: element.variable,
          isNeg: element.isNeg,
        });
      });
    } catch (error) {
      variableArray.variables.push({
        variable: element.variable,
        isNeg: element.isNeg,
      });
    }
    variableArray.isRoot = true;
    variableArray.index = index;
    index++;
    clausesArray.push(variableArray);
  }
}

function removeDuplicateObjects(rootClause) {
  let arr = rootClause.variable;
  const seen = new Set();

  for (let i = arr.length - 1; i >= 0; i--) {
    const jsonRepresentation = JSON.stringify(arr[i]);

    if (seen.has(jsonRepresentation)) {
      arr.splice(i, 1);
      rootClause.operands.splice(0, 1);
    } else {
      seen.add(jsonRepresentation);
    }
  }
}

function sortArrayByTypeAndLength(arr) {
  try {
    arr.sort((a, b) => {
      if (typeof a.variable === "string" && typeof b.variable === "string") {
        return a.variable.localeCompare(b.variable);
      }
      if (typeof a.variable === "string") {
        return -1;
      }
      if (typeof b.variable === "string") {
        return 1;
      }
      return a.variable.length - b.variable.length;
    });
  } catch (error) {
    return;
  }
}

export function formulaLog(FormulaObj) {
  if (FormulaObj.variableLength == 1 && FormulaObj.isNeg == true)
    return "(¬" + FormulaObj.variable + ")";
  if (FormulaObj.variableLength == 1 && FormulaObj.isNeg == false)
    return "(" + FormulaObj.variable + ")";
  let formulaLength = FormulaObj.operands.length;
  let resultString = "";

  if (FormulaObj.isNeg) resultString += "¬";
  resultString += "(";

  for (let index = 0; index < formulaLength; index++) {
    const element = FormulaObj.variable[index];
    if (element.hasVariables) {
      resultString += formulaLog(element);
    } else {
      if (element.isNeg) resultString += "¬";
      resultString += element.variable;
    }
    resultString += FormulaObj.operands[index];
  }
  if (FormulaObj.variable[formulaLength].hasVariables) {
    resultString += formulaLog(FormulaObj.variable[formulaLength]);
  } else {
    if (FormulaObj.variable[formulaLength].isNeg) resultString += "¬";
    resultString += FormulaObj.variable[formulaLength].variable;
  }

  resultString += ")";
  return resultString;
}

export function convertCnfObjectToCnfString(cnfArray) {
  let cnfString = "";
  cnfArray.forEach((element) => {
    if (element.variables.length == 1) {
      cnfString += element.variables[0].isNeg
        ? `¬${element.variables[0].variable}`
        : element.variables[0].variable;
    } else {
      cnfString += "(";
      element.variables.forEach((element1) => {
        cnfString += element1.isNeg
          ? `¬${element1.variable}`
          : element1.variable;
        cnfString += "∨";
      });
      cnfString = cnfString.slice(0, -1);
      cnfString += ")";
    }
    cnfString += "∧";
  });
  cnfString = cnfString.slice(0, -1);
  return cnfString;
}
