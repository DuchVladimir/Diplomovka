<template>
    <Toast />
    <div>
        <div id="input" class="col-12 md:col-4 input">
            <div class="p-inputgroup">
                <PrimeButton icon="pi pi-check" class="p-button-info" @click="createRandomFormula"> <font-awesome-icon
                        icon="fa-solid fa-dice" /> </PrimeButton>
                <input placeholder="Your formula" ref="input" id="inputbox"
                    v-tooltip.top="`Supported characters are: 'a-Z' and '¬∧∨⇒()'. 2 < Suported lenght <30`" v-model="msg" />
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

import { createRandomFormula } from './../../methods/FormulaGenerator'
import { reduceToAndOrOperands, createFormula, removeClosuresNegations, joinClauses, reduceVariables, sortVariables, setClosuresByOperands, createVariable, createVariables } from '../../methods/CnfConvertor';

export default {
    name: "InputDiv",
    data: function () {
        return {
            msg: "",
        };
    },
    emits: ['cnfFormula'],

    methods: {
        createRandomFormula() {
            this.msg = createRandomFormula()
        },

        convertToCNF(expression) {
            let rootClause = createFormula("(" + expression + ")");
            removeClosuresNegations(rootClause);
            joinClauses(rootClause);
            // sortVariables(rootClause);
            reduceVariables(rootClause);
            console.log("root", rootClause)

            return rootClause;
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
            let cnfFormula = this.convertToCNF(this.msg);
            this.$emit('cnfFormula', this.convertCnfToString(cnfFormula).slice(1, -1));
        },

        convertCnfToString(FormulaObj) {
            if (FormulaObj.variableLength == 1 && FormulaObj.isNeg == true) return "(¬" + FormulaObj.variable + ")";
            if (FormulaObj.variableLength == 1 && FormulaObj.isNeg == false) return "(" + FormulaObj.variable + ")";
            let formulaLength = FormulaObj.operands.length;
            let resultString = "";

            if (FormulaObj.isNeg) resultString += "¬";
            resultString += "("

            for (let index = 0; index < formulaLength; index++) {
                const element = FormulaObj.variable[index];
                if (element.hasVariables) {
                    resultString += this.convertCnfToString(element);
                } else {
                    if (element.isNeg)
                        resultString += "¬";
                    resultString += element.variable;
                }
                resultString += FormulaObj.operands[index];
            }
            if (FormulaObj.variable[formulaLength].hasVariables) {
                resultString += this.convertCnfToString(FormulaObj.variable[formulaLength]);
            } else {
                if (FormulaObj.variable[formulaLength].isNeg) resultString += "¬";
                resultString += FormulaObj.variable[formulaLength].variable;
            }

            resultString += ")";
            return resultString;
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

            if (this.msg.length < 2) {
                this.$toast.add({
                    severity: "error",
                    summary: "Wrong Input",
                    detail: "Wrong length. input length must be between 2 - 30 characters.",
                    life: 3000,
                });
                return false;
            }

            for (let i = 0; i < msg.length; i++) {
                if (!checkCorrectChars(msg[i])) validCorrectChars = false;
                if (!checkDoubleChars(msg[i])) validDoubleChars = false;
                if (!checkClosure(msg[i])) validClosures = false;
                if (!checkClosureAndOperands(msg[i], (msg[i - 1]), (msg[i - 2]))) { validClosureAndOperands = false; }
                if (i + 1 < msg.length && !checkNeg(msg[i], msg[i + 1])) validNeg = false;
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
