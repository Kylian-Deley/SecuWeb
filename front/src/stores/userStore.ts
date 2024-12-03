import { defineStore } from 'pinia';
import apiClient from '../httpRequest/apiConfig';
import type User from '@/models/User';
import eventBus from '../eventBus';
import { useAuthStore } from '@/stores/authStore'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {} as User,
    users: [] as User[],
    topUsers: [] as User[],
    filteredUsers: [] as User[],
    error: ''
  }),

  actions: {
    async fetchUserProfile(userId: any) {
      try {
        const response = await apiClient.get(`user/${userId}`);
        this.user = response.data;
        this.error = '';
      } catch (e) {
        this.error = 'Erreur : ' + e;
        eventBus.emit('show-toast', {
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue',
          life: 3000
        });
        console.error('Failed to fetch user profile:', e);
      }
    },

    async saveUserProfile(user: User) {
      try {
        await apiClient.patch(`user`, user);
        this.error = '';
        eventBus.emit('show-toast', {
          severity: 'success',
          summary: 'Modification effectuée',
          detail: 'Vos modifications ont été effectuées avec succès',
          life: 3000
        });
      } catch (e) {
        this.error = 'Erreur : ' + e;
        eventBus.emit('show-toast', {
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de la sauvegarde des données',
          life: 3000
        });
        console.error('Failed to save user profile:', e);
      }
    },

    async saveUserProfileId(userId: string, user: User) {
      try {
        await apiClient.patch(`/user/${userId}`, user);
        eventBus.emit('show-toast', {
          severity: 'success',
          summary: 'Modification effectuée',
          detail: 'Vos modifications ont été effectuées avec succès',
          life: 3000
        });
        await this.fetchUsers();
      } catch (e) {
        this.error = 'Erreur : ' + e;
        eventBus.emit('show-toast', {
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de la sauvegarde des données',
          life: 3000
        });
        console.error('Failed to save user profile:', e);
      }
    },

    async fetchUserProfilePublic(userId: any) {
      try {
        const response = await apiClient.get(`user/public/${userId}`);
        this.user = response.data;
        this.error = '';
      } catch (e) {
        this.error = 'Erreur : ' + e;
        eventBus.emit('show-toast', {
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de la récupération du menthor',
          life: 3000
        });
        console.error('Failed to fetch user profile:', e);
      }
    },

    async addNoteToUser(id:string, comment: string, value: any) {
      try {
        const response = await apiClient.post(`user/${id}/note`, { comment, value });
        this.user.comments!.push({ comment, value });
        this.error = '';
        eventBus.emit('show-toast', {
          severity: 'success',
          summary: 'Note ajouté',
          detail: 'Votre note a été ajouté avec succès',
          life: 3000
        });
        return response.data;
      } catch (e) {
        this.error = 'Erreur : ' + e;
        eventBus.emit('show-toast', {
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de la sauvegarde de votre note',
          life: 3000
        });
        console.error('Failed to add note:', e);
      }
    },

    async fetchUsers() {
      try {
        const authStore = useAuthStore()
        const response = await apiClient.get('/users');
        if (authStore.user) {
          const loggedInUserId = authStore.user._id;
          this.users = response.data.filter((user: any) => user._id !== loggedInUserId);
        } else {
          this.users = response.data;
        }
        this.filteredUsers = this.users;
        this.error = '';
      } catch (e) {
        this.error = 'Erreur : ' + e;
        eventBus.emit('show-toast', {
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de la récupération des utilisateurs',
          life: 3000
        });
        console.error('Failed to fetch users:', e);
      }
    },

    async fetchUsersAdmin() {
      try {
        const authStore = useAuthStore()
        const response = await apiClient.get('/users');
        this.users = response.data;
        this.filteredUsers = this.users;
        this.error = '';
      } catch (e) {
        this.error = 'Erreur : ' + e;
        eventBus.emit('show-toast', {
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de la récupération des utilisateurs',
          life: 3000
        });
        console.error('Failed to fetch users:', e);
      }
    },

    async fetchTopUsers() {
      try {
        const response = await apiClient.get('/top-users');
        this.topUsers = response.data;
        this.error = '';
      } catch (e) {
        this.error = 'Erreur : ' + e;
        eventBus.emit('show-toast', {
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de la récupération des meilleures utilisateurs',
          life: 3000
        });
        console.error('Failed to fetch users:', e);
      }
    },

    async fetchUsersBySpeciality(title: string) {
      try {
        const response = await apiClient.get(`/user/title/${title}`);
        this.users = response.data;
        this.filteredUsers = this.users;
        this.error = '';
      } catch (e) {
        this.error = 'Erreur : ' + e;
        eventBus.emit('show-toast', {
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de la récupération des utilisateurs par spécialité',
          life: 3000
        });
        console.error('Failed to fetch users by speciality:', e);
      }
    },

    filterUsers(searchQuery: string) {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      this.filteredUsers = this.users.filter((user: any) =>
        (user.pseudo && user.pseudo.toLowerCase().includes(lowerCaseSearchQuery)) ||
        (user.name && user.name.toLowerCase().includes(lowerCaseSearchQuery)) ||
        (user.firstname && user.firstname.toLowerCase().includes(lowerCaseSearchQuery))
      );
    },

    clearFilters() {
      this.filteredUsers = this.users;
    },

    async deleteUser(userId: string) {
      try {
        await apiClient.delete(`user/${userId}`);
        eventBus.emit('show-toast', {
          severity: 'success',
          summary: 'Utilisateur supprimé',
          detail: 'Votre utilisateur à été supprimé avc succès',
          life: 3000
        });
        await this.fetchUsers();
      } catch (e) {
        this.error = 'Erreur : ' + e;
        eventBus.emit('show-toast', {
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de la suppression de l\'utilisateur',
          life: 3000
        });
        console.error('Failed to delete user:', e);
      }
    }
  }
});
