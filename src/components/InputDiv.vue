<template>
    <Toast />
    <div>
        <div id="input" class="col-12 md:col-4 input">
            <div class="p-inputgroup">
                <PrimeButton icon="pi pi-check" class="p-button-info" @click="createRandomFormula"> <font-awesome-icon
                        icon="fa-solid fa-dice" /> </PrimeButton>
                <input placeholder="Your formula" ref="input" id="inputbox"
                    v-tooltip.top="`Supported characters are: 'a-Z' and '¬∧∨⇒()'`" v-model="msg" />
                <PrimeButton icon="pi pi-check" class="p-button-success" @click="sendMsg" />
            </div>
        </div>

        <div class="grid buttons">
            <div class="col-12">
                <div class="p-inputgroup">
                    <PrimeButton label="A" class="p-button-outlined p-button-raised" @click="this.addSymbol('A')" />
                    <PrimeButton label="B" class="p-button-outlined p-button-raised" @click="this.addSymbol('B')" />
                    <PrimeButton label="C" class="p-button-outlined p-button-raised" @click="this.addSymbol('C')" />
                    <PrimeButton label="D" class="p-button-outlined p-button-raised" @click="this.addSymbol('D')" />
                    <PrimeButton label="¬" class="p-button-outlined p-button-raised" @click="this.addSymbol('¬')" />
                    <PrimeButton label="∧" class="p-button-outlined p-button-raised" @click="this.addSymbol('∧')" />
                    <PrimeButton label="∨" class="p-button-outlined p-button-raised" @click="this.addSymbol('∨')" />
                    <PrimeButton label="⇒" class="p-button-outlined p-button-raised" @click="this.addSymbol('⇒')" />
                    <PrimeButton label="⇔" class="p-button-outlined p-button-raised" @click="this.addSymbol('⇔')" />
                    <PrimeButton label="(" class="p-button-outlined p-button-raised" @click="this.addSymbol('(')" />
                    <PrimeButton label=")" class="p-button-outlined p-button-raised" @click="this.addSymbol(')')" />
                    <PrimeButton id="deleteBtn" icon="pi pi-delete-left" class="p-button-raised p-button-warning"
                        @click="this.removeLastSymbol()" />
                    <PrimeButton icon="pi pi-trash" class="p-button-danger p-button-raised" @click="toggleOverlay" />
                </div>
                <div>
                    <OverlayPanel ref="op" :dismissable="true" appendTo="body" :showCloseIcon="false" id="overlay_panel">
                        <PrimeButton icon="pi pi-trash" class="p-button-danger p-button-raised"
                            @click="this.removeAllSymbols()" />
                    </OverlayPanel>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    name: "InputDiv",
    data: function () {
        return {
            msg: "",
            cursorPos: 0,
            variables: [],
            operands: [],
            index: 1
        };
    },

    methods: {
        createRandomFormula() {
            const operators = ['∧', '∨', '⇒', '⇔'];
            const variables = ['A', 'B', 'C', 'D'];

            function generateFormula(level) {
                if (level === 0) {
                    let result = "";
                    if (Math.random() < 0.5) {
                        result = `¬${result}`;
                    }
                    return `${result}${variables[Math.floor(Math.random() * variables.length)]}`;
                } else {
                    const randomOperator = operators[Math.floor(Math.random() * operators.length)];
                    let formula = `(${generateFormula(level - 1)} ${randomOperator} `;
                    formula += `${generateFormula(level - 1)})`;

                    if (Math.random() < 0.5) {
                        formula = `¬${formula}`;
                    }
                    return formula;
                }
            }

            function randomRange(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            //this.msg = generateFormula(randomRange(1, 3));
            this.msg = generateFormula(randomRange(1, 3));
            if (this.msg[0] != "¬")
                this.msg = this.msg.substring(1, this.msg.length - 1);
            return true;
        },

        createVariables(variable, operands, isNeg) {
            let varLength = 0;

            //console.log(variable);
            //console.log(variable.length);
            if (variable.length == 0) return null;

            variable.forEach(element => {
                varLength += element.variableLength
                //console.log(varLength);
            });

            let result = this.getAndOrOperands(variable, operands);
            if (result) {
                result.isNeg = isNeg;
                return result;
            }


            return {
                isNeg: isNeg,
                variable: variable,
                operands: operands,
                hasVariables: true,
                variableLength: varLength
            };
        },

        createVariable(variable, isNeg) {
            return {
                isNeg: isNeg,
                variable: variable,
                operands: null,
                hasVariables: false,
                variableLength: 1
            }
        },

        createFormula(input) {
            let correctOperands = ["∧", "∨", "⇒", "⇔"];
            let operands = []; let variables = [];
            let isNeg = input[this.index - 2] == "¬" ? true : false;
            //console.log("createFormula: " + input);
            while (input[this.index] !== ")" && this.index < 100) {
                //console.log(input[this.index]);

                if (input[this.index].toUpperCase().match(/[a-z]/i)) {
                    let createdVar = this.createVariable(input[this.index], input[this.index - 1] == "¬" ? true : false);
                    if (createdVar != null)
                        variables.push(createdVar);
                }

                if (correctOperands.includes(input[this.index])) {
                    operands.push(input[this.index]);
                }

                if (input[this.index] == "(") {
                    this.index++;
                    variables.push(this.createFormula(input));
                }
                this.index++;
            }


            if (variables.length == 1 && variables[0].hasVariables == false) {
                return this.createVariable(variables[0].variable, variables[0].isNeg !== isNeg);
            }

            this.setClosuresByOperands(variables, operands);


            while (variables.length == 1 && variables[0].hasVariables == true) {
                isNeg = (isNeg !== variables[0].isNeg);
                operands = variables[0].operands;
                variables = variables[0].variable;
            }
            return this.createVariables(variables, operands, isNeg);

        },







        convertToCNF(expression) {
            this.index = 1;
            console.log(this.createFormula("(" + expression + ")"));


        },

        getAndOrOperands(variables, operands) {
            if (operands[0] == "⇔" && operands.length == 1) {
                let var2 = [];
                let vars = [];
                if (variables[0].hasVariables)
                    vars.push(this.createVariables(variables[0].variable, variables[0].operands, variables[0].isNeg !== true));
                else
                    vars.push(this.createVariable(variables[0].variable, variables[0].isNeg !== true));

                //vars.push(this.createVariable(variables[1].variable, variables[1].isNeg));
                if (variables[1].hasVariables)
                    vars.push(this.createVariables(variables[1].variable, variables[1].operands, variables[1].isNeg));
                else
                    vars.push(this.createVariable(variables[1].variable, variables[1].isNeg));


                var2.push(this.createVariables(vars, ["∨"], false));
                vars = [];
                //vars.push(this.createVariable(variables[1].variable, variables[1].isNeg !== true));

                if (variables[1].hasVariables)
                    vars.push(this.createVariables(variables[1].variable, variables[1].operands, variables[1].isNeg !== true));
                else
                    vars.push(this.createVariable(variables[1].variable, variables[1].isNeg !== true));

                if (variables[0].hasVariables)
                    vars.push(this.createVariables(variables[0].variable, variables[0].operands, variables[0].isNeg));
                else
                    vars.push(this.createVariable(variables[0].variable, variables[0].isNeg));
                var2.push(this.createVariables(vars, ["∨"], false));

                return this.createVariables(var2, ["∧"], false);
            }

            if (operands[0] == "⇒" && operands.length == 1) {
                return this.createVariables([
                    (this.createVariable(variables[0].variable, variables[0].isNeg !== true)),
                    (this.createVariable(variables[1].variable, variables[1].isNeg))], ["∨"], false);
            }



            return false;
        },

        setClosuresByOperands(variables, operands) {
            if (operands.length > 1) {
                for (let index = 0; index < operands.length; index++) {
                    let result = getSpecificOperandsTogether(this, variables, operands, index, "∧", true);
                    if (result) {
                        operands.splice(index, result.operands.length);
                        variables.splice(index, result.operands.length + 1);
                        variables.splice(index, 0, result);
                    }
                }
                for (let index = 0; index < operands.length; index++) {
                    let result = getSpecificOperandsTogether(this, variables, operands, index, "∨", true);
                    if (result) {
                        operands.splice(index, result.operands.length);
                        variables.splice(index, result.operands.length + 1);
                        variables.splice(index, 0, result);
                    }
                }
                for (let index = 0; index < operands.length; index++) {
                    let result = getSpecificOperandsTogether(this, variables, operands, index, "⇒", false);
                    if (result) {
                        operands.splice(index, result.operands.length);
                        variables.splice(index, result.operands.length + 1);
                        variables.splice(index, 0, result);
                    }
                }
                for (let index = 0; index < operands.length; index++) {
                    let result = getSpecificOperandsTogether(this, variables, operands, index, "⇔", false);
                    if (result) {
                        operands.splice(index, result.operands.length);
                        variables.splice(index, result.operands.length + 1);
                        variables.splice(index, 0, result);
                    }
                }
            }

            function getSpecificOperandsTogether(self, variables, operands, index, specidicOperand, repeat) {
                // console.log(operands[index]);
                if (operands[index] == specidicOperand) {
                    let newOperands = [specidicOperand]
                    let newVariables = [variables[index], variables[index + 1]]
                    let andCount = 0;
                    if (repeat) {
                        for (let i = index + 1; i < operands.length; i++) {
                            if (operands[i] == specidicOperand) {
                                newOperands.push(specidicOperand);
                                newVariables.push(variables[i + 1])
                            } else break;
                        }
                    }
                    return self.createVariables(newVariables, newOperands, false);
                }
                return false
            }
        },

        addSymbol(letter) {
            let inputRef = this.$refs.input,
                startPos = inputRef.selectionStart,
                endPos = inputRef.selectionEnd;

            this.msg = this.msg.substring(0, startPos) + letter + this.msg.substring(endPos, this.msg.length);

            setTimeout(() => {
                startPos += letter.length;
                inputRef.selectionStart = inputRef.selectionEnd = startPos;
            }, 5);

            this.$refs.input.focus();
        },

        removeLastSymbol() {
            let inputRef = this.$refs.input,
                startPos = inputRef.selectionStart,
                endPos = inputRef.selectionEnd;

            if (startPos == endPos) {
                this.msg = this.msg.substring(0, startPos - 1) + this.msg.substring(endPos, this.msg.length);
                startPos--;
            } else
                this.msg = this.msg.substring(0, startPos) + this.msg.substring(endPos, this.msg.length);

            if (startPos < 0) startPos = 0;

            setTimeout(() => {
                inputRef.selectionStart = inputRef.selectionEnd = startPos;
            }, 5);

            this.$refs.input.focus();
        },

        removeAllSymbols() {
            this.msg = "";
            this.$refs.op.hide();
            this.$refs.input.focus();
        },

        toggleOverlay(event) {
            this.$refs.op.toggle(event);
        },

        sendMsg() {
            if (!this.checkMsg()) return false;
            this.convertToCNF(this.msg);
        },



        checkMsg() {
            let msg = this.msg.replace(/\s+/g, '');
            let result = true;
            let closures = 0;
            let wasLetter = false;
            let validClosures = true;
            let validNeg = true;
            let validCorrectChars = true;
            let validDoubleChars = true;
            let validOperands = true;
            let validClosureAndOperands = true;

            for (let i = 0; i < msg.length; i++) {
                if (!checkCorrectChars(msg[i])) validCorrectChars = false;
                if (!checkDoubleChars(msg[i])) validDoubleChars = false;
                if (!checkClosure(msg[i])) validClosures = false;
                if (!checkClosureAndOperands(msg[i], (msg[i - 1]), (msg[i - 2]))) { validClosureAndOperands = false; }
                if (i + 1 < msg.length && !checkNeg(msg[i], msg[i + 1]))
                    validNeg = false;
                if (
                    i + 1 < msg.length &&
                    i - 1 >= 0 &&
                    !checkOperands(msg[i - 1], msg[i], msg[i + 1])
                )
                    validOperands = false;
            }

            if (!wasLetter) validDoubleChars = false;
            if (closures > 0) validClosures = false;
            if (msg[msg.length - 1] == "¬") validNeg = false;


            result =
                validClosures &&
                validCorrectChars &&
                validDoubleChars &&
                validNeg &&
                validOperands &&
                validClosureAndOperands;

            if (!validCorrectChars)
                this.$toast.add({
                    severity: "error",
                    summary: "Wrong Input",
                    detail: "Wrong characters",
                    life: 3000,
                });

            else if (!validClosures || !validClosureAndOperands)
                this.$toast.add({
                    severity: "error",
                    summary: "Wrong Input",
                    detail: "Wrong closures",
                    life: 3000,
                });
            else if (!validNeg)
                this.$toast.add({
                    severity: "error",
                    summary: "Wrong Input",
                    detail: "Wrong position of negations",
                    life: 3000,
                });
            else if (!validDoubleChars)
                this.$toast.add({
                    severity: "error",
                    summary: "Wrong Input",
                    detail: "Wrong position of variables/operands",
                    life: 3000,
                });
            else if (!validOperands)
                this.$toast.add({
                    severity: "error",
                    summary: "Wrong Input",
                    detail: "Wrong position of operands",
                    life: 3000,
                });

            /* console.log("validOperands: " + validOperands);
                   console.log("validDoubleChars: " + validDoubleChars);
                   console.log("CorrectChars: " + validCorrectChars);
                   console.log("Closure: " + validClosures);
                   console.log("Neg: " + validNeg);
                   console.log("**********");*/
            console.log("result: " + result);

            // console.log("******************************************************");

            return result;

            function checkClosure(letter) {
                if (letter == "(") closures++;
                if (letter == ")") closures--;
                return !(closures < 0);
            }

            function checkClosureAndOperands(letter, pervLetter, pervPervLetter) {
                let correctChars = ["∧", "∨", "⇒", "⇔", "("];
                if (letter == "(") {
                    if (pervLetter != undefined && pervLetter == "¬") {
                        if ((pervPervLetter != undefined) && (!correctChars.includes(pervPervLetter))) return false;
                    }
                    else
                        if ((pervLetter != undefined) && (!correctChars.includes(pervLetter))) return false;
                }
                return true;
            }

            function checkCorrectChars(letter) {
                let correctChars = ["¬", "∧", "∨", "⇒", "⇔", "(", ")"];
                return checkCharacters(letter) || correctChars.includes(letter);
            }

            function checkDoubleChars(letter) {
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

            function checkNeg(letter, nextLetter) {
                return (
                    letter != "¬" ||
                    (letter == "¬" && (checkCharacters(nextLetter) || nextLetter == "("))
                );
            }

            function checkOperands(perviousLetter, letter, nextLetter) {
                let operands = ["∧", "∨", "⇒", "⇔"];
                if (!operands.includes(letter)) return true;
                return (
                    operands.includes(letter) &&
                    (checkCharacters(perviousLetter) || perviousLetter == ")") &&
                    (checkCharacters(nextLetter) ||
                        nextLetter == "(" ||
                        nextLetter == "¬")
                );
            }

            function checkCharacters(letter) {
                return (letter.toUpperCase().match(/[a-z]/i));
            }

        },

        removeRedundantParentheses(input) {
            let stack = [];
            let result = '';

            for (let i = 0; i < input.length; i++) {
                if (input[i] === '(') {
                    stack.push(i);
                } else if (input[i] === ')') {
                    if (stack.length === 0) {
                        continue;
                    }
                    let start = stack.pop();
                    if (start === 0 || input[start - 1] === '(') {
                        result += input.substring(start, i + 1);
                    } else {
                        result += input[i];
                    }
                } else {
                    result += input[i];
                }
            }

            return result;
        },
    },
};
</script>

<style>
#inputbox {
    padding-left: 10px;
    flex: 1 1 auto;
}

.p-speeddial-button.p-button.p-button-icon-only {
    display: none;
}

.buttons {
    margin-top: 5px;
    grid-gap: 5px;
}

.p-inputgroup>button {
    margin: 1px !important;
}

.p-button.p-button-warning,
.p-buttonset.p-button-warning>.p-button,
.p-splitbutton.p-button-warning>.p-button {
    border: 1px solid #b98607;
}

.p-button.p-button-danger,
.p-buttonset.p-button-danger>.p-button,
.p-splitbutton.p-button-danger>.p-button {
    border: 1px solid #a60606;
}

#deleteBtn {
    color: #fff;
}
</style>
