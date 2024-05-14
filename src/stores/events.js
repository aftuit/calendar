import { ref, watch } from "vue";
import { defineStore } from "pinia";
import { data } from "@/util/data";

export const useEventsStore = defineStore("events", () => {
  const events = ref(getStorage() || data);

  const selectedEvent = ref(null);
  const isEditing = ref(false);

  watch(events, () => setStorage(), { deep: true });

  function addEvent(value) {
    events.value.push(value);
  }
  function editEvent(item, id) {
    events.value = events.value.map(e => {
      if (e.id === id) {
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          time: item.time,
          date: item.date,
          priority: item.priority,
          file: item.file,
        };
      } else return e;
    });
  }
  function deleteEvent(id) {
    events.value = events.value.filter(event => event.id !== id);
  }
  function dragEditEvent(id, date) {
    events.value = events.value.map(e => {
      if (e.id == id) {
        return { ...e, date };
      } else return e;
    });
  }

  function setStorage() {
    return window.localStorage.setItem("events", JSON.stringify(events.value));
  }
  function getStorage() {
    return JSON.parse(window.localStorage.getItem("events"));
  }
  return { events, isEditing, selectedEvent, dragEditEvent, addEvent, editEvent, deleteEvent };
});
