import type { Component } from 'vue'

export type HeaderMenuItem = {
  label: string
  icon: string
  command?: () => void
  url?: string
}

export type Toast = {
  id: number
  type: 'success' | 'info' | 'warning' | 'error'
  message?: string
  timeout?: number
  component?: Component
}
