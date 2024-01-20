<template>
  <Toast />
  <div>
    <div id="input" class="col-12 md:col-4 input">
      <div class="p-inputgroup flex justify-between items-center ">
        <PrimeButton icon="pi pi-check" class="p-button-info flex-none flex" @click="createRandomFormula">
          <font-awesome-icon class="p-1.5 h-4.5" icon="fa-solid fa-dice" />
        </PrimeButton>
        <div class="flex-auto relative">
          <div>
            <input type="text" v-model="msg" placeholder="Type here..." ref="input"
              @keydown.down="handleArrowDown($event)" v-tooltip.top="`Supported characters are: 'a-Z' and '¬∧∨⇒()'. 2 < Suported lenght <30`
                " @keydown.up="handleArrowUp($event)" @keydown.tab.prevent="handleTab"
              @keydown.enter.prevent="selectCommand" class="p-2.5 w-full border border-gray-300">

            <ul v-if="searchCommand.length"
              class="w-full rounded bg-white border border-gray-300 px-4 py-2 space-y-1 absolute z-10">
              <li v-for="(command, index) in searchCommand" :key="command.name" @click="selectCommand(command.name)"
                :class="{ 'cursor-pointer hover:bg-gray-100 p-1': true, 'bg-gray-100': selectedIndex === index }"
                tabindex="0">
                <div class="inline-block p-0.5 mr-1 border border-gray-200 bg-white rounded">
                  {{ command.value }}</div> {{ command.name }}
              </li>
            </ul>
          </div>
        </div>
        <PrimeButton icon="pi pi-check" class="p-button-success flex-none" @click="sendMsg" />
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
            <PrimeButton icon="pi pi-trash" class="p-button-danger p-button-raised" @click="this.removeAllSymbols()" />
          </OverlayPanel>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { createRandomFormula } from "./../../methods/FormulaGenerator";
import {
  createFormula,
  removeClosuresNegations,
  joinClauses,
  reduceVariables,
  distributiveRule,
  sortVariables,
} from "../../methods/CnfConvertor";
import { ref, computed } from 'vue';
import commandList from '../../assets/data/commands.json';
import replacementArray from '../../assets/data/inputReplacements.json';

export default {
  setup() {
    let msg = ref("")

    const searchCommand = computed(() => {
      let inputCommand = getSubstringAfterLastSlash(msg);
      if (inputCommand === "") {
        return []
      }

      let matches = 0

      return commandList.filter(command => {
        if (command.name.toLowerCase().includes(inputCommand.toLowerCase())) {
          matches++
          return command
        }
      })
    });

    const selectCommand = (command) => {
      applyCommand(command);
    }

    let selectedCommand = ref("")

    return {
      commandList,
      msg,
      searchCommand,
      selectCommand,
      selectedCommand
    }

    function applyCommand(command) {
      commandList.forEach(element => {
        if (element.name === command) {
          replaceSubstringAfterLastSlash(msg, element.value)
        }
      })
    }

    function getSubstringAfterLastSlash(inputRef) {
      const inputString = inputRef.value;
      const lastSlashIndex = inputString.lastIndexOf('/');
      if (lastSlashIndex === -1) {
        return '';
      }
      const nextSpaceIndex = inputString.indexOf(' ', lastSlashIndex);
      if (nextSpaceIndex === -1) {
        return inputString.slice(lastSlashIndex);
      }
      return inputString.slice(lastSlashIndex, nextSpaceIndex);
    }



    function replaceSubstringAfterLastSlash(inputRef, replacement) {
      const inputString = inputRef.value;
      const lastSlashIndex = inputString.lastIndexOf('/');
      const nextSpaceIndex = inputString.indexOf(' ', lastSlashIndex);
      if (lastSlashIndex === -1) {
        return inputString;
      }
      if (nextSpaceIndex === -1) {
        const newString = inputString.substring(0, lastSlashIndex) + replacement
        inputRef.value = newString;
        return newString;
      }
      const newString = inputString.substring(0, lastSlashIndex) + replacement + inputString.substring(nextSpaceIndex);
      inputRef.value = newString;
      return newString;
    }
  },
  name: "InputDiv",
  data: function () {
    return {
      msg: "",
      selectedIndex: -1,
      replacementArray: replacementArray
    };
  },
  emits: ["cnfFormula"],

  methods: {
    createRandomFormula() {
      this.msg = createRandomFormula();
    },
    handleArrowDown(event) {
      if (this.searchCommand.length != 0) {
        event.preventDefault();
      }
      if (this.selectedIndex < this.searchCommand.length - 1) {
        this.selectedIndex++;
      }
      if (this.selectedIndex > this.searchCommand.length - 1) {
        this.selectedIndex = this.searchCommand.length - 1;
      }
    },
    handleArrowUp(event) {
      if (this.searchCommand.length != 0) {
        event.preventDefault();
      }
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
      }
      if (this.selectedIndex > this.searchCommand.length - 1) {
        this.selectedIndex = this.searchCommand.length - 1;
      }
    },
    handleTab() {
      if (this.selectedIndex < this.searchCommand.length - 1) {
        this.selectedIndex++;
      } else {
        this.selectedIndex = 0;
      }
    },
    selectCommand() {
      try {
        if (this.selectedIndex !== -1) {
          this.selectCommand(this.searchCommand[this.selectedIndex].name);
          this.selectedIndex = 0;
        }
      } catch (error) { }
    },
    replaceTextValues(inputString) {
      this.replacementArray.forEach(item => {
        inputString = inputString.split(item.text).join(item.value);
      });
      return inputString;
    },


    convertToCNF(expression) {
      let rootClause = createFormula(expression);
      removeClosuresNegations(rootClause);
      joinClauses(rootClause);
      reduceVariables(rootClause);
      distributiveRule(rootClause);
      sortVariables(rootClause);
      console.log("root", rootClause);

      return rootClause;
    },

    addSymbol(letter) {
      let inputRef = this.$refs.input,
        startPos = inputRef.selectionStart,
        endPos = inputRef.selectionEnd;

      this.msg =
        this.msg.substring(0, startPos) +
        letter +
        this.msg.substring(endPos, this.msg.length);

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
        this.msg =
          this.msg.substring(0, startPos - 1) +
          this.msg.substring(endPos, this.msg.length);
        startPos--;
      } else
        this.msg =
          this.msg.substring(0, startPos) +
          this.msg.substring(endPos, this.msg.length);

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
      let editedExpression = "(" + this.replaceTextValues(this.msg) + ")";
      if (!this.checkMsg(editedExpression)) return false;
      let cnfFormula = this.convertToCNF(editedExpression);
      this.$emit(
        "cnfFormula",
        this.convertCnfToString(cnfFormula).slice(1, -1)
      );
    },

    convertCnfToString(FormulaObj) {
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
          resultString += this.convertCnfToString(element);
        } else {
          if (element.isNeg) resultString += "¬";
          resultString += element.variable;
        }
        resultString += FormulaObj.operands[index];
      }
      if (FormulaObj.variable[formulaLength].hasVariables) {
        resultString += this.convertCnfToString(
          FormulaObj.variable[formulaLength]
        );
      } else {
        if (FormulaObj.variable[formulaLength].isNeg) resultString += "¬";
        resultString += FormulaObj.variable[formulaLength].variable;
      }

      resultString += ")";
      return resultString;
    },

    checkMsg(text) {
      let msg = text.replace(/\s+/g, "");
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
          detail:
            "Wrong length. input length must be between 2 - 30 characters.",
          life: 3000,
        });
        return false;
      }

      for (let i = 0; i < msg.length; i++) {
        if (!checkCorrectChars(msg[i])) validCorrectChars = false;
        if (!checkDoubleChars(msg[i])) validDoubleChars = false;
        if (!checkClosure(msg[i])) validClosures = false;
        if (!checkClosureAndOperands(msg[i], msg[i - 1], msg[i - 2])) {
          validClosureAndOperands = false;
        }
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
            if (
              pervPervLetter != undefined &&
              !correctChars.includes(pervPervLetter)
            )
              return false;
          } else if (
            pervLetter != undefined &&
            !correctChars.includes(pervLetter)
          )
            return false;
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
        return letter.toUpperCase().match(/[a-z]/i);
      }
    },
  },
};
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;


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
