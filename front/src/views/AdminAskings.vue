<template>
  <div class="admin-container" style="margin-top: 3rem;">
    <h2 style="margin-bottom: 2rem;">Gestion des demandes</h2>

    <div class="asking-table">
      <div class="asking-table-header">
        <div class="asking-table-row">
          <div class="asking-table-cell title-cell">Titre</div>
          <div class="asking-table-cell description-cell">Description</div>
          <div class="asking-table-cell state-cell">État</div>
          <div class="asking-table-cell actions-cell">Actions</div>
        </div>
      </div>
      <div class="asking-table-body">
        <div v-for="asking in askings" :key="asking.id" class="asking-table-row">
          <div class="asking-table-cell title-cell">{{ asking.title }}</div>
          <div class="asking-table-cell description-cell">{{ asking.description || 'Pas de description' }}</div>
          <div class="asking-table-cell state-cell">{{ transformState(asking.state) }}</div>
          <div class="asking-table-cell actions-cell">
            <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-primary" @click="editAsking(asking)" />
            <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" @click="confirmDeleteAsking(asking)" />
          </div>
        </div>
      </div>
    </div>

    <Dialog style="width: 50%;" header="Modifier la demande" v-model:visible="isEditAskingDialogVisible" modal>
      <AskingForm :asking="selectedAsking" @save="updateAsking" @close="isEditAskingDialogVisible = false" />
    </Dialog>

    <Dialog header="Confirmation de suppression" v-model:visible="isConfirmDialogVisible" modal>
      <p>Êtes-vous sûr de vouloir supprimer cette demande ?</p>
      <div class="confirmation-buttons">
        <Button label="Oui" class="p-button-danger" @click="deleteAsking(confirmedAskingId)" />
        <Button label="Non" class="p-button-secondary" @click="isConfirmDialogVisible = false" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAskingStore } from '@/stores/askingStore';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import AskingForm from '@/components/AskingForm.vue';

const askingStore = useAskingStore();
const askings = ref([{}]);
const isEditAskingDialogVisible = ref(false);
const isConfirmDialogVisible = ref(false);
const selectedAsking = ref({});
const confirmedAskingId = ref('');

const fetchAskings = async () => {
  await askingStore.fetchAsking();
  askings.value = askingStore.askings;
}

const editAsking = (asking: any) => {
  selectedAsking.value = asking;
  isEditAskingDialogVisible.value = true;
}

const updateAsking = async (asking: any) => {
  await askingStore.editAsking(asking.asking_id, asking);
  isEditAskingDialogVisible.value = false;
  await fetchAskings();
}

const confirmDeleteAsking = (asking: any) => {
  confirmedAskingId.value = asking;
  isConfirmDialogVisible.value = true;
}

const deleteAsking = async (asking: any) => {
  await askingStore.deleteAsking(asking.id);
  isConfirmDialogVisible.value = false;
  await fetchAskings();
}

const transformState = (state: boolean | null) => {
  if (state === true) return 'Accepter';
  if (state === false) return 'Refuser';
  return 'En attente';
}

onMounted(() => {
  fetchAskings();
});
</script>

<style scoped>
.admin-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.asking-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.asking-table-header {
  background-color: #f4f4f9;
}

.asking-table-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.asking-table-cell {
  padding: 10px;
  text-align: left;
  flex: 1;
}

.title-cell {
  flex: 2;
}

.description-cell {
  flex: 3;
}

.state-cell {
  flex: 1;
}

.actions-cell {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.asking-table-row:nth-child(even) {
  background-color: #f9f9f9;
}

.asking-table-row:hover {
  background-color: #e9e9e9;
}

.p-button-text {
  padding: 0;
}

.confirmation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
</style>
