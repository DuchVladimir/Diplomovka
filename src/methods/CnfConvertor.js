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

 function reduceToAndOrOperands(variables, operands) {
  if (operands.length != 1 || !(operands[0] == "⇒" || operands[0] == "⇔")) {
    return false;
  }

  // if (JSON.stringify(variables[0]) === JSON.stringify(variables[1])) {
  //   return createVariable("⊤", false);
  // }

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
        if (
          element.operands[0] == rootClause.operands[0]
          // &&
          // element.operands[0] != "⇒" &&
          // element.operands[0] != "⇔"
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
}

function reduceFinalVariables(rootClause) {
  //   let edited = false;
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
        reduceTautologyAndContradiction(j) || areSame(i, j) || areOpposite(i, j)
      );
    } else {
      // return reduceTautologyAndContradiction(j);
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
      // if (rootClause.operands != null && rootClause.operands[0] === "∧") {
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
      // if (rootClause.operands != null && rootClause.operands[0] === "∨") {
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
      // if (rootClause.operands != null && rootClause.operands[0] === "∧") {
      if (rootClause.operands[0] === "∧") {
        rootClause.operands = [];
        rootClause.variable = "⊥";
        rootClause.hasVariables = false;
        rootClause.variableLength = 1;
        // edited = true;
        return true;
      }
      // if (rootClause.operands != null && rootClause.operands[0] === "∨") {
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
        // edited = true;
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
      // if (rootClause.operands != null && rootClause.operands[0] === "∧") {
      if (rootClause.operands[0] === "∧") {
        rootClause.operands = [];
        rootClause.variable = "⊥";
        rootClause.hasVariables = false;
        rootClause.variableLength = 1;
        // edited = true;
        return true;
      }
    }

    function reduceDisjunction() {
      // if (rootClause.operands != null && rootClause.operands[0] === "∨") {
      if (rootClause.operands[0] === "∨") {
        rootClause.operands = [];
        rootClause.variable = "⊤";
        rootClause.hasVariables = false;
        rootClause.variableLength = 1;
        // edited = true;
        return true;
      }
    }
  }
}

export function distributiveRule1(rootClause) {
  // if (rootClause.operands[0] === "∨") {
  let result = branchDistributiveRule(rootClause);
  //   console.log("DONE1",rootClause);
  //   // rootClause.operands = rootClause.operands.concat(result.operands);
  //   // rootClause.variable = rootClause.variable.concat(result.variable);
  // } else {
  //   for (let index = 0; index < rootClause.variable.length; index++) {
  //     const element = rootClause.variable[index];
  //     if (element.hasVariables) {
  //       let result = branchDistributiveRule(element);
  //       console.log("DONE2",element);
  // // rootClause.operands = rootClause.operands.concat(result.operands);
  // // rootClause.variable = rootClause.variable.concat(result.variable);
  // }
  //   }
  // }

  // joinClauses(rootClause);

  //((C∨(A∧(B∨D∨A))∨B)∧((A∧(B∨D∨(A∨(D∧C))∨A))∨C))∨(D∧B)
  //(   (C∨(A∧(B∨D∨A)))  ∧ (A∨C)   )    ∨(D∧B)
  //(A∨C)∧(D∨B)

  //  ((¬F∧(D∨C))∨¬F∨A)∧((F∧¬A)∨F∨(¬D∧¬C))

  function branchDistributiveRule(clause) {
    // console.log("branchDistributiveRule");
    // let clauseLenght = clause.variable.length;
    // let result1Variables = [];
    // let result1Operands = [];

    // for (let index = clauseLenght - 1; index >= 0; index--) {
    //   let variable = clause.variable[index];
    //   console.log("index:", index);
    //   if (variable.hasVariables) {
    //     // if (hasInsideVariables(variable)){
    //     //     let result = branchDistributiveRule(variable);
    //     //     console.log("first result1",result)
    //     //     clause.variable.splice(index, 1,...result.variable);
    //     //     clause.operands.splice(index, 0,...result.operands);
    //     //     console.log("changed clause1",clause)

    //     // }
    //     let result = applyDistributiveRule(index, clause, variable);
    //     console.log("second result", result);
    //     console.log(index, result.variable);
    //     //  result1Variables = result.variable;
    //     //  result1Operands = result.operands;
    //     clause.operands = result.operands;
    //     clause.variable = result.variable;
    //     break;
    //   }
    // }

    //(C∨(A∧(B∨D∨A))∨B)∧((A∧(B∨D∨A))∨C)
    //((A∧(B∨C))∨C) ∧ ((A∧(B∨C))∨C) ∧ A
    //(A∧(B∨D∨A))∨C
    joinClauses(clause);
    reduceVariables(clause);

    for (let i = clause.variable.length - 1; i >= 0; i--) {
      let rootVariable = clause.variable[i];
      if (rootVariable.hasVariables && hasInsideVariables(rootVariable)) {
        for (let j = rootVariable.variable.length - 1; j >= 0; j--) {
          let variable = rootVariable.variable[j];
          console.log("-- variable j", variable);
          if (variable.hasVariables && hasInsideVariables(variable)) {
            console.log("rootVariable", rootVariable);
            console.log("Variable", variable);
            let result = applyDistributiveRule(j, rootVariable, variable);
            console.log("first result", result);
            console.log("-----------");
            rootVariable.operands = result.operands;
            rootVariable.variable = result.variable;
            joinClauses(rootVariable);
            reduceVariables(rootVariable);

            for (let k = 0; k < rootVariable.variable.length; k++) {
              if (hasInsideVariables(rootVariable.variable[k])) {
                j = rootVariable.variable.length;
              }
            }

            // i = clause.variable.length - 1
            // // console.log("changed clause",clause)
            // break
          }
        }
      }
    }

    //(   (C∨(A∧(B∨D∨A)))  ∧ A  )    ∨(D∧B)

    // joinClauses(clause);
    // reduceVariables(clause);

    // console.log("clausule", clause);
    // return clause;
  }

  //prva cast
  // for (let index =clauseLenght-1; index > 0; index--) {
  //   let variable = clause.variable[index];
  //   console.log("index:",index);
  //   if(variable.hasVariables){
  //     if (hasInsideVariables(variable)){
  //         let result = branchDistributiveRule(variable);
  //         console.log("first result1",result)
  //         clause.variable.splice(index, 1,...result.variable);
  //         clause.operands.splice(index, 0,...result.operands);
  //         console.log("changed clause1",clause)

  //     }
  //     let result = applyDistributiveRule(index, clause, variable);
  //     console.log("second result",result)
  //      console.log(index,result.variable)
  //     //  result1Variables = result.variable;
  //     //  result1Operands = result.operands;
  //      clause.operands = result.operands;
  //      clause.variable = result.variable;
  //      break;
  //   }
  //  };

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
    // console.log("result", result);

    return result;
  }

  function revertoperatorArray(clause) {
    clause.operands.forEach((operator) => {
      if (operator === "∧") {
        operator = "∨";
      } else {
        operator = "∧";
      }
    });
  }

  function revertoperator(operator) {
    if (operator === "∧") {
      return "∨";
    } else {
      return "∧";
    }
  }

  function hasInsideVariables(clause) {
    let result = false;
    clause.variable.forEach((variable) => {
      if (variable.hasVariables) result = true;
    });

    return result;
  }
}

export function distributiveRule(rootClause) {
  let isCnf = true;
  for (let index = 0; index < rootClause.variable.length; index++) {
    const variable = rootClause.variable[index];
    if (variable.hasVariables) isCnf = false;
  }
  if (isCnf) return;

  if (rootClause.operands[0] === "∨") {
    for (let index = rootClause.variable.length - 1; index >= 0; index--) {
      let variable = rootClause.variable[index];
      console.log("index:", index);
      if (variable.hasVariables) {
        let result = applyDistributiveRule(index, rootClause, variable);
        console.log("applied distributive Rule");
        rootClause.operands = result.operands;
        rootClause.variable = result.variable;
        joinClauses(rootClause);
        reduceVariables(rootClause);
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
          console.log("applied distributive Rule");
          rootClause.variable.splice(i, 1, ...result.variable);
          rootClause.operands.splice(i, 0, ...result.operands);
          joinClauses(rootClause);
          reduceVariables(rootClause);
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
  } catch (error) {return;}
}

//¬(¬C ⇔ ¬C)                        --OPRAVIT
//TESTS
//¬((F ⇔ ¬F) ⇒ (F ⇒ ¬D))           --true
//¬(E ⇒ ¬E)                         --E

/*
((F∧C∧(B∨¬D)∧(¬D∨¬B)∧(((D∧A)∨(¬A∧¬D)∨¬D∨B)∧((D∧¬B)∨((¬D∨¬A)∧(A∨D)))))∨((((¬D∨¬A)∧(A∨D)∧D∧¬B)∨((¬D∨B)∧((D∧A)∨(¬A∧¬D))))∧(¬F∨¬C∨(¬B∧D)∨(D∧B))))∧(((((D∨¬B)∧(B∨¬D))∨(B∧¬D)∨(D∧¬B))∧((F∧D)∨(¬D∧¬F)∨¬A)∧(((¬D∨E)∧(¬E∨D))∨E∨¬F)∧((F∧¬A)∨¬B∨¬C))∨(((((D∧¬E)∨(E∧¬D))∧¬E∧F)∨((¬F∨A)∧B∧C))∧((((¬D∧B)∨(¬B∧D))∧(¬B∨D)∧(¬D∨B))∨((¬F∨¬D)∧(D∨F)∧A))))
(A∨¬C)∧(A∨F)∧(¬F∨¬A)
(((¬B∧¬E)∨¬F∨B)∧((¬F∧C)∨¬A∨B)∧((A∧¬B)∨F∨¬C)∧(((F∨C)∧D∧¬C)∨¬E∨(C∧D)∨(¬D∧¬C))∧((E∧(¬C∨¬D)∧(D∨C))∨(¬F∧¬C)∨¬D∨C))∨(((D∧A)∨(¬A∧¬D))∧F∧¬B∧((C∧E)∨(¬E∧¬C)∨(¬A∧¬B)∨(B∧A))∧(((A∨B)∧(¬B∨¬A))∨((¬C∨¬E)∧(E∨C))))
(((¬B∧A)∨(¬A∧B))∧B∧¬E)∨((¬B∨E)∧(B∨¬A)∧(A∨¬B))
(((((F∨C)∧((¬F∧B)∨(¬B∧F)))∨((F∨¬B)∧(B∨¬F)∧¬F∧¬C))∧((A∧B)∨(B∧¬A)))∨((¬A∨¬B)∧(¬B∨A)∧((¬F∧¬C)∨((F∨¬B)∧(B∨¬F)))∧((¬F∧B)∨(¬B∧F)∨F∨C))∨((D∧C)∨¬C))∧(((¬D∨¬C)∧C)∨(((((¬F∧¬C)∨((F∨¬B)∧(B∨¬F)))∧((¬F∧B)∨(¬B∧F)∨F∨C))∨((¬A∨¬B)∧(¬B∨A)))∧((A∧B)∨(B∧¬A)∨((F∨C)∧((¬F∧B)∨(¬B∧F)))∨((F∨¬B)∧(B∨¬F)∧¬F∧¬C))))
((((A∧¬C)∨(C∧¬A))∨((E∧B)∨(¬E∧¬A)))∧((C∧¬E∧¬D∧A)∨((D∨¬A)∧(¬C∨E)))∧¬D∧¬E∧(¬D∨B)∧(¬B∨D))∨(((C∧D)∨(¬F∧B))∧((B∧¬C)∨¬C∨A)∧((C∧¬A)∨¬B∨C))∨((¬B∨¬C)∧(C∨B)∧¬B∧¬F)∨(((¬B∧F)∨A∨C)∧((¬A∧¬C)∨B∨¬F))
(A∧¬E)∨((B∨¬F)∧(F∨¬B))
(¬A∧(¬F∨A)∧(¬A∨F))∨((¬C∨¬F)∧(F∨C))
(¬C∧D)∧(¬F∨E)
(¬E∨F)∧((A∧¬D)∨(D∧¬A))
(((¬D∨F)∧(¬F∨D)∧¬B∧¬F)∨((B∨F)∧((D∧¬F)∨(F∧¬D))))∧E∧B∧C∧¬A
(C∧¬A)∨¬C
(C∧¬A)
C∨¬A
((((((¬C∧F)∨D∨A)∧((¬D∧¬A)∨C∨¬F))∨(D∧¬B)∨¬E∨¬A)∧((((¬A∧¬E)∨(B∧¬A))∧(¬B∨A∨E))∨((A∧¬C)∨(C∧¬A))))∨((((A∨E)∧(¬B∨A))∨(B∧¬A∧¬E))∧((¬A∨C)∧(¬C∨A))∧(((C∨¬F)∧¬D∧¬A)∨((D∨A)∧¬C∧F))∧(¬D∨B)∧E∧A))∧((((E∧B)∨F)∧((B∧D)∨F∨¬B))∨(((¬A∧¬E∧¬B)∨((E∨B)∧(A∨E)))∧(B∨¬D∨¬A)∧((D∧A)∨(¬B∧D)))∨(((¬B∧D∧A)∨((¬D∨¬A)∧(B∨¬D)))∧(A∨E∨B)∧((¬E∧¬B)∨(¬A∧¬E))))∧(((((A∨E∨B)∧((¬E∧¬B)∨(¬A∧¬E)))∨(¬B∧D∧A)∨((¬D∨¬A)∧(B∨¬D)))∧(((B∨¬D∨¬A)∧((D∧A)∨(¬B∧D)))∨(¬A∧¬E∧¬B)∨((E∨B)∧(A∨E))))∨((¬E∨¬B)∧¬F)∨((¬B∨¬D)∧¬F∧B))∧(((((¬C∨¬B)∧F)∨(E∧D)∨(B∧E)∨(¬E∧¬B))∧(((¬E∨¬D)∧(¬B∨¬E)∧(E∨B))∨(C∧B)∨¬F))∨((A∨F)∧(¬F∨¬A))∨((B∨C)∧C∧B))∧(((F∨C)∧(¬B∨A))∨((A∨D)∧(¬D∨¬A)∧A∧¬B)∨((¬A∨B)∧((¬A∧¬D)∨(D∧A))))∧((¬B∧E)∨¬A∨C)∧((E∧F)∨(C∧¬D))∧(¬C∨D∨¬E∨¬F)
((((E∨¬A)∧¬A∧¬E∧((E∨¬D)∧(D∨¬E)))∨((((¬B∨¬F∨D∨¬E)∧((¬D∧E)∨(B∧F)))∨(((A∧¬F)∨(F∧E)∨(¬E∧¬F))∧(((¬F∨¬E)∧(E∨F))∨¬A∨F)))∧(((¬A∨F)∧(¬F∨¬E)∧(E∨F))∨(((F∧E)∨(¬E∧¬F))∧A∧¬F)∨(B∧F∧¬D∧E)∨((D∨¬E)∧(¬B∨¬F)))))∧((((B∧F∧¬D∧E)∨((D∨¬E)∧(¬B∨¬F)))∧(((¬A∨F)∧(¬F∨¬E)∧(E∨F))∨(((F∧E)∨(¬E∧¬F))∧A∧¬F)))∨(((A∧¬F)∨(F∧E)∨(¬E∧¬F))∧(((¬F∨¬E)∧(E∨F))∨¬A∨F)∧(¬B∨¬F∨D∨¬E)∧((¬D∧E)∨(B∧F)))∨(¬E∧A)∨A∨E∨((¬E∧D)∨(¬D∧E))))∨((((¬E∨A∨(E∧D)∨(¬D∧¬E))∧(((¬E∨¬D)∧(D∨E))∨(E∧¬A))∧((¬E∧B)∨¬C∨¬D)∧((C∧D)∨E∨¬B))∨((¬B∨¬A∨F)∧((A∧¬F)∨(¬F∧B))∧(¬B∨¬E)∧(A∨C)))∧((B∧A∧¬F)∨((¬A∨F)∧(F∨¬B))∨(B∧E)∨(¬A∧¬C)∨(E∧¬A∧(¬E∨¬D)∧(D∨E))∨(((E∧D)∨(¬D∧¬E))∧(¬E∨A))∨((E∨¬B)∧C∧D)∨((¬C∨¬D)∧¬E∧B)))
*/
