import type {ThemeDefinition} from "vuetify";

const colors = {
  primary: '#3F51B5',
  'primary-soft': '#f9f9ff',
  secondary: '#f97316',
  accent: '#5d78ff',
  error: '#C13434',
  danger: '#C13434',
  info: '#5578eb',
  success: '#0abb87',
  warning: '#ffb822',
  disabled: '#bdbdbc',
  white: '#ffffff',
  rose: '#3F51B5',
  anais: '#239FA0',
  grey: '#c0c0c0',
}

const theme: ThemeDefinition = {
  dark: false,
  colors: {
    ...colors,
    any: colors.primary,
  }
}

export default theme
