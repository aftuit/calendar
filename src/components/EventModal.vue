<script setup>
import { computed, reactive, ref } from "vue";
import { priorities } from "@/constants";
import { useEventsStore } from "@/stores/events";
import ShowFileModal from "./ShowFileModal.vue";

const emits = defineEmits(["close"]);
const eventStore = useEventsStore();

const showFile = ref(false);
const isDragging = ref(false);

const form = reactive({
  title: eventStore.selectedEvent?.title || "",
  time: eventStore.selectedEvent?.time || "",
  date: eventStore.selectedEvent?.date || "",
  description: eventStore.selectedEvent?.description || "",
  priority: eventStore.selectedEvent?.priority || 1,
  file: eventStore.selectedEvent?.file || { path: "", name: "", type: "" },
});

const file_type = computed(() => {
  const types = ["pdf", "word", "image", "excel"];
  for (let type of types) {
    if (form.file.type?.indexOf(type) > -1) {
      return type;
    }
  }
});

function clearForm() {
  form.title = "";
  form.time = "";
  form.date = "";
  form.description = "";
  form.priority = 1;
  form.file = {
    path: "",
    name: "",
    type: "",
  };

  eventStore.selectedEvent = null;
  eventStore.isEditing = false;
}

function createEvent() {
  eventStore.addEvent({
    id: new Date().getTime(),
    title: form.title,
    time: form.time,
    date: form.date,
    description: form.description,
    priority: form.priority,
    file: form.file,
  });
  emits("close");
  clearForm();
}

function editEvent() {
  eventStore.editEvent(
    {
      id: eventStore.selectedEvent.id,
      title: form.title,
      time: form.time,
      date: form.date,
      description: form.description,
      priority: form.priority,
      file: form.file,
    },
    eventStore.selectedEvent.id
  );
  emits("close");
  clearForm();
}

function submit() {
  if (eventStore.isEditing) {
    editEvent();
  } else {
    createEvent();
  }
}

function deleteEvent() {
  if (confirm("Rostan o'chirmoqchimisiz?")) {
    eventStore.deleteEvent(eventStore.selectedEvent.id);
    emits("close");
  } else return;
}

function uploadFile(evt) {
  const files = evt.dataTransfer ? evt.dataTransfer.files : evt.target.files;
  isDragging.value = false;

  if (files && files[0]) {
    let reader = new FileReader();
    reader.onload = function (e) {
      form.file = {
        type: files[0].type,
        name: files[0].name,
        path: e.target.result,
      };
    };
    reader.readAsDataURL(files[0]);
  }
}

function closeFileModal() {
  showFile.value = false;
}

function deleteFile() {
  form.file = {
    path: "",
    name: "",
    type: "",
  };
}
</script>
<template>
  <div class="modal-content">
    <div class="modal-container">
      <span class="close-btn" @click="emits('close')">&times;</span>
      <h3 class="modal-title">
        {{ eventStore.isEditing ? "Eventni tahrirlash" : "Yangi event" }}
      </h3>
      <!-- Title and date-time -->
      <form @submit.prevent="submit">
        <div class="inputs">
          <input type="text" class="title" v-model="form.title" required placeholder="Sarlavha" />
          <div class="date-time">
            <input type="time" class="time" v-model="form.time" required placeholder="vaqt" />
            <input type="date" class="date" v-model="form.date" required placeholder="sana" />
          </div>
        </div>
        <!-- Priorities -->
        <div class="priority-content">
          <div
            @click="form.priority = priority.id"
            v-for="priority in priorities"
            :style="{ backgroundColor: priority.color }"
            :key="priority.id"
            :class="{ active: form.priority === priority.id }"
            class="priority"></div>
        </div>

        <textarea rows="10" class="description" v-model="form.description" placeholder="Izoh"></textarea>

        <!-- Upload file -->
        <div
          class="upload-file"
          :class="{ dragging: isDragging }"
          @dragstart.prevent="isDragging = true"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="uploadFile($event)">
          Drag and Drop file here or
          <label for="file" class="file-input-label">Upload file</label>
          <input id="file" type="file" class="upload-input" @change="uploadFile" />
          <div v-if="form.file.path">
            <div class="file-prev">
              <img :src="form.file?.path" alt="" v-if="file_type == 'image'" id="display_img_file" width="50" height="50" />
              <div>
                <div>{{ form.file.name }}</div>
                <div>{{ form.file.type }}</div>
              </div>
              <div class="content">
                <span @click="showFile = true">Ko'rish</span>
                <span @click="deleteFile" class="delete">O'chirish</span>
              </div>
            </div>
          </div>
        </div>

        <div class="actions">
          <button type="button" @click.prevent="emits('close')" class="close">Orqaga</button>
          <button type="button" v-if="eventStore.isEditing" class="delete" @click.prevent="deleteEvent">O'chirish</button>
          <button type="submit" v-if="eventStore.isEditing" class="save">Yangilash</button>
          <button type="submit" v-else class="save">Saqlash</button>
        </div>
      </form>
    </div>

    <Transition name="fade">
      <ShowFileModal v-if="showFile" @close="closeFileModal" :file="form.file" :type="file_type" />
    </Transition>
  </div>
</template>

<style scoped>
h3.modal-title {
  margin: 0;
  font-size: 24px;
}
.inputs {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 24px;
}
.date-time {
  width: 50%;
  display: flex;
  gap: 5px;
  margin-left: 20px;
}
input {
  width: 50%;
  border-radius: 8px;
}
.inputs input.title {
  width: 50%;
  outline: none;
  border: 1px solid #cbcbcb;
  padding: 7px 10px;
  font-size: 14px;
}
.close-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 32px;
  height: 32px;
  box-shadow: 0px 4px 24px 0px #00000040;
  border-radius: 4px;
  font-size: 20px;
  background: white;
  font-weight: 800;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.file-prev {
  display: flex;
  align-items: center;
  margin-top: 15px;
  gap: 10px;
  border-radius: 4px;
  border: 1px dashed rgb(222, 222, 222);
  padding: 10px;
  background: #00d8fe0c;
}
.file-prev span {
  color: #09879d;
  cursor: pointer;
  display: block;
  margin-left: auto;
}
.file-prev span.delete {
  color: red;
}
.file-prev span:hover {
  text-decoration: underline;
}

.file-prev .content {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.priority-content {
  margin-top: 24px;
  display: flex;
  gap: 6px;
}
.priority {
  border-radius: 50%;
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
}
.priority.active {
  border: 2px solid black;
}
.upload-file {
  margin-top: 24px;
  border: 2px dashed rgb(178, 178, 178);
  padding: 40px 24px;
  border-radius: 8px;
  text-align: center;
  color: rgb(72, 72, 72);
  background: rgba(236, 236, 236, 0.518);
}
.upload-file.dragging {
  background: white;
  border: 2px dashed black;
}
.file-input-label {
  color: rgb(6, 6, 214);
  cursor: pointer;
}
.file-input-label:hover {
  text-decoration: underline;
}
.description {
  margin-top: 24px;
  width: 100%;
  outline: none;
  border: 1px solid #cbcbcb;
  padding: 7px 10px;
  font-size: 14px;
}
.upload-input {
  display: none;
}
.actions {
  display: flex;
  justify-content: end;
  width: 100%;
  gap: 10px;
  margin-top: 24px;
}
.actions button {
  padding: 7px 10px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.actions button.close {
  background: #cbcbcb;
}
.actions button.close:hover {
  background: #a1a0a0;
}
.actions button.save {
  background: #39c54f;
}
.actions button.save:hover {
  background: #2ca43e;
}
.actions button.delete {
  background: rgb(222, 63, 63);
}
.actions button.delete:hover {
  background: rgb(177, 67, 67);
}
</style>
