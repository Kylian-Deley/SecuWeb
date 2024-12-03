<template>
  <div class="profile-container">
    <div class="profile-header">
      <img :src="userStore.user.img_url" alt="Avatar" class="avatar">
      <h1 class="title">Profil Utilisateur</h1>
      <div v-if="user_id && authStore.user">
        <RouterLink :to="{ name: 'newAsking', params: { mentor_id: user_id } }" class="create-request-button">
          Créer une demande avec ce spécialiste
        </RouterLink>
      </div>
    </div>
    <div class="p-grid">
      <div class="p-col-12">
        <Panel header="Informations Personnelles" class="info-card">
          <div class="p-grid personal-info">
            <div class="p-col-12 p-md-6 p-field">
              <i class="pi pi-user icon"></i>
              <span class="info-label">Nom :</span>
              <span class="info-value">{{ userStore.user.name }}</span>
            </div>
            <div class="p-col-12 p-md-6 p-field">
              <i class="pi pi-user icon"></i>
              <span class="info-label">Prénom :</span>
              <span class="info-value">{{ userStore.user.firstname }}</span>
            </div>
            <div class="p-col-12 p-md-6 p-field">
              <i class="pi pi-envelope icon"></i>
              <span class="info-label">Email :</span>
              <span class="info-value">{{ userStore.user.mail }}</span>
            </div>
            <div class="p-col-12 p-md-6 p-field">
              <i class="pi pi-tag icon"></i>
              <span class="info-label">Pseudo :</span>
              <span class="info-value">{{ userStore.user.pseudo }}</span>
            </div>
          </div>
        </Panel>
      </div>
      <div class="p-col-12">
        <Panel header="Autres Informations" class="info-card">
          <div class="p-fluid form-grid">
            <div class="p-field">
              <label class="flex mb-1 label-style" for="specialite">Spécialités</label>
              <div class="speciality-container">
                <div v-for="specialite in userStore.user.speciality" :key="specialite._id" class="speciality-card">
                  <div class="speciality-title">{{ specialite.title }}</div>
                  <div class="speciality-level">
                    <span v-for="star in getStars(specialite.level)" :key="star" class="star">&#9733;</span>
                  </div>
                </div>
                <span v-if="!(userStore.user.speciality && userStore.user.speciality.length)">
                  Aucune spécialité
                </span>
              </div>
              <div class="legend" v-if="(userStore.user.speciality && userStore.user.speciality.length)">
                <p>★ - Débutant | ★★ - Intermédiaire | ★★★ - Expert</p>
              </div>
            </div>
            <div class="p-field comment-section">
              <label class="flex mb-1 label-style" for="notes">Commentaires</label>
              <div class="comment-container">
                <div v-for="comment in userStore.user.comments" :key="comment.comment" class="comment-card">
                  <div class="comment-text">{{ comment.comment }}</div>
                  <div class="comment-note">
                    <span v-for="star in comment.value" :key="star" class="star">&#9733;</span>
                  </div>
                </div>
                <span v-if="!(userStore.user.comments && userStore.user.comments.length)">
                  Pas de commentaire
                </span>
              </div>
              <div class="legend" v-if="(userStore.user.comments && userStore.user.comments.length)">
                <p>★ - Note</p>
              </div>
            </div>
            <div class="p-field" v-if="authStore.user">
              <h3>Ajouter une note spontanée</h3>
                <Dropdown class="mb-2" v-model="newComment.value" :options="noteOptions" optionLabel="label" optionValue="value" placeholder="Note"/>
              <InputText class="mb-2" v-model="newComment.comment" placeholder="Commentaire"/>
              <Button label="Ajouter" icon="pi pi-plus" @click="addNote"/>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Panel from 'primevue/panel'
import { useAuthStore } from '@/stores/authStore'
import router from "@/router";

const route = useRoute()
const userStore = useUserStore()
const authStore = useAuthStore()
const newComment = ref({ comment: '', value: null })

const noteOptions = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 }
]

const user_id = ref(route.params.id)

const fetchUserProfilePublic = async () => {
  try {
    await userStore.fetchUserProfilePublic(user_id.value)
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
  }
}

const addNote = async () => {
  try {
      if (typeof user_id.value === "string") {
          await userStore.addNoteToUser(user_id.value, newComment.value.comment, newComment.value.value)
      }
    newComment.value.comment = ''
    newComment.value.value = null
  } catch (error) {
    console.error('Failed to add note:', error)
  }
}

const getStars = (level: any) => {
  switch (level) {
    case 'beginner':
      return [1]
    case 'intermediate':
      return [1, 2]
    case 'expert':
      return [1, 2, 3]
    default:
      return []
  }
}

onMounted(() => {
    if (user_id.value === authStore.user._id) {
        router.push('/my-profil')
    } else {
        fetchUserProfilePublic()
    }
})
</script>

<style scoped>
.profile-container {
  margin: 6rem auto 0 auto;
  max-width: 800px;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.avatar {
  width: 75px;
  height: 75px;
  border-radius: 50%;
  margin-right: 1rem;
}

.title {
  font-size: 2rem;
  color: #34495e;
  flex-grow: 1;
}

.create-request-button {
  display: flex;
  background-color: #34495e;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  text-decoration: none;
}

.create-request-button:hover {
  background-color: #45a049;
}

.info-card {
  margin-bottom: 2rem;
}

.personal-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.personal-info .p-field {
  display: flex;
  align-items: center;
}

.icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
  color: #4CAF50;
}

.info-label {
  font-weight: bold;
  margin-right: 0.5rem;
}

.info-value {
  background-color: transparent;
  padding: 0.5rem;
  border: none;
  box-shadow: none;
  color: #333;
}

.speciality-card, .comment-card {
  padding: 1rem;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  text-align: center;
}

.speciality-card {
  background-color: #e3f2fd;
}

.comment-card {
  background-color: #fff9c4;
}

.speciality-title, .comment-text {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.speciality-level, .comment-note {
  color: #888;
}

.label-style {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
}

.star {
  color: gold;
  font-size: 1.5rem;
}

.legend {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
  text-align: center;
}

.legend p {
  margin: 0;
}

.speciality-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.comment-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.comment-section {
  margin-top: 2rem;
}
</style>
