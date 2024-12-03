import { defineStore } from 'pinia';
import apiClient from '../httpRequest/apiConfig';
import type User from '@/models/User';
import eventBus from '../eventBus';


const USER_KEY = 'auth_user';
const TOKEN_KEY = 'auth_token';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem(USER_KEY)) || null,
    token: localStorage.getItem(TOKEN_KEY) || null,
    error: null,
  }),
  actions: {
    async login(user: User) {
      try {
        const response = await apiClient.post('/login', user);
        this.user = response.data.user;
        this.token = response.data.user.token;
        this.error = null;
        localStorage.setItem(USER_KEY, JSON.stringify(this.user));
        localStorage.setItem(TOKEN_KEY, this.token);
        eventBus.emit('show-toast', {
          severity: 'success',
          summary: 'Connecté',
          detail: 'Vous avez bien été connecté',
          life: 3000
        });
      } catch (e: any) {
        console.log(e)
        this.error = e.response.data.msg;
      }
    },

    async register(newUser: User) {
      try {
        const response = await apiClient.post('/register', newUser);
        this.user = response.data.user;
        this.error = null;
        eventBus.emit('show-toast', {
          severity: 'success',
          summary: 'Enregistré',
          detail: 'Vous avez bien crée votre compte',
          life: 3000
        });
      } catch (e) {
        this.error = 'Registration failed';
        eventBus.emit('show-toast', {
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de l\'ajout d\'un user',
          life: 3000
        });
        console.error('Failed to register:', e);
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      eventBus.emit('show-toast', {
        severity: 'success',
        summary: 'Déconnecté',
        detail: 'Vous avez bien été déconnecté',
        life: 3000
      });
    },
  },
  getters: {
    isAdmin: (store) => store.user && store.user.role === 'ROLE_ADMIN',
  },
});
