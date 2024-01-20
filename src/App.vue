<script setup>
import { RouterLink, RouterView } from "vue-router";
import HelloWorld from "./components/HelloWorld.vue";

</script>

<template>
    <div class="flex flex-col items-center h-screen pt-20 mx-auto max-w-screen-lg w-full">
      <header class="mb-4 w-full h-20">
        <p for="search" class="text-gray-900 text-center">
          This tool generates a visualization of the resolution method for propositional logic formulas. You can specify the logical
          operators in several different formats. For example, the propositional formula p ∧ q ⇒ ¬r can be written as p
          && q -> ~r, as p and q => not r, or as p & q => !r. You can also write "/" for ease of entering commands.
        </p>
      </header>

      <div class="input mb-10 h-30">
        <InputDiv v-on:cnfFormula="showCnf" />
        <h2>{{ cnf }}</h2>
      </div>

      <TreeChart />

    </div>
</template>

<script>
import InputDiv from "./components/cnf/InputDiv.vue";
import TreeChart from "./components/TreeChart.vue";

export default {
  components: {
    InputDiv,
    TreeChart
  },
  data() {
    return {
      display: false,
      cnf: "",
    };
  },
  methods: {
    showCnf(cnfFormula) {
      this.cnf = cnfFormula;
    }
  }
};
</script>

<style scoped>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
