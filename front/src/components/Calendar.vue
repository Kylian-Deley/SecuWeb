<template>
  <div>
    <Card style="margin-bottom: 10px;">
      <template #title>
        <span class="mr-3">Légende des événements</span>
        <i
          @click="displayLegende = !displayLegende" 
          :class="displayLegende ? 'pi pi-minus' : 'pi pi-plus'"
        />
      </template>
      <template #content v-if="displayLegende">
        <div v-for="(event, index) in legendItems" :key="index" class="legend-item">
          <Badge :style="{ backgroundColor: event.color }" class="mr-2"></Badge>
          <span class="legend-text">{{ event.name }}</span>
        </div>
      </template>
    </Card>
    <FullCalendar ref="calendar" :options="calendarOptions" class="calendar-container" />
    <Dialog v-model:visible="display" style="max-width: 500px;">
      <template #header>
        <div class="event-header">
          <!-- <span v-if="isMyAsking">Ma demande de session à
            <router-link :to="{ name: 'profil', params: { id: selectedEvent.extendedProps.mentor._id }}">
              {{ selectedEvent.extendedProps.mentor.pseudo }}
            </router-link>
          </span>
          <span class="event-header" v-else>Demande de session de
            <router-link :to="{ name: 'profil', params: { id: selectedEvent.extendedProps.user._id }}">
              {{ selectedEvent.extendedProps.user.pseudo }}
            </router-link>
          </span> -->
          <span v-if="isMyAsking">
            Ma demande de session à&nbsp;
            <a :href="`/profil/${selectedEvent.extendedProps.mentor._id}`" target="_blank">
              <b>{{ selectedEvent.extendedProps.mentor.pseudo }}</b>
            </a>
          </span>
          <span class="event-header" v-else>
            Demande de session de&nbsp;
            <a :href="`/profil/${selectedEvent.extendedProps.user._id}`" target="_blank">
              <b>{{ selectedEvent.extendedProps.user.pseudo }}</b>
            </a>
          </span>
          <Chip v-if="selectedEvent.extendedProps.state === null" class="ml-2 mr-5 pending" icon="pi pi-clock" label="En attente" />
          <Chip v-if="selectedEvent.extendedProps.state" class="ml-2 mr-5 accepted" icon="pi pi-check" label="Accepter" />
          <Chip v-if="selectedEvent.extendedProps.state === false" class="ml-2 mr-5 refused" icon="pi pi-times" label="Refusé" />
        </div>
      </template>
      <span class="title">
        {{ selectedEvent.extendedProps.title }}
        <Chip class="ml-2 mr-5 event-time" icon="pi pi-calendar" :label="eventTimeLabel" />
      </span>
      <div class="description" v-html="selectedEvent.extendedProps.description"></div>
      <!-- <p class="description">
        {{ selectedEvent.extendedProps.description }}
      </p> -->
      <br>
      <template #footer>
        <router-link :to="{name: 'video-conference', params: {id: selectedEvent.id}}">
        <Button
          v-if="selectedEvent.extendedProps.state" 
          label="Acceder a la session"
          icon="pi pi-video"
        />
        </router-link>
        <Button 
          v-if="!isMyAsking && selectedEvent.extendedProps.state === null"
          label="Accepter"
          icon="pi pi-check"
          class="p-button-success"
          @click="acceptAsking"
        />
        <Button 
          v-if="!isMyAsking && selectedEvent.extendedProps.state === null"
          label="Refused"
          icon="pi pi-times"
          class="p-button-danger"
          @click="refuseAsking"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import frLocale from '@fullcalendar/core/locales/fr'
import { onMounted, ref, nextTick, computed } from 'vue'
import Asking from '../models/Asking'
import { useAskingStore } from '../stores/askingStore'
import { useAuthStore } from '../stores/authStore'
import Dialog from 'primevue/dialog';
import Chip from 'primevue/chip';
import Button from 'primevue/button'
import Panel from 'primevue/panel';
import Card from 'primevue/card';
import Badge from 'primevue/badge'

const askingStore = useAskingStore()
const authStore = useAuthStore()
const calendar = ref<any>(null);
const events = ref([])
const display = ref(false)
const selectedEvent = ref<any>(null)
const displayLegende = ref(false)
const legendItems = ref([
  { name: 'Mes demandes validées', color: 'blue' },
  { name: 'Les demandes me concernant', color: 'green' },
  { name: 'Mes demandes en attente', color: 'gold' },
  { name: 'Les demandes à traiter', color: 'orange' },
  { name: 'Demandes rejetées', color: 'red' }
])

const isMyAsking = computed(() => {
  return authStore.user._id === selectedEvent.value.extendedProps.user._id
})

const eventTimeLabel = computed(() =>{
  const start = new Date(selectedEvent.value.extendedProps.start);
  const end = new Date(selectedEvent.value.extendedProps.end);
  return `${start.toLocaleDateString()} ${start.getHours().toString()}h-${end.getHours().toString()}h`;
})

const handleEventClick = (info: any) => {
  selectedEvent.value = info.event
  display.value = true
};

const calendarOptions = ref({
  plugins: [ dayGridPlugin, interactionPlugin ],
  initialView: 'dayGridMonth',
  locale: frLocale,
  events: [],
  eventClick: handleEventClick,
})


const transformToEvent = (session: any) => {
  return {
    id:session.id,
    title: session.title,
    start: session.start_date,
    end: session.end_date,
    backgroundColor: null,
    extendedProps: {
      title: session.title,
      description: session.description,
      mentor: session.mentor,
      state: session.state,
      user: session.user,
      start: session.start_date,
      end: session.end_date,
    }
  };
}

onMounted(async () => {
  nextTick(() => {
    if (calendar.value) {
      calendar.value.getApi().updateSize();
    }
  });

  await askingStore.askingByUserId(authStore.user._id)
  await askingStore.askingByMentorId(authStore.user._id)

  if(askingStore.userAsking){
    askingStore.userAsking.forEach(el => {
      const event = transformToEvent(el)
      event.backgroundColor = "blue"
      if(el.state === null)event.backgroundColor = "gold"
      if(el.state === false)event.backgroundColor = "red"
      calendarOptions.value.events.push(event)
    })
  }
  
  if(askingStore.mentorAsking){
    askingStore.mentorAsking.forEach(el => {
      const event = transformToEvent(el)
      event.backgroundColor = "green"
      if(el.state === null)event.backgroundColor = "orange"
      if(el.state === false)event.backgroundColor = "red"
      calendarOptions.value.events.push(event)
    })
  }
});

const refuseAsking = () => {
  askingStore.acceptAsking(selectedEvent.value.id, false)
  selectedEvent.value.setProp('backgroundColor', 'red')
  calendarOptions.value.events.find(el => el.id === selectedEvent.value.id).extendedProps.state = false
  display.value = false
}

const acceptAsking = () => {
  askingStore.acceptAsking(selectedEvent.value.id, true)
  const currentEvent = calendarOptions.value.events.find(el => el.id === selectedEvent.value.id)
  if(isMyAsking.value){
    currentEvent.backgroundColor = "blue"
  }else{
    currentEvent.backgroundColor = "green"
  }
  currentEvent.extendedProps.state = true
  display.value = false
}

</script>

<style scoped>
.event-header {
  display: flex;
  align-items: center;
}


:deep(.p-dialog .p-dialog-content) {
  padding: 0 1.5rem 0 1.5rem !important;
}

.accepted{
  background-color: #4caf50; 
  color: white;   
}
.pending{
  background-color: #ffb854; 
  color: white;   
}

.refused {
  background-color: #cd5858;
  color: white;
}

.title {
  font-weight: bold;
  font-size: 1.5rem;
}

.description {
  font-size: 1rem;
  margin-top: 0.5rem;
}


.legend-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
}
div.p-card-content{
  padding: 0 !important;
}
</style>
