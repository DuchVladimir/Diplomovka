<template>
  <Toast />
  <div>
    <div id="input" class="col-12 md:col-4 input">
      <PrimeButton :class="{ 'negation-button-active': isNegFormula }"
        class="p-2 pr-4 pl-4 rounded-lg border border-gray-200 no-select p-button-outlined p-button-raised negation-button pt-3 pb-3 mb-2" label="Negate formula"
        @click="negFormula">
      </PrimeButton>
      <div class="p-inputgroup flex justify-between items-end ">
        <PrimeButton icon="pi pi-check" class="p-button-info flex-none flex h-full" @click="createRandomFormula">
          <font-awesome-icon class="p-1.5 h-4.5" icon="fa-solid fa-dice" />
        </PrimeButton>
        <div class="flex-auto">
          <textarea wrap="soft" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg 
              border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 
              dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder='Type here...&#10;Example with input variants: ¬(((!E ⇔ ∼E) <=> (E or ¬G)) ⇒ (¬(neg A ∨ NEG B) || (¬C ⇔ B))) AND (((¬A <-> ¬C) /\ ¬(¬C ∨ ¬A)) & ¬(¬(D \/ ¬D) ∧ (D impl ¬C)))&#10;You can submit empty input to test this clause.' type="text" v-model="msg" ref="input" @keydown.down="handleArrowDown($event)"
            @keydown.up="handleArrowUp($event)" @keydown.tab.prevent="handleTab"
            @keydown.enter="selectCommandWithEnter($event)"></textarea>

          <button id="copyToClipboard-a" type="button" :class="{ 'border-green-700': textareaClipboard }"
            class="clipboard 
          icon js-clipboard p-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-full border bg-white text-gray-800 
          border-blue-500 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 
          dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" data-clipboard-target="#hs-clipboard-basic" data-clipboard-action="copy"
            data-clipboard-success-text="Copied" @click="copyToClipboard(msg)">
            <svg v-if="!textareaClipboard" class="js-clipboard-default w-4 h-4 group-hover:rotate-6 transition"
              style="color: #2196f3;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            </svg>
            <svg v-else class="js-clipboard-success w-4 h-4 text-green-600" xmlns="http://www.w3.org/2000/svg" width="24"
              height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"
              stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>

          <ul v-if="searchCommand.length"
            class="w-full rounded bg-white border border-gray-300 px-4 py-2 space-y-1 absolute z-10">
            <li v-for="(command, index) in searchCommand" :key="command.name"
              @click="selectCommandWithClick(command.name)"
              :class="{ 'cursor-pointer hover:bg-gray-100 p-1': true, 'bg-gray-100': selectedIndex === index }"
              tabindex="0">
              <div class="inline-block p-0.5 mr-1 border border-gray-200 bg-white rounded">
                {{ command.value }}</div> {{ command.name }}
            </li>
          </ul>
        </div>
        <PrimeButton icon="pi pi-check" class="p-button-success flex-none h-full" @click="sendMsg" />
      </div>
    </div>

    <div class="grid buttons">
      <div class="col-12">
        <div class="p-inputgroup">
          <PrimeButton label="A" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised " @click="this.addSymbol('A')" />
          <PrimeButton label="B" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised " @click="this.addSymbol('B')" />
          <PrimeButton label="C" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised" @click="this.addSymbol('C')" />
          <PrimeButton label="D" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised " @click="this.addSymbol('D')" />
          <PrimeButton label="¬" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised " @click="this.addSymbol('¬')" />
          <PrimeButton label="∧" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised " @click="this.addSymbol('∧')" />
          <PrimeButton label="∨" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised " @click="this.addSymbol('∨')" />
          <PrimeButton label="⇒" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised " @click="this.addSymbol('⇒')" />
          <PrimeButton label="⇔" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised " @click="this.addSymbol('⇔')" />
          <PrimeButton label="(" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised" @click="this.addSymbol('(')" />
          <PrimeButton label=")" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised" @click="this.addSymbol(')')" />
          <PrimeButton label="⊤" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised" @click="this.addSymbol('⊤')" />
          <PrimeButton label="⊥" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised" @click="this.addSymbol('⊥')" />
          <PrimeButton id="deleteBtn" icon="pi pi-delete-left" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-raised p-button-warning"
            @click="this.removeLastSymbol()" />
          <PrimeButton icon="pi pi-trash" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select  p-button-danger p-button-raised" @click="toggleOverlay" />
        </div>
        <div>
          <OverlayPanel ref="op" :dismissable="true" appendTo="body" :showCloseIcon="false" id="overlay_panel">
            <PrimeButton icon="pi pi-trash" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-danger p-button-raised" @click="this.removeAllSymbols()" />
          </OverlayPanel>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { createRandomFormula } from "./../methods/FormulaGenerator";
import {
  createFormula,
  removeClosuresNegations,
  joinClauses,
  reduceVariables,
  distributiveRule,
  sortVariables,
  convertObjectToFinalArray,
  formulaLog
} from "../methods/CnfConvertor";
import { ref, computed } from 'vue';
import commandList from '../assets/data/commands.json';
import replacementArray from '../assets/data/inputReplacements.json';

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
        if (("/" + command.name.toLowerCase()).includes(inputCommand.toLowerCase()) || ("\\" + command.name.toLowerCase()).includes(inputCommand.toLowerCase())) {
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
      const lastSlashIndex = lastIndexOfSlash(inputString) // inputString.lastIndexOf('/');

      if (lastSlashIndex === -1) {
        return '';
      }
      const nextSpaceIndex = inputString.indexOf(' ', lastSlashIndex);
      if (nextSpaceIndex === -1) {
        return inputString.slice(lastSlashIndex);
      }
      return inputString.slice(lastSlashIndex, nextSpaceIndex);

      function lastIndexOfSlash(str) {
        let lastIndex = -1;
        for (let i = str.length - 1; i >= 0; i--) {
          if ((str[i] === '/' && (i === 0 || str[i - 1] !== '\\')) || str[i] === '\\' && (i === 0 || str[i - 1] !== '/')) {
            lastIndex = i;
            break;
          }
        }
        return lastIndex;
      }
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
      selectedIndex: 0,
      replacementArray: replacementArray,
      textareaClipboard: false,
      isNegFormula: false
    };
  },
  emits: ["cnfFormula", "inputChange"],

  methods: {
    createRandomFormula() {
      this.msg = createRandomFormula();
    },
    copyToClipboard(text) {
      if (navigator.clipboard && text.length > 0 && !this.textareaClipboard) {
        navigator.clipboard.writeText(text)
        this.textareaClipboard = true;
        console.log("Clipboar")
        setTimeout(() => {
          this.textareaClipboard = false;
        }, 1000);
      }
      return
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
    negFormula() {
      if (this.isNegFormula) {
        if (this.msg.startsWith("¬(") && this.msg.endsWith(")")) {
          this.msg = this.msg.slice(2, -1);
        }
        this.isNegFormula = false;
      } else {
        this.msg = "¬(" + this.msg + ")";
        this.isNegFormula = true;
      }
    },
    selectCommandWithClick() {
      console.log("selecting");
      try {
        if (this.selectedIndex !== -1) {
          this.selectCommand(this.searchCommand[this.selectedIndex].name);
          this.selectedIndex = 0;
        }
      } catch (error) { console.log(error); }
    },
    selectCommandWithEnter(event) {
      if (this.searchCommand.length != 0) {
        event.preventDefault();
        this.selectCommandWithClick();
        console.log("sss")
      }
    },
    replaceTextValues(inputString) {
      this.replacementArray.forEach(item => {
        inputString = inputString.split(item.text).join(item.value);
      });
      return inputString.replace(/\s/g, "").replace(/¬¬/g, "");
    },
    convertToCNF(expression) {
      console.log("input expression: " + expression);
      
      let rootClause = createFormula(expression);
      console.log("createFormula", formulaLog(rootClause));

      removeClosuresNegations(rootClause);
      console.log("removeClosuresNegations", formulaLog(rootClause));

      joinClauses(rootClause);
      console.log("joinClauses", formulaLog(rootClause));

      reduceVariables(rootClause);
      console.log("reduceVariables", formulaLog(rootClause));

      distributiveRule(rootClause);
      console.log("distributiveRule", formulaLog(rootClause));

      sortVariables(rootClause);
      console.log("sortVariables", formulaLog(rootClause));

      return convertObjectToFinalArray(rootClause)
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
      if(this.msg.length == 0) {this.msg = "¬(((¬E ⇔ ¬E) ⇔ (E ∨ ¬G)) ⇒ (¬(¬A ∨ ¬B) ∨ (¬C ⇔ B))) ∧ (((¬A ⇔ ¬C) ∧ ¬(¬C ∨ ¬A)) ∧ ¬(¬(D ∨ ¬D) ∧ (D ⇒ ¬C)))";}
      let editedExpression = "(" + this.replaceTextValues(this.msg) + ")";
      if (!this.checkMsg(editedExpression)) return false;
      let cnfFormula = this.convertToCNF(editedExpression);
      this.$emit(
        "cnfFormula",
        cnfFormula
      );
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
        let correctChars = ["¬", "∧", "∨", "⇒", "⇔", "(", ")", "⊥", "⊤"];
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
          (letter == "¬" && (checkCharacters(nextLetter) || nextLetter == "(" || nextLetter == "¬"))
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
        return letter.toUpperCase().match(/[a-z]/i) || letter === "⊤" || letter === "⊥";
      }
    },
  },
  watch: {
    msg(inputChange) {
      this.$emit('inputChange', inputChange);
    }
  }
};
</script>


<style scoped>
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

.negation-button {
  margin-left: 14%;
  width: 72%;
  margin-right: 14%;
}

.negation-button-active {
  border-color: #0288d1 !important;
  background-color: #0288d1 !important;
  color: white !important;
}

.p-inputgroup>button {
  margin: 1px !important;
}

.p-button.p-button-warning,
.p-buttonset.p-button-warning>.p-button,
.p-splitbutton.p-button-warning>.p-button {
	background: #fab710;
	color: #ffffff;
	border-color: #fab710;
}

.p-button.p-button-warning:enabled:hover, .p-buttonset.p-button-warning > .p-button:enabled:hover, .p-splitbutton.p-button-warning > .p-button:enabled:hover {
  border: 1px solid #b98607;
  color: #b98607;
  background: #ffffff;
}

.p-button.p-button-danger,
.p-buttonset.p-button-danger>.p-button,
.p-splitbutton.p-button-danger>.p-button {
  background: #c02929;
	color: #ffffff;
	border-color: #c02929;
}

.p-button.p-button-danger:enabled:hover, .p-buttonset.p-button-danger > .p-button:enabled:hover, .p-splitbutton.p-button-danger > .p-button:enabled:hover {
  border: 1px solid #a60606;
  color: #a60606;
  background: #ffffff;
}

.p-inputgroup-addon:first-child, .p-inputgroup button:first-child, .p-inputgroup input:first-child, .p-inputgroup > .p-inputwrapper:first-child, .p-inputgroup > .p-inputwrapper:first-child > .p-inputtext {
	border-top-left-radius: 0.5rem;
	border-bottom-left-radius: 0.5rem;
}

.p-inputgroup-addon:last-child, .p-inputgroup button:last-child, .p-inputgroup input:last-child, .p-inputgroup > .p-inputwrapper:last-child, .p-inputgroup > .p-inputwrapper:last-child > .p-inputtext {
	border-top-right-radius:  0.5rem;
	border-bottom-right-radius:  0.5rem;
}

.p-button.p-button-info, .p-buttonset.p-button-info > .p-button, .p-splitbutton.p-button-info > .p-button {

  background: #027abc;
	color: #ffffff;
	border-color: #027abc;
}

.p-button.p-button-info:enabled:hover, .p-buttonset.p-button-info > .p-button:enabled:hover, .p-splitbutton.p-button-info > .p-button:enabled:hover {
  color: #027abc;
  background: #ffffff;
}

.p-button.p-button-success, .p-buttonset.p-button-success > .p-button, .p-splitbutton.p-button-success > .p-button {
  background: #5e8f32;
	color: #ffffff;
	border-color: #5e8f32
}

.p-button.p-button-success:enabled:hover, .p-buttonset.p-button-success > .p-button:enabled:hover, .p-splitbutton.p-button-success > .p-button:enabled:hover {
  color: #689F38;
  background: #ffffff;
}

.clipboard {
  position: absolute;
  bottom: 10px;
  right: 10px;
  margin-top: 4px;
  margin-left: 4px;
  border-radius: 25px !important;
}
</style>
