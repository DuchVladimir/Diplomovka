<template>
  <div class="about">
    <InputDiv/>
  </div>
</template>


<script>
/*
    <input v-model="message" placeholder="edit me">
    <p>Message is: {{ message }}</p>
    <Button class="p-button-text" @click="display=true"> Click me! </Button>
    <Button label="Click me!" class="p-button-raised p-button-warning" @click="display=true" />
    
*******
        <Dialog v-model:visible="display">
    <template #header>
		<h3>Header</h3>
	</template>

	Content

	<template #footer>
		<Button label="No" icon="pi pi-times" class="p-button-text"/>
        <Button label="Yes" icon="pi pi-check " autofocus />
	</template>
</Dialog>
*/
import InputDiv from "../components/InputDiv.vue";

export default {
  components: {
    InputDiv
},
	data() {
		return {
			display: false,
      message: ""
		}
	}
}
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
