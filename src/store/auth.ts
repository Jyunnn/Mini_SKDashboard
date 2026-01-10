import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AuthState } from '@/types/store'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref<boolean>(false)
  const user = ref<{ name: string } | null>(null)

  function login(username: string, password: string): boolean {
    if (username && password) {
      isAuthenticated.value = true
      user.value = { name: username }
      localStorage.setItem('auth_token', username)
      localStorage.setItem('auth_user', JSON.stringify({ name: username }))
      return true
    }
    return false
  }

  function logout(): void {
    isAuthenticated.value = false
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  function checkAuth(): void {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('auth_user')
    if (token && userData) {
      isAuthenticated.value = true
      user.value = JSON.parse(userData)
    } else {
      isAuthenticated.value = false
      user.value = null
    }
  }

  return {
    isAuthenticated,
    user,
    login,
    logout,
    checkAuth
  }
})
