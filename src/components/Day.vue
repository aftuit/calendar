<script setup>
import { computed, ref } from "vue";
import { priorities } from "@/constants";
import { useEventsStore } from "@/stores/events";

const emits = defineEmits(["select-event"]);

const props = defineProps({
  day: {
    type: Object,
    required: true,
  },
  events: {
    type: Array,
    default: [],
  },
});

const eventsStore = useEventsStore();

const isDragging = ref(false);
const modal = ref(false);

const data = computed(() => {
  if (props.events.length > 3 && !modal.value) {
    return props.events.sort(compareTimes).filter((_, index) => index < 3);
  }
  return props.events.sort(compareTimes);
});

const overLength = computed(() => props.events.length > 3);

function priorityColor(val) {
  for (const priority of priorities) {
    if (val === priority.id) {
      return priority.color;
    }
  }
}

function compareTimes(a, b) {
  const timeA = a.time.split(":").map(Number);
  const timeB = b.time.split(":").map(Number);
  if (timeA[0] !== timeB[0]) {
    return timeA[0] - timeB[0];
  } else {
    return timeA[1] - timeB[1];
  }
}

function handleDragStart(evt, item) {
  evt.dataTransfer.dropEffect = "move";
  evt.dataTransfer.effectAllowed = "move";
  evt.dataTransfer.setData("itemId", item.id);
}
function handleDrop(event, date) {
  if (date) {
    const id = event.dataTransfer.getData("itemId");
    eventsStore.dragEditEvent(Number(id), date);
    isDragging.value = false;
  }
}
</script>

<template>
  <li
    class="calendar-day"
    :class="{ active: day.active, dragging: isDragging && day.number, prev: !day.number }"
    @drop="handleDrop($event, day.full_date)"
    @dragover.prevent.stop="isDragging = true"
    @dragleave.prevent.stop="isDragging = false"
    @dragenter.prevent.stop>
    {{ day.number }}
    <div class="events-container" v-if="day.number">
      <div
        class="event"
        v-for="event in data.filter((_, index) => index < 3)"
        :key="event.id"
        draggable="true"
        @click.prevent.stop="emits('select-event', event)"
        @dragstart="handleDragStart($event, event)">
        <span class="line-clamp w-max-120">{{ event.title }}</span>
        <div class="priority" :style="{ backgroundColor: priorityColor(event.priority) }"></div>
      </div>
      <p class="show-more" v-if="overLength" @click="modal = true">show more...</p>
    </div>
  </li>

  <Transition name="fade">
    <div class="modal-content" v-if="modal">
      <div class="modal-container">
        <span class="close-btn" @click="modal = false">&times;</span>
        <h3 class="modal-title">Eventlar ro'yhati</h3>
        <div class="events-container scroll" v-if="day.number">
          <div
            class="event"
            v-for="event in data"
            :key="event.id"
            @click.prevent.stop="emits('select-event', event)">
            <div class="content">
              <span class="line-clamp w-max-250" style="max-width: 250px">{{ event.title }}</span>
              <span> | Vaqti: {{ event.time }}</span>
            </div>
            <div class="priority" :style="{ backgroundColor: priorityColor(event.priority) }"></div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
.events-container {
  margin-top: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calendar-day {
  border: 2px solid transparent;
  color: #525659;
  border-radius: 4px;
  border: 1px solid rgb(229, 229, 229);
  font-size: 16px;
  font-weight: 600;
  padding: 12px;
  height: 150px;
}

.calendar-day.prev {
  border: none;
}

.content {
  display: flex;
  gap: 5px;
}

.w-max-120 {
  max-width: 120px;
}
.w-max-250 {
  max-width: 250px;
}

.calendar-day.active {
  background: rgb(247, 231, 231);
}
.calendar-day.dragging {
  background: rgb(231, 255, 194);
  border-color: rgb(160, 251, 160);
}
.event {
  padding: 4px 8px;
  display: flex;
  justify-content: space-between;
  gap: 5px;
  align-items: center;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  border: 1px solid transparent;
}
.event:hover {
  border-color: lightgray;
}

.priority {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.show-more {
  font-weight: 300;
  margin: 0;
  text-align: center;
  color: rgb(4, 62, 120);
  font-size: 12px;
}
.show-more:hover {
  text-decoration: underline;
  cursor: pointer;
}
</style>
