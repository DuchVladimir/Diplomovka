<template>
  <div class="bg-gray-50 min-w-screen min-h-screen flex justify-center items-center">
    <div class="max-w-xs relative space-y-3">
      <label for="search" class="text-gray-900">
        Type the name of a command
      </label>
      <input type="text" v-model="msg" placeholder="Type here..." ref="myInput" @keydown.down="handleArrowDown($event)"
        @keydown.up="handleArrowUp($event)" @keydown.tab.prevent="handleTab" @keydown.enter.prevent="selectCountry"
        class="p-3 mb-0.5 w-full border border-gray-300 rounded">
      <ul v-if="searchCommand.length"
        class="w-full rounded bg-white border border-gray-300 px-4 py-2 space-y-1 absolute z-10">
        <li v-for="(country, index) in searchCommand" :key="country.name" @click="selectCountry(country.name)"
          :class="{ 'cursor-pointer hover:bg-gray-100 p-1': true, 'bg-gray-100': selectedIndex === index }" tabindex="0">
          <div class="inline-block p-0.5 mr-1 border border-gray-200 bg-white rounded">
            {{ country.value }}</div> {{ country.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  setup() {
    let countries = [
      { "name": "/neg", "value": "¬" },
      { "name": "/and", "value": "∧" },
      { "name": "/or", "value": "∨" },
      { "name": "/implication", "value": "⇒" },
      { "name": "/biconditional", "value": "⇔" },
      { "name": "/true", "value": "⊤" },
      { "name": "/false", "value": "⊥" },
      { "name": "/top", "value": "⊤" },
      { "name": "/bot", "value": "⊥" },
      { "name": "/land", "value": "∧" },
      { "name": "/lor", "value": "∨" },
      { "name": "/rightarrow", "value": "⇒" },
      { "name": "/leftrightarrow", "value": "⇔" }

    ]
    let msg = ref("")
    let myInput = ref(null);

    const searchCommand = computed(() => {
      let command = getSubstringAfterLastSlash(msg);
      if (command === "") {
        return []
      }

      let matches = 0

      return countries.filter(country => {
        if (country.name.toLowerCase().includes(command.toLowerCase())) {
          matches++
          return country
        }
      })
    });

    const selectCountry = (country) => {
      applyCommand(country);
    }

    let selectedCountry = ref("")

    return {
      countries,
      msg,
      searchCommand,
      selectCountry,
      selectedCountry
    }

    function applyCommand(command) {
      countries.forEach(element => {
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
  data() {
    return {
      selectedIndex: -1,
    };
  },
  methods: {
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
    selectCountry() {
      try {
        if (this.selectedIndex !== -1) {
          this.selectCountry(this.searchCommand[this.selectedIndex].name);
          this.selectedIndex = 0;
        }
      } catch (error) { }
    },
  },
}
</script>
<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>