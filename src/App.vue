<template>
  <div class="flex flex-col items-center h-screen pt-20 mx-auto max-w-screen-lg w-full pl-12 pr-12">
    <header class="mb-8 w-full h-20">

      <p for="search" class="text-gray-900 text-center">
        This tool generates a visualization of the resolution method for propositional logic formulas. A given formula
        is
        not automatically negated. You can specify the logical
        operators in several different formats. You can also write "/" for ease of entering commands.
      </p>

    </header>

    <div class="input mb-3 h-30">
      <InputDiv v-on:cnfFormula="showCnf" v-on:inputChange="handleInputChange" />
      <div class="flex pt-2">
        <PrimeButton label="Import cnf from DIMACS"
          class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised  md:me-1"
          @click="triggerFileInput" />

        <PrimeButton :label="buttonLabels.CopyInputAsLatexLabel.value" :class="{
          'border-green-700 text-green-700 important-hover': !buttonLabels.CopyInputAsLatexLabel.isDefault
        }" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised"
          @click="clipboardInputLatex(inputText)" />
        <input type="file" ref="fileInput" @change="handleFileUpload" accept=".txt" style="display: none;">
      </div>
      <div class="flex pt-2" v-if="cnf != null">
        <PrimeButton label="Export cnf as DIMACS"
          class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised md:me-1"
          @click="downloadDimacs" />
        <PrimeButton :label="buttonLabels.CopyCnfAsLatexLabel.value" :class="{
          'border-green-700 text-green-700 important-hover': !buttonLabels.CopyCnfAsLatexLabel.isDefault
        }" class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised"
          @click="clipboardCnfLatex(cnfTextRepresentation)" />
      </div>
      <hr class="mt-14 mb-5">
    </div>


    <div class="flex pt-8 w-full" v-if="cnf != null">
      <PrimeButton label="Interactive resolution method" :class="{ 'button-active': resolutionState == 'manual' }"
        class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised md:me-1"
        @click="showManualResolution" />
      <PrimeButton label="Automatic resolution method result" :class="{ 'button-active': resolutionState == 'auto' }"
        class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised"
        @click="showAutoResolution" />
    </div>
    <div class="flex pt-2 w-full" v-if="cnf != null && resolutionState != 'start'">
      <PrimeButton label="Show tree" :class="{ 'button-active': showTree }"
        class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised md:me-1"
        @click="() => { showTree = !showTree }" />
      <PrimeButton label="Show List" :class="{ 'button-active': showList }"
        class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised md:me-1"
        :disabled="resolutionState == 'manual'" @click="() => { showList = !showList }" />
      <PrimeButton label="Show table" :class="{ 'button-active': showTable }"
        class="p-2 pr-4 pl-4 rounded-lg border w-full border-gray-200 no-select p-button-outlined p-button-raised"
        @click="() => { showTable = !showTable }" />
    </div>



    <div class="mb-4 mt-8"
      v-if="(showList || showTree) && cnf && !(cnf[0].variables[0].variable == '⊤' || cnf[0].variables[0].variable == '⊥')">
      <ul class="flex flex-wrap items-center justify-center text-gray-900 dark:text-white space-y-2">
        <li class="mt-2">
          <p class="md:me-2 p-2 pr-4  pl-4 rounded-lg border border-gray-200 no-select"
            :style="{ color: 'rgb(55, 55, 55)', background: 'linear-gradient(45deg, rgb(51, 51, 51) 10px,rgba(255,255,255,1) 13px)' }">
            Original CNF clause
          </p>
        </li>
        <li class="mt-2">
          <p class="md:me-2 p-2 pr-4  pl-4 rounded-lg border border-gray-200 no-select"
            :style="{ color: 'rgb(50, 50, 50)', background: 'linear-gradient(45deg, rgb(252, 219, 3) 10px,rgba(255,255,255,1) 13px)' }">
            Created by resolution method
          </p>
        </li>
        <li class="mt-2">
          <p class="md:me-2 p-2 pr-4  pl-4 rounded-lg border border-gray-200 no-select"
            :style="{ color: 'rgb(45, 45, 45)', background: 'linear-gradient(45deg, rgb(252, 53, 3) 10px,rgba(255,255,255,1) 13px)' }">
            Last added with resolution method
          </p>
        </li>
      </ul>
    </div>

    <div class="input mb-3 mt-4 h-30 w-full"
      v-if="showList && cnf && !(cnf[0].variables[0].variable == '⊤' || cnf[0].variables[0].variable == '⊥')">
      <div class="w-full items-center justify-center mx-auto text-center whitespace-pre-line text-l font-bold"
        v-if="resolutionState == 'manual' && userResolutionCnf.length > 0">{{ resolveMessage }}</div>
      <ul class="flex flex-wrap items-center justify-center text-gray-900 dark:text-white space-y-2">
        <li v-for="(clause, index) in resolutionListCnf" :key="index" class="mt-2">
          <PrimeButton
            class="clause-button md:me-2 p-2 pr-6 pl-6 rounded-lg border-none border-gray-200 no-select p-button-outlined p-button-raised"
            :disabled="resolutionState !== 'manual'" @click="markClause(clause)"
            :style="{
              background: isClauseSelected(clause) ? '' : 'linear-gradient(45deg,' + ((clause.index === (resolutionState == 'manual' ?
                userResolutionCnf[userResolutionCnf.length - 1].index : originalResolutionCnf[originalResolutionCnf.length - 1].index) &&
                !clause.isRoot) ? 'rgb(252, 53, 3)' : (clause.isRoot ? 'rgb(51, 51, 51)' : 'rgb(252, 219, 3)')) + '10px,rgba(255,255,255,1) 13px)',
              backgroundColor: isClauseSelected(clause) ? 'rgb(153, 187, 240)' : 'rgb(246,251,255)', color: isClauseSelected(clause) ? 'rgb(255,255,255)' : ''
            }">
            {{ formatClause(clause) }}
          </PrimeButton>
        </li>
      </ul>


      <div class="w-full pt-6 items-center justify-center mx-auto text-center text-l font-bold"
        v-if="resolutionListCnf.length > 0">Filter</div>
      <ul class="flex flex-wrap items-center justify-center text-gray-900 dark:text-white space-y-2 mb-2">
        <li v-for="(variable, index) in allVariablesList" :key="index" class="mt-2">
          <PrimeButton
            class=" md:me-2 p-1 pr-2 pl-2 rounded-lg border border-gray-200 no-select p-button-outlined p-button-raised"
            :class="{ 'button-active': isVariableToggled(variable, false) }" @click="toggleVariable(variable, false)">
            {{ variable }}
          </PrimeButton>
          <PrimeButton
            class=" md:me-2 p-1 pr-2 pl-2 rounded-lg border border-gray-200 no-select p-button-outlined p-button-raised"
            :class="{ 'button-active': isVariableToggled(variable, true) }" @click="toggleVariable(variable, true)">
            {{ "¬" + variable }}
          </PrimeButton>
        </li>
      </ul>
    </div>

    <div class="input mb-3 mt-16 h-30 w-full">
      <TreeChart :treeData="resolutionCnf" :showTree="showTree" />
    </div>

    <div class="input mb-3 mt-16 h-30 w-full" v-if="showTable && resolutionCnf.length > 0">
      <CnfTable @mark-clause="markClause" :treeData="resolutionCnf" />
    </div>


    <div v-if="cnf != null" class="input mb-3 h-30 w-full">
      <hr class="mt-6 mb-12">
      <TextField :title="'CNF form'" :text=cnfTextRepresentation />
    </div>

    <div class="input pb-5 mt-5 h-30 w-full">
      <TextField v-if="resolutionCnfTextRepresentation.length > 0 && resolutionState != 'start'"
        :title="'Resolution CNF form'" :text=resolutionCnfTextRepresentation />
    </div>

    <footer>Please leave feedback here: <a style="color: #0070CC;" class="pb-32 underline"
        href="https://docs.google.com/forms/d/e/1FAIpQLSecd7W9t8zbbu-KCTKwzCeUDC2hGYh1iwjHjwO4ppdF5YfUQw/viewform">https://docs.google.com/forms</a>
    </footer>
  </div>
</template>

<script>
import InputDiv from "./components/InputDiv.vue";
import TreeChart from "./components/TreeChart.vue";
import TextField from "./components/TextField.vue";
import CnfTable from "./components/CnfTable.vue";
import { convertCnfObjectToCnfString } from "./methods/CnfConvertor";
import { convertObjectToDimas, downloadDimacs } from "./methods/DimacsService";
import { applyResolutionLogic, resolveLogicalVariables } from "./methods/ResolutionLogicService";
import replacementArray from './assets/data/latexReplacments.json';

export default {
  components: {
    InputDiv,
    TreeChart,
    TextField,
    CnfTable
  },
  data() {
    return {
      display: false,
      cnfTextRepresentation: "",
      resolutionCnfTextRepresentation: "",
      originalResolutionCnfTextRepresentation: "",
      cnf: null,
      resolveMessage: "Click on clause to choose it for resolution",
      resolutionCnf: [],
      resolutionListCnf: [],
      originalResolutionCnf: [],
      userResolutionCnf: [],
      allVariablesList: [],
      allVariablesToggleList: [],
      filterStatus: "and",
      dimacsString: "",
      textareaClipboard: false,
      resolutionTextareaClipboard: false,
      resolutionState: 'start',
      selectedClauses: [],
      inputText: "",
      showTree: false,
      showTable: false,
      showList: false,
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

  computed: {
    isClauseSelected() {
      return clause => this.selectedClauses.some(selected => selected.index === clause.index);
    }
  },
  methods: {
    showCnf(cnfFormula) {
      this.cnf = cnfFormula
      this.cnfTextRepresentation = convertCnfObjectToCnfString(this.cnf);
      this.dimacsString = convertObjectToDimas(this.cnf)
      this.allVariablesList = this.getAllVariableList();

      this.userResolutionCnf = JSON.parse(JSON.stringify(this.cnf))

      this.originalResolutionCnf = JSON.parse(JSON.stringify(this.cnf))

      applyResolutionLogic(this.originalResolutionCnf)
      this.resolutionCnfTextRepresentation = convertCnfObjectToCnfString(this.userResolutionCnf);
      this.originalResolutionCnfTextRepresentation = convertCnfObjectToCnfString(this.originalResolutionCnf);

      if (this.resolutionState == "auto") {
        this.resolutionCnf = JSON.parse(JSON.stringify(this.originalResolutionCnf))
      } else {
        this.resolutionCnf = JSON.parse(JSON.stringify(this.cnf))
      }
      this.resolutionListCnf = this.filterByToggleList(JSON.parse(JSON.stringify(this.resolutionCnf)));
      this.resolveMessage = "Click on clause to choose it for resolution"
    },

    showManualResolution() {
      this.resolutionState = 'manual';
      this.showList = true;
      this.resolutionCnf = JSON.parse(JSON.stringify(this.userResolutionCnf));
      this.resolutionListCnf = this.filterByToggleList(JSON.parse(JSON.stringify(this.resolutionCnf)));
      this.resolutionCnfTextRepresentation = convertCnfObjectToCnfString(this.userResolutionCnf);
    },
    showAutoResolution() {
      this.resolutionState = 'auto';
      this.showList = true;
      this.selectedClauses = [];
      this.resolutionCnf = JSON.parse(JSON.stringify(this.originalResolutionCnf));
      this.resolutionListCnf = this.filterByToggleList(JSON.parse(JSON.stringify(this.resolutionCnf)));
      this.resolutionCnfTextRepresentation = this.originalResolutionCnfTextRepresentation;
    },

    toggleVariable(variable, isNeg) {
      const index = this.allVariablesToggleList.findIndex(item => item.variable === variable && item.isNeg === isNeg);
      if (index === -1) {
        this.allVariablesToggleList.push({ variable, isNeg });
      } else {
        this.allVariablesToggleList.splice(index, 1);
      }
      this.resolutionListCnf = this.filterByToggleList(JSON.parse(JSON.stringify(this.resolutionCnf)));
    },

    filterByToggleList(data) {
      if (this.allVariablesToggleList.length == 0) {
        return data;
      }
      return data.filter(item => {
        return this.allVariablesToggleList.some(toggleItem => {
          return item.variables.some(variable => {
            return variable.variable === toggleItem.variable && variable.isNeg === toggleItem.isNeg;
          });
        });
      });
    },

    isVariableToggled(variable, isNeg) {
      return this.allVariablesToggleList.some(item => item.variable === variable && item.isNeg === isNeg);
    },

    getAllVariableList() {
      const allVariablesSet = new Set();
      this.cnf.forEach(item => {
        item.variables.forEach(variable => {
          allVariablesSet.add(variable.variable);
        });
      });
      return Array.from(allVariablesSet).sort();
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

    markClause(clause) {
      if (this.selectedClauses.length === 2) {
        return;
      }
      const existingIndex = this.selectedClauses.findIndex(selectedClause => selectedClause.index === clause.index);
      if (existingIndex === -1) {
        this.selectedClauses.push(clause);
      } else {
        this.selectedClauses.splice(existingIndex, 1);
      }

      if (this.selectedClauses.length === 2) {
        this.chceckGivenClases([...this.selectedClauses]);
        setTimeout(() => { this.selectedClauses = []; }, 500);
      }
    },

    chceckGivenClases(clauseArray) {
      let resolveResult = resolveLogicalVariables(this.userResolutionCnf, clauseArray[0], clauseArray[1])
      let resultClause = resolveResult.data;
      this.resolveMessage = formatMessageArray(resolveResult.message);
      if (resultClause != null) {
        this.userResolutionCnf.push(resultClause);
        this.resolutionCnf = [...this.resolutionCnf, resultClause];
        this.resolutionListCnf = this.filterByToggleList(JSON.parse(JSON.stringify(this.resolutionCnf)));
        if (!this.resolutionListCnf.some(clause => clause.index === resultClause.index)) {
          this.resolutionListCnf.push(resultClause);
        }
      }

      function formatMessageArray(array) {
        let message = ""
        array.forEach(element => {
          message += element + '\n'
        });
        return message
      }
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
        const originalSubArray = subArray.slice(0, -1);
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
  background-color: rgb(153, 187, 240);
}

.button-active {
  border-color: #0288d1 !important;
  background-color: #0288d1 !important;
  color: white !important;
}


.text-area-width {
  width: 70%;
}

.resolution-text-area-width {
  width: 100%;
}

.clause-button:hover {
  border: none !important;
  background: rgb(246, 251, 255) !important;
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
