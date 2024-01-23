<template>
  <div class="flex flex-col items-center h-screen pt-20 mx-auto max-w-screen-lg w-full">
    <header class="mb-4 w-full h-20">

      <p for="search" class="text-gray-900 text-center">
        This tool generates a visualization of the resolution method for propositional logic formulas. You can specify the
        logical
        operators in several different formats. For example, the propositional formula p ∧ q ⇒ ¬r can be written as p
        && q -> ~r, as p and q => not r, or as p & q => !r. You can also write "/" for ease of entering commands. You can
        import DIMACS.txt file.
      </p>

    </header>

    <div class="input mb-3 h-30">
      <InputDiv v-on:cnfFormula="showCnf" />
      <div class="flex pt-2">
        <PrimeButton label="Export cnf as DIMACS" class="p-button-outlined p-button-raised w-full pt-3 pb-3 md:me-1"
          @click="downloadDimacs" />
        <PrimeButton label="Import cnf from DIMACS" class="p-button-outlined p-button-raised w-full pt-3 pb-3"
          @click="triggerFileInput" />
        <input type="file" ref="fileInput" @change="handleFileUpload" accept=".txt" style="display: none;">
      </div>
      <div v-if="cnf != null">
        <h4 class="text-center mt-8">CNF formula</h4>
        <div class="flex w-full mt-2 p-2 overflow-x-auto rounded-lg border border-gray-200">
          <div class="w-full pb-2 pt-1 max-w-full overflow-x-auto">
            <p class="cnf-text whitespace-pre-line">{{ cnfTextRepresentation }}</p>
          </div>
        </div>
      </div>
    </div>

    <div>
      <ul class="flex flex-wrap items-center justify-center text-gray-900 dark:text-white space-y-2">
        <li v-for="(clause, index) in cnf" :key="index">
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
    };
  },
  methods: {
    showCnf(cnfFormula) {
      this.cnf = cnfFormula
      this.cnfTextRepresentation = convertCnfObjectToCnfString(this.cnf);
      this.dimacsString = convertObjectToDimas(this.cnf)
    },

    formatClause(clause) {
      return clause.map((term) => {
        const variable = term.isNeg ? `¬${term.variable}` : term.variable;
        return variable;
      }).join('∨');
    },
    downloadDimacs(){
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
//(¬((¬(¬D ⇒ C) ∨ (¬G ∧ B)) ⇔ ¬((¬D ⇔ ¬A) ∨ (B ⇔ G))) ⇔ ¬((¬(C ⇒ A) ⇔ (¬G ⇔ ¬E)) ⇒ ¬((¬D ⇔ G) ⇒ ¬(D ∨ ¬B)))) ⇔ ¬(¬(¬((¬G ∨ D) ∧ ¬(¬E ∧ ¬E)) ∧ ¬((D ⇔ ¬B) ∧ (¬E ⇔ E))) ∧ ¬(¬((D ⇔ ¬E) ∨ (¬G ∨ C)) ∨ (¬(C ⇒ ¬A) ∧ (¬G ⇒ ¬E))))
</script>

<style scoped>
@tailwind base;
@tailwind components;
@tailwind utilities;

.cnf-text {
  width: 600px;
}

.no-select {
  user-select: none;
}
</style>

