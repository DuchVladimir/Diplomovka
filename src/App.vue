<template>
  <div class="flex flex-col items-center h-screen pt-20 mx-auto max-w-screen-lg w-full">
    <header class="mb-8 w-full h-20">

      <p for="search" class="text-gray-900 text-center">
        This tool generates a visualization of the resolution method for propositional logic formulas. A given formula is
        not automatically negated.
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
      <div class="text-area-width flex-auto items-center justify-center mx-auto">
        <TextField :title="'CNF form'" :text=cnfTextRepresentation />
      </div>
      <hr class="mt-6">
    </div>

    <div>
      <ul class="flex flex-wrap items-center justify-center text-gray-900 dark:text-white space-y-2">
        <li v-for="(clause, index) in resolutionCnf" :key="index" class="mt-2">
          <p class="md:me-2 p-2 pr-4 pl-4 rounded-lg border border-gray-200 no-select">
            {{ formatClause(clause) }}
          </p>
        </li>
      </ul>
    </div>


    <TextField v-if="resolutionCnfTextRepresentation.length > 0" :title="'Resolution CNF form'"
      :text=resolutionCnfTextRepresentation />

    <TreeChart :treeData="resolutionCnf" />

  </div>
</template>

<script>
import InputDiv from "./components/InputDiv.vue";
import TreeChart from "./components/TreeChart.vue";
import TextField from "./components/TextField.vue";
import { convertCnfObjectToCnfString } from "./methods/CnfConvertor";
import { convertObjectToDimas, downloadDimacs } from "./methods/DimacsService";
import { applyResolutionLogic } from "./methods/ResolutionLogicService";
import replacementArray from './assets/data/latexReplacments.json';

export default {
  components: {
    InputDiv,
    TreeChart,
    TextField
  },
  data() {
    return {
      display: false,
      cnfTextRepresentation: "",
      resolutionCnfTextRepresentation: "",
      cnf: null,
      resolutionCnf: null,
      dimacsString: "",
      textareaClipboard: false,
      resolutionTextareaClipboard: false,
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

      this.resolutionCnf = JSON.parse(JSON.stringify(this.cnf))
      applyResolutionLogic(this.resolutionCnf)
      this.resolutionCnfTextRepresentation = convertCnfObjectToCnfString(this.resolutionCnf);

      // updateTree(this.resolutionCnfTextRepresentation);
      console.log(this.cnf);
    },

    copyToClipboard(text) {
      if (navigator.clipboard && text.length > 0 && !this.textareaClipboard) {
        navigator.clipboard.writeText(text)
        this.textareaClipboard = true;
        setTimeout(() => {
          this.textareaClipboard = false;
        }, 1000);
      }
      return
    },


    resolutionCopyToClipboard(text) {
      if (navigator.clipboard && text.length > 0 && !this.resolutionTextareaClipboard) {
        navigator.clipboard.writeText(text)
        this.resolutionTextareaClipboard = true;
        setTimeout(() => {
          this.resolutionTextareaClipboard = false;
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
      });
      navigator.clipboard.writeText(result)
    },

    handleInputChange(newValue) {
      this.inputText = newValue;
    },

    formatClause(clause) {
      return clause.variables.map((term) => {
        const variable = term.isNeg ? `¬${term.variable}` : term.variable;
        return variable;
      }).join('∨');
    },

    downloadDimacs() {
      console.log("download", this.cnf)
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
      let index = 0;
      return parsedArray.map(subArray => {
        const originalSubArray = subArray.slice(0, -1); // Remove the last number
        let arrayElement = {
          variables: [],
          isRoot: true,
          index: index
        }
        index++;
        arrayElement.variables = originalSubArray.map(number => {
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

        return arrayElement;
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
      console.log("heloo", this.cnf);
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

.resolution-text-area-width {
  width: 100%;
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

