<script setup>
import { ref, computed, onMounted } from "vue";
import Day from "./Day.vue";
import EventModal from "./EventModal.vue";
import { weekArray, monthArray } from "@/constants";
import { useEventsStore } from "@/stores/events";

const eventStore = useEventsStore();

const current = new Date();
const todaysDate = current.getDate();
const currentMonth = current.getMonth();

// Years
const currentYear = new Date().getFullYear();
const startYear = currentYear - 60;
const endYear = currentYear + 60;

const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth());

const daysOfCurrentMonth = ref([]);
const showModal = ref(false);

function startEditEvent(event) {
  eventStore.selectedEvent = event;
  eventStore.isEditing = true;
  showModal.value = true;
}

function openModal() {
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
  eventStore.selectedEvent = null;
  eventStore.isEditing = false;
}

const optionYears = computed(() => {
  let years = [];
  for (let i = startYear; i <= endYear; i++) {
    years.push(i);
  }
  return years;
});

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay() - 1;
}

function getTotalDaysInAMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function formatFullDate(year, month, day) {
  month += 1;
  month = month < 10 ? "0" + month : month;
  day = day < 10 ? "0" + day : day;
  return `${year}-${month}-${day}`;
}

function generateCalendarDays(currentDate) {
  const newDate = new Date(currentDate);
  const year = newDate.getFullYear();
  const month = newDate.getMonth();
  const totalDaysInMonth = getTotalDaysInAMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  daysOfCurrentMonth.value = [];

  let firstDay = 1;
  while (firstDay <= firstDayOfWeek) {
    daysOfCurrentMonth.value.push({ number: "" });
    firstDay++;
  }
  let day = 1;
  while (day <= totalDaysInMonth) {
    if (todaysDate === day && currentMonth === month && currentYear === year) {
      daysOfCurrentMonth.value.push({ number: day, active: true, full_date: formatFullDate(selectedYear.value, selectedMonth.value, day) });
    } else daysOfCurrentMonth.value.push({ number: day, full_date: formatFullDate(selectedYear.value, selectedMonth.value, day) });
    day++;
  }

  selectedMonth.value = month;
  selectedYear.value = year;
}

function getMonthData() {
  let newDate = new Date(selectedYear.value, selectedMonth.value, 1);
  generateCalendarDays(newDate);
}

function getYearData() {
  let newDate = new Date(selectedYear.value, selectedMonth.value, 1);
  generateCalendarDays(newDate);
}

function getEvents(day) {
  const data = eventStore.events.filter(event => {
    const eventDay = new Date(event.date).getDate();
    const eventMonth = new Date(event.date).getMonth();
    const eventYear = new Date(event.date).getFullYear();
    return day === eventDay && selectedMonth.value === eventMonth && selectedYear.value === eventYear;
  });
  return data;
}

onMounted(() => {
  const currentDate = new Date();
  generateCalendarDays(currentDate);
});
</script>

<template>
  <div class="calendar-container">
    <div class="head-container">
      <div class="calendar-month-arrow-container">
        <div class="calendar-month-year-container">
          <select class="calendar-years" v-model="selectedYear" @change="getYearData">
            <option v-for="year in optionYears" :value="year" :key="year" :selected="year === selectedYear">{{ year }}</option>
          </select>
          <select class="calendar-months" v-model="selectedMonth" @change="getMonthData">
            <option v-for="month in monthArray" :value="month.id" :key="month" :selected="selectedMonth === month.id">
              {{ month.name }}
            </option>
          </select>
          <button class="add-event-btn" @click="openModal">+</button>
        </div>
      </div>
      <ul class="calendar-week">
        <li v-for="week in weekArray" :key="week" class="calendar-week-day">{{ week }}</li>
      </ul>
    </div>

    <!-- calendar-days -->
    <ul class="calendar-days">
      <template v-for="day in daysOfCurrentMonth" :key="day.number">
        <Day :day="day" :events="getEvents(day.number)" @select-event="startEditEvent" />
      </template>
    </ul>
  </div>
  <Transition name="fade">
    <EventModal v-if="showModal" @close="closeModal" />
  </Transition>
</template>

<style>
.calendar-container {
  height: 90vh;
  width: 90vw;
  border-radius: 10px;
  box-shadow: 0px 0px 20px rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.head-container {
  height: 10vh;
}

.calendar-week {
  display: flex;
  list-style: none;
  align-items: center;
  justify-content: space-between;
  padding-inline-start: 0px;
}

.calendar-week-day {
  width: 100%;
  text-align: center;
  color: #525659;
  border: 1px solid rgb(218, 218, 218);
  padding: 20px 0;
  font-weight: 600;
}

.calendar-days {
  height: 70vh;
  padding: 0;
  width: 100%;
  list-style: none;
  display: grid;
  gap: 3px;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
}
.calendar-month-arrow-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.calendar-month-year-container {
  color: #525659;
  cursor: pointer;
  display: flex;
  justify-content: end;
  width: 100%;
}

.calendar-months,
.calendar-years {
  border-radius: 10px;
  border: none;
  cursor: pointer;
  outline: none;
  color: #525659;
  font-size: 15px;
  border: 1px solid lightgray;
  width: 100px;
  padding: 4px 10px;
  margin: 0 5px;
}

.add-event-btn {
  border: 1px solid lightgray;
  background: green;
  color: white;
  border-radius: 4px;
  padding: 0 15px;
  cursor: pointer;
  font-size: 22px;
}
.add-event-btn:hover {
  background: rgb(3, 147, 3);
}

</style>
