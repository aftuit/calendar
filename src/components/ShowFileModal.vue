<script setup>
const emits = defineEmits(["close"]);
const props = defineProps({
  file: { type: Object, required: true },
  type: { type: String, required: true },
});
</script>

<template>
  <div class="modal-content">
    <div class="modal-container">
      <span class="close-btn" @click="emits('close')">&times;</span>
      <h3 class="modal-title">Name: {{ file.name }}</h3>
      <template v-if="type == 'image'">
        <div class="display-file">
            <img :src="file.path" alt="" />
        </div>
      </template>
      <template v-else-if="type == 'pdf'">
        <iframe :src="file.path" frameBorder="0" scrolling="auto" class="display-file"></iframe>
      </template>
      <div class="display-file" v-else>
        Ko'rish imkoni yo'q!
      </div>
      <h3 class="modal-title">Type: {{ file.type }}</h3>
    </div>
  </div>
</template>

<style scoped>
.modal-title {
  font-size: 18px;
  color: rgb(126, 122, 122);
}
.display-file {
  width: 100%;
  height: 75vh;
  margin: 20px 0;
  justify-content: center;
  overflow: auto;
  display: flex;
  align-items: center;
  color: darkgray;
}
</style>
