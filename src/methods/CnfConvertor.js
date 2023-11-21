export function createFormula(input) {
  let index = 1;
  return createFormulaMain(index, input).data;

  function createFormulaMain(index, input) {
    console.log("zaciatok", index);
    let correctOperands = ["∧", "∨", "⇒", "⇔"];
    let operands = [];
    let variables = [];
    let isNeg = input[index - 2] == "¬" ? true : false;
    while (input[index] !== ")") {
      console.log("input:", input[index]);

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
    for (let index = operands.length - 1; index > 0; index--) {
      if (operands[index] == "⇒" || operands[index] == "⇔") {
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
      let andCount = 0;
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
