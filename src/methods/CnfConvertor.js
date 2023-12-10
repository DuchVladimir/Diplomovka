export function createFormula(input) {
  let index = 1;
  return createFormulaMain(index, input).data;

  function createFormulaMain(index, input) {
    let correctOperands = ["∧", "∨", "⇒", "⇔"];
    let operands = [];
    let variables = [];
    let isNeg = input[index - 2] == "¬" ? true : false;
    while (input[index] !== ")") {
      if (input[index].toUpperCase().match(/[a-z]/i)) {
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

export function reduceToAndOrOperands(variables, operands) {
  if (
    (operands[0] == "⇒" || operands[0] == "⇔") &&
    operands.length == 1 &&
    JSON.stringify(variables[0]) === JSON.stringify(variables[1])
  ) {
    return createVariable("⊤", false);
  }
  if (operands[0] == "⇔" && operands.length == 1) {
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
  if (operands[0] == "⇒" && operands.length == 1) {
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
    operands: null,
    hasVariables: false,
    variableLength: 1,
  };
}

export function removeClosuresNegations(rootClause) {
  if (rootClause.isNeg) {
    for (let index = 0; index < rootClause.operands.length; index++) {
      let element = rootClause.operands[index];
      if (element == "∧") rootClause.operands[index] = "∨";
      else rootClause.operands[index] = "∧";
    }
  }

  for (let i = 0; i < rootClause.variable.length; i++) {
    let element1 = rootClause.variable[i];

    if (rootClause.isNeg) {
      rootClause.variable[i].isNeg = element1.isNeg !== rootClause.isNeg;
    }

    if (element1.hasVariables) {
      removeClosuresNegations(element1);
    } else {
      removeConstantNegations(element1);
    }
  }
  rootClause.isNeg = false;

  function removeConstantNegations(element) {
    if (element.isNeg) {
      if (element.variable === "⊤") {
        element.variable = "⊥";
        element.isNeg = false;
      }
      if (element.variable === "⊥") {
        element.variable = "⊤";
        element.isNeg = false;
      }
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
        if (
          element.operands[0] == rootClause.operands[0] &&
          element.operands[0] != "⇒" &&
          element.operands[0] != "⇔"
        ) {
          rootClause.variable.splice(index, 1);
          rootClause.variable = rootClause.variable.concat(element.variable);
          rootClause.operands = rootClause.operands.concat(element.operands);
          repeat = true;
        }
      }
    }
  } while (repeat);
}

//⊥ ⊤
export function reduceVariables(rootClause) {
  rootClause.variableLength = rootClause.variable.length;
  for (let index = 0; index < rootClause.variableLength; index++) {
    const element = rootClause.variable[index];
    if (element.hasVariables) {
      reduceVariables(element);
    }
  }

  reduceFinalVariables(rootClause);

  function reduceFinalVariables(rootClause) {
    let edited = false;
    let arr = rootClause.variable;
    rootClause.variableLength = rootClause.variable.length;
    reduceTautologyAndContradiction(0);

    for (let i = 0; i < rootClause.variableLength - 1; i++) {
      for (let j = i + 1; j < rootClause.variableLength; j++) {
        let reducingResult = getReduce(i, j);
        if (reducingResult) {
          i--;
          j--;
          if (rootClause.variableLength == 1) {
            return;
          }
          break;
        }
      }
    }

    function getReduce(i, j) {
      if (!i.hasVariables) {
        return (
          reduceTautologyAndContradiction(j) ||
          areSame(i, j) ||
          areOpposite(i, j)
        );
      } else {
        // return reduceTautologyAndContradiction(j);
      }
    }

    function reduceTautologyAndContradiction(index) {
      if (edited) return false;
      if (arr[index].variable === "⊥") {
        return reduceContradiction();
      }
      if (arr[index].variable === "⊤") {
        return reduceTautology();
      }
      return false;

      function reduceTautology() {
        if (rootClause.operands != null && rootClause.operands[0] === "∧") {
          rootClause.variable.splice(index, 1);
          rootClause.operands.splice(0, 1);
          rootClause.variableLength--;
          if (rootClause.variableLength == 1) {
            edited = true;
            // rootClause = rootClause.variable[0];
            rootClause.operands = rootClause.variable[0].operands;
            rootClause.variableLength = rootClause.variable[0].variableLength;
            rootClause.hasVariables = rootClause.variable[0].hasVariables;
            rootClause.isNeg = rootClause.variable[0].isNeg;
            rootClause.variable = rootClause.variable[0].variable;
          }
          return true;
        }
        if (rootClause.operands != null && rootClause.operands[0] === "∨") {
          rootClause.operands = null;
          rootClause.variable = "⊤";
          rootClause.hasVariables = false;
          rootClause.variableLength = 1;
          edited = true;
          return true;
        }
        return false;
      }

      function reduceContradiction() {
        if (rootClause.operands != null && rootClause.operands[0] === "∧") {
          rootClause.operands = null;
          rootClause.variable = "⊥";
          rootClause.hasVariables = false;
          rootClause.variableLength = 1;
          edited = true;
          return true;
        }
        if (rootClause.operands != null && rootClause.operands[0] === "∨") {
          rootClause.variable.splice(index, 1);
          rootClause.operands.splice(0, 1);
          rootClause.variableLength--;
          if (rootClause.variableLength == 1) {
            edited = true;
            // rootClause = rootClause.variable[0];
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
      if (edited) return false;
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
          edited = true;
          rootClause.operands = null;
          rootClause.hasVariables = false;
          rootClause.isNeg = rootClause.variable[0].isNeg;
          rootClause.variable = rootClause.variable[0].variable;
        }
        return true;
      }
    }

    function areOpposite(objIndex1, objIndex2) {
      if (edited) return false;
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
        if (rootClause.operands != null && rootClause.operands[0] === "∧") {
          rootClause.operands = null;
          rootClause.variable = "⊥";
          rootClause.hasVariables = false;
          rootClause.variableLength = 1;
          edited = true;
          return true;
        }
      }

      function reduceDisjunction() {
        if (rootClause.operands != null && rootClause.operands[0] === "∨") {
          rootClause.operands = null;
          rootClause.variable = "⊤";
          rootClause.hasVariables = false;
          rootClause.variableLength = 1;
          edited = true;
          return true;
        }
      }
    }
  }
}

export function sortVariables(rootClause) {
  console.log(rootClause);
  let lastClause = true;
  for (let index = 0; index < rootClause.variable.length; index++) {
    const element = rootClause.variable[index];
    if (element.hasVariables) {
      sortVariables(element);
      lastClause = false;
    }
  }

  if (lastClause) {
    sortFinalClause(rootClause.variable);
  }
  for (let index = 0; index < rootClause.variable.length; index++) {}

  function sortFinalClause(variables) {
    variables.sort((a, b) => {
      console.log("before sort:", variables);

      const variableComparison = a.variable.localeCompare(b.variable);
      if (variableComparison === 0) {
        return a.isNeg - b.isNeg;
      }
      console.log("after sort:", variables);
      return variableComparison;
    });
  }
}
