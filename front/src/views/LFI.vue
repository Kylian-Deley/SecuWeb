<template>
  <div class="lfi-container mt-6">
    <h1>Lire un fichier</h1>
    <form @submit.prevent="fetchFileContent">
      <label for="filePath">Chemin du fichier :</label>
      <input
          type="text"
          id="filePath"
          v-model="filePath"
          placeholder="Entrez le chemin du fichier"
      />
      <button type="submit">Lire le fichier</button>
    </form>

    <div v-if="error" class="error">
      <p>Erreur : {{ error }}</p>
    </div>

    <div v-if="content" class="file-content">
      <h2>Contenu du fichier :</h2>
      <pre>{{ content }}</pre>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      filePath: "",
      content: null,
      error: null,
    };
  },
  methods: {
    async fetchFileContent() {
      try {
        this.error = null;
        this.content = null;

        const response = await axios.get(
            `http://localhost:3000/api/read-file`, // Adaptez l'URL selon votre backend
            {
              params: {
                filePath: this.filePath,
              },
            }
        );

        this.content = response.data.content;
      } catch (err) {
        this.error =
            err.response && err.response.data
                ? err.response.data.msg
                : err.message;
      }
    },
  },
};
</script>

<style>
.lfi-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.error {
  color: red;
}

.file-content {
  margin-top: 20px;
  background-color: #f4f4f4;
  padding: 10px;
  border: 1px solid #ddd;
}
</style>
