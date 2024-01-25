<template>
  <div class="flex flex-col items-center h-screen pt-20 mx-auto max-w-screen-lg w-full">
    <header class="mb-8 w-full h-20">

      <p for="search" class="text-gray-900 text-center">
        This tool generates a visualization of the resolution method for propositional logic formulas. A given formula is not automatically negated. 
        Negate the formula manually or with the button. You can specify the logical
        operators in several different formats. For example, the propositional formula p ∧ q ⇒ ¬r can be written as p
        && q -> ~r, as p and q => not r, or as p & q => !r. You can also write "/" for ease of entering commands. You can
        import DIMACS.txt file or copy the formulas in LaTeX format.
      </p>

    </header>

    <div class="input mb-3 h-30">
      <InputDiv v-on:cnfFormula="showCnf" v-on:inputChange="handleInputChange" />
      <div class="flex pt-2">
        <PrimeButton label="Export cnf as DIMACS" class="p-button-outlined p-button-raised w-full pt-3 pb-3 md:me-1"
          @click="downloadDimacs" />
        <PrimeButton label="Import cnf from DIMACS" class="p-button-outlined p-button-raised w-full pt-3 pb-3"
          @click="triggerFileInput" />
        <input type="file" ref="fileInput" @change="handleFileUpload" accept=".txt" style="display: none;">
      </div>
      <div class="flex pt-2">
        <PrimeButton :label="buttonLabels.CopyInputAsLatexLabel.value" :class="{
          'border-green-700 text-green-700 important-hover': !buttonLabels.CopyInputAsLatexLabel.isDefault
        }" class="p-button-outlined p-button-raised w-full pt-3 pb-3 md:me-1"
          @click="clipboardInputLatex(inputText)" />
        <PrimeButton :label="buttonLabels.CopyCnfAsLatexLabel.value" :class="{
          'border-green-700 text-green-700 important-hover': !buttonLabels.CopyCnfAsLatexLabel.isDefault
        }" class="p-button-outlined p-button-raised w-full pt-3 pb-3"
          @click="clipboardCnfLatex(cnfTextRepresentation)" />
      </div>
    </div>
    <div v-if="cnf != null" class="input mb-3 h-30 w-full">
      <hr class="mt-6">
      <div class="text-area-width flex-auto items-center justify-center mx-auto">
        <h4 class="text-center mt-4">CNF form</h4>
        <textarea wrap="soft" rows="4" disabled class="block p-2.5 w-full text-sm text-gray-900 rounded-lg 
              border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 
              dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          type="text" v-model="cnfTextRepresentation"></textarea>

        <button id="copyToClipboard-a" type="button" :class="{ 'border-green-700': textareaClipboard }" class="clipboard icon 
        js-clipboard p-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-full border 
        border-blue-500 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none 
        dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none 
        dark:focus:ring-1 dark:focus:ring-gray-600" data-clipboard-target="#hs-clipboard-basic"
          data-clipboard-action="copy" data-clipboard-success-text="Copied"
          @click="copyToClipboard(cnfTextRepresentation)">
          <svg v-if="!textareaClipboard" style="color: #2196f3;"
            class="js-clipboard-default w-4 h-4 group-hover:rotate-6 transition text-blue-500"
            xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          </svg>
          <svg v-else class="js-clipboard-success w-4 h-4 text-green-700" xmlns="http://www.w3.org/2000/svg" width="24"
            height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"
            stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>
    </div>

    <div>
      <ul class="flex flex-wrap items-center justify-center text-gray-900 dark:text-white space-y-2">
        <li v-for="(clause, index) in cnf" :key="index" class="mt-2">
          <p class="md:me-2 p-2 pr-4 pl-4 rounded-lg border border-gray-200 no-select">
            {{ formatClause(clause) }}
          </p>
        </li>
      </ul>
    </div>
    <TreeChart />

  </div>
</template>

<script>
import InputDiv from "./components/cnf/InputDiv.vue";
import TreeChart from "./components/TreeChart.vue";
import { convertCnfObjectToCnfString } from "./methods/CnfConvertor";
import { convertObjectToDimas, downloadDimacs } from "./methods/DimacsService";
import replacementArray from './assets/data/latexReplacments.json';

export default {
  components: {
    InputDiv,
    TreeChart
  },
  data() {
    return {
      display: false,
      cnfTextRepresentation: "",
      cnf: null,
      dimacsString: "",
      textareaClipboard: false,
      inputText: "",
      buttonLabels: {
        CopyInputAsLatexLabel: {
          value: "Copy input as LaTeX",
          isDefault: true
        },
        CopyCnfAsLatexLabel: {
          value: "Copy cnf form as LaTeX",
          isDefault: true
        },
      }
    };
  },
  methods: {
    showCnf(cnfFormula) {
      this.cnf = cnfFormula
      this.cnfTextRepresentation = convertCnfObjectToCnfString(this.cnf);
      this.dimacsString = convertObjectToDimas(this.cnf)
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


    clipboardInputLatex(text) {
      if (navigator.clipboard && text.length > 0 && this.buttonLabels.CopyInputAsLatexLabel.isDefault) {
        this.buttonLabels.CopyInputAsLatexLabel.value = "Successfully copied";
        this.buttonLabels.CopyInputAsLatexLabel.isDefault = false;
        this.clipboardLatex(text);
        setTimeout(() => {
          this.buttonLabels.CopyInputAsLatexLabel.value = "Copy input as LaTeX";
          this.buttonLabels.CopyInputAsLatexLabel.isDefault = true;
        }, 1500);
      }
      return
    },
    clipboardCnfLatex(text) {
      if (navigator.clipboard && text.length > 0 && this.buttonLabels.CopyCnfAsLatexLabel.isDefault) {
        this.buttonLabels.CopyCnfAsLatexLabel.value = "Successfully copied";
        this.buttonLabels.CopyCnfAsLatexLabel.isDefault = false;
        this.clipboardLatex(text);
        setTimeout(() => {
          this.buttonLabels.CopyCnfAsLatexLabel.value = "Copy cnf form as LaTeX";
          this.buttonLabels.CopyCnfAsLatexLabel.isDefault = true;
        }, 1500);
      }
      return
    },
    clipboardLatex(text) {
      let result = "$" + text + "$";
      replacementArray.forEach(item => {
        result = result.split(item.text).join(item.value);
        console.log(item)
      });
      navigator.clipboard.writeText(result)
      console.log(result)
    },

    handleInputChange(newValue) {
      this.inputText = newValue;
    },

    formatClause(clause) {
      return clause.map((term) => {
        const variable = term.isNeg ? `¬${term.variable}` : term.variable;
        return variable;
      }).join('∨');
    },

    downloadDimacs() {
      downloadDimacs(convertObjectToDimas(this.cnf))
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    handleFileUpload() {
      const fileInput = this.$refs.fileInput;
      const file = fileInput.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
          const content = e.target.result;
          this.parseDimacsString(content);
        };

        reader.readAsText(file);
      }
    },

    parseToCnfArray(parsedArray, dimacsMaxVariableNumber) {
      return parsedArray.map(subArray => {
        const originalSubArray = subArray.slice(0, -1); // Remove the last number
        return originalSubArray.map(number => {
          const isNeg = number < 0;
          let variable = "";
          if (dimacsMaxVariableNumber < 25) {
            const variableIndex = Math.abs(number) - 1;
            variable = String.fromCharCode('A'.charCodeAt(0) + variableIndex);
            if (variable >= 'F') {
              variable = String.fromCharCode('A'.charCodeAt(0) + variableIndex + 1);
            }
            if (variable >= 'T') {
              variable = String.fromCharCode('A'.charCodeAt(0) + variableIndex + 2);
            }
          }
          else {
            variable = Math.abs(number).toString();

          }
          return { variable, isNeg };
        });
      });
    },

    parseDimacsString(content) {
      this.dimacsString = content;
      const lines = content.split('\n');
      let dimacsArray = lines.map((line) => line.split(' ').map(Number));
      let clausesLength = dimacsArray[0][3];
      let dimacsMaxVariableNumber = dimacsArray[0][2];
      dimacsArray.shift();
      if (clausesLength == dimacsArray.length)
        this.cnf = this.parseToCnfArray(dimacsArray, dimacsMaxVariableNumber)
      this.cnfTextRepresentation = convertCnfObjectToCnfString(this.cnf);
    }
  }
};
</script>

<style scoped>
@tailwind base;
@tailwind components;
@tailwind utilities;

.cnf-text {
  width: 600px;
}

.text-area-width {
  width: 70%;
}

.important-hover:hover {
  --tw-text-opacity: 1;
  color: rgb(4 108 78 / var(--tw-text-opacity)) !important;
  --tw-border-opacity: 1;
  border-color: rgb(4 108 78 / var(--tw-border-opacity)) !important;
}

.no-select {
  user-select: none;
}
</style>

