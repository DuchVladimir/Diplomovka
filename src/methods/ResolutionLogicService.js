import * as constants from "./../assets/data/constants";

export function applyResolutionLogic(cnfFormula) {
  resolveLogic(cnfFormula);
}

function resolveLogic(variables) {
  let nullFound = false;
  let rootLength = variables.length;
  for (let i = 0; i < variables.length; i++) {
    let currentSet1 = variables[i];
    for (
      let j = variables[i].isRoot ? i + 1 : 0;
      j < (variables[i].isRoot ? rootLength : i);
      j++
    ) {
      let currentSet2 = variables[j];
      let result = compareVariables(currentSet1, currentSet2, variables.length);
      let newVariables = result.data;

      if (newVariables.length > 0) {
        newVariables.forEach((obj) => {
          if (!objectExists(variables, obj)) {
            variables.push(obj);
            if (obj.variables.length == 1 && obj.variables[0].variable == constants.FALSE_CHAR) {
              nullFound = true;
              return;
            } 
          }
        });
      }
      if (nullFound) {
        return;
      }
    }
  }
}

export function resolveLogicalVariables(variables, variable1, variable2) {
  let result = compareVariables(variable1, variable2, variables.length);
  let newVariables = result.data;
  let message = result.message;
  
  let obj = newVariables[0];
  if (newVariables.length > 0) {
    if (!objectExists(variables, obj)) {
        return {data: obj, message: message};
    } else {
      message = [(
        "Created clause " +
        createString(obj.variables) +
        " already exists.")]
    }
  }
  return {data: null, message: message};
}

function compareVariables(variableObject1, variableObject2, length) {
  let message = [];
  let index = length;
  let variable1 = variableObject1.variables;
  let variable2 = variableObject2.variables;
  let result = [];
  for (let i = 0; i < variable1.length; i++) {
    const element1 = variable1[i];
    for (let j = 0; j < variable2.length; j++) {
      const element2 = variable2[j];
      if (
        element1.variable == element2.variable &&
        element1.isNeg != element2.isNeg
      ) {
        let copiedObject1 = JSON.parse(JSON.stringify(variableObject1));
        let copiedObject2 = JSON.parse(JSON.stringify(variableObject2));
        copiedObject1.variables.splice(i, 1);
        copiedObject2.variables.splice(j, 1);

        let newObject = createnewObject(
          [...copiedObject1.variables, ...copiedObject2.variables],
          false,
          index,
          [variableObject1.index, variableObject2.index]
        );
        index++;
        if (newObject != null) {
          if (newObject.variables.length == 0) {
            result.push( createAbsordumVariable(newObject.index, newObject.parents));
            message.push(
              "Resolution method completed - " +
              createString(result[0].variables) +
              " found.");
          } else {
            result.push(newObject);
            message.push(
              "Adding result " +
              createString(result[0].variables) +
              " from " +
              createString(variable1) +
              " and " +
              createString(variable2) +
              ".");
          }
        } else {
          message.push(
            "Ignoring (true) result from " +
            createString([
              ...copiedObject1.variables,
              ...copiedObject2.variables,
            ]) +
            " - created from " +
            createString(variable1) +
            " and " +
            createString(variable2) +
            ".");
        }
      }
    }
  }
  if (message.length == 0 && result.length == 0) {
    message.push(
      "Nothing to add from " +
      createString(variable1) +
      " and " +
      createString(variable2) +
      ".");
  }
  return { data: result, message: message };
}

function createString(variable) {
  let stringBuilder = "";
  variable.forEach((element) => {
    element.isNeg ? (stringBuilder += "¬") : {};
    stringBuilder += element.variable;
    stringBuilder += "∨";
  });
  return "(" + stringBuilder.slice(0, -1) + ")";
}

function createnewObject(variables, isRoot, index, parentIdArray) {
  if (checkForOpposite(variables)) {
    return null;
  }
  sortVariablesArray(variables);

  return {
    variables: variables.filter(
      (obj, index, self) =>
        index ===
        self.findIndex((t) => JSON.stringify(t) === JSON.stringify(obj))
    ),
    isRoot: isRoot,
    index: index,
    parents: parentIdArray,
  };

  function checkForOpposite(array) {
    for (let i = 0; i < array.length; i++) {
      let current = array[i];
      let oppositeIsNeg = !current.isNeg;
      for (let j = 0; j < array.length; j++) {
        if (
          i !== j &&
          array[j].isNeg === oppositeIsNeg &&
          array[j].variable === current.variable
        ) {
          return true;
        }
      }
    }
    return false;
  }

  function sortVariablesArray(array) {
    array.sort((a, b) => {
      if (a.variable === b.variable) {
        return a.isNeg - b.isNeg;
      } else {
        return a.variable.localeCompare(b.variable);
      }
    });
  }
}

function createAbsordumVariable(index, parentIdArray) {
  return {
    variables: [{ variable: constants.FALSE_CHAR, isNeg: false }],
    isRoot: false,
    index: index,
    parents: parentIdArray,
  };
}

function objectExists(arr, obj) {
  return arr.some(
    (item) => JSON.stringify(item.variables) === JSON.stringify(obj.variables)
  );
}
