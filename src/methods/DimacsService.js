export function convertObjectToDimas(cnfFormula) {
  try{
    let dimacsMaxVariableNumber = 0;
    const variableMap = new Map();
    const resultArray = cnfFormula.map(subArray => {
      const resultSubArray = [];
      subArray.variables.forEach(({ variable, isNeg }) => {
        let variableNumber;
        if (variableMap.has(variable)) {
          variableNumber = variableMap.get(variable);
        } else {
          variableNumber = variableMap.size + 1;
          dimacsMaxVariableNumber++;
          variableMap.set(variable, variableNumber);
        }
        resultSubArray.push(isNeg ? -variableNumber : variableNumber);
      });
      return resultSubArray;
    });
    resultArray.unshift([resultArray.length, dimacsMaxVariableNumber]);
    return arrayToDimacs(resultArray);
  }catch(error){
  }

    function arrayToDimacs(arr) {
        let dimacsMaxVariableNumber = arr[0][1];
        arr.shift();
        let dimacsString = `p cnf ${dimacsMaxVariableNumber} ${arr.length}\n`;
        arr.forEach((clause) => {
          clause.forEach((literal) => {
            dimacsString += `${literal} `;
          });
          dimacsString += '0\n';
        });
        return dimacsString.trim();
      }
  }

  export function downloadDimacs(dimacsString) {
    if(dimacsString === undefined || dimacsString === null || dimacsString === "") return;
    const blob = new Blob([dimacsString], { type: 'text/plain' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dimacs_file.txt';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }