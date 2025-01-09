import {createVuetify} from 'vuetify'
import theme from './theme'
import * as components from "vuetify/components";
import * as labComponents from "vuetify/labs/components";
import * as directives from "vuetify/directives";

export default createVuetify({
  components: {
    ...components,
    ...labComponents,
  },
  directives: directives,
  theme: {
    defaultTheme: 'myTheme',
    themes: {
      myTheme: theme,
    },
  },
  icons: {
    defaultSet: 'mdi',
  }
})
