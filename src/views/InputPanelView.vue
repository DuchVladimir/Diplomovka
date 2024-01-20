<template>
  <div class="about">
    <div>
      <InputDiv v-on:cnfFormula="showCnf" />
      <h2>{{ cnf }}</h2>
    </div>
    
  </div>
</template>

<script>
import InputDiv from "../components/cnf/InputDiv.vue";

export default {
  components: {
    InputDiv,
  },
  data() {
    return {
      display: false,
      cnf: "",
    };
  },
  methods: {
    showCnf(cnfFormula) {
      //console.log(cnfFormula);
      this.cnf = cnfFormula;
    }
  }
};
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
