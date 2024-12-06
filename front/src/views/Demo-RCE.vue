<template>
  <div class="rce-demo mt-6">
    <h1>Démo RCE</h1>
    <input v-model="command" placeholder="Entrez une commande shell" />
    <button @click="executeCommand">Exécuter la commande</button>
    <div v-if="result" class="result">
      <h3>Résultat :</h3>
      <pre>{{ result }}</pre>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      command: '', // Commande saisie par l'utilisateur
      result: null, // Résultat de la commande
    };
  },
  methods: {
    async executeCommand() {
      try {
        const response = await axios.post('http://localhost:3000/api/execute-command', {
          commandKey: this.command,
        });
        this.result = response.data.result || response.data.error;
      } catch (error) {
        console.error('Erreur lors de l’exécution de la commande :', error);
        this.result = 'Erreur lors de l’exécution de la commande.';
      }
    },
  },
};
</script>

<style scoped>
.rce-demo {
  padding: 20px;
}
.result pre {
  background: #f4f4f4;
  padding: 10px;
  border-radius: 5px;
}
</style>
