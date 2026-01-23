import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primevue/themes'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'

import App from './App.vue'
import router from './router'

// 블랙/화이트 모던 테마 프리셋 정의
const ModernPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{neutral.50}',
      100: '{neutral.100}',
      200: '{neutral.200}',
      300: '{neutral.300}',
      400: '{neutral.400}',
      500: '{neutral.500}',
      600: '{neutral.600}',
      700: '{neutral.700}',
      800: '{neutral.800}',
      900: '{neutral.900}',
      950: '{neutral.950}',
    },
  },
  components: {
    tabview: {
      tabPanel: {
        background: 'transparent',
      },
      tabList: {
        background: 'transparent',
      },
    },
  },
})

// PrimeVue 컴포넌트
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import Tree from 'primevue/tree'
import DataView from 'primevue/dataview'
import Paginator from 'primevue/paginator'
import ContextMenu from 'primevue/contextmenu'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Textarea from 'primevue/textarea'
import Menu from 'primevue/menu'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import Divider from 'primevue/divider'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

// PrimeIcons CSS
import 'primeicons/primeicons.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: ModernPreset,
    options: {
      darkModeSelector: '.dark-mode',
      cssLayer: false,
    },
  },
})
app.use(ToastService)

// 디렉티브
app.directive('tooltip', Tooltip)

// 글로벌 컴포넌트 등록
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Password', Password)
app.component('Card', Card)
app.component('Dialog', Dialog)
app.component('Toast', Toast)
app.component('Tree', Tree)
app.component('DataView', DataView)
app.component('Paginator', Paginator)
app.component('ContextMenu', ContextMenu)
app.component('Dropdown', Dropdown)
app.component('Checkbox', Checkbox)
app.component('Textarea', Textarea)
app.component('Menu', Menu)
app.component('Splitter', Splitter)
app.component('SplitterPanel', SplitterPanel)
app.component('Divider', Divider)
app.component('IconField', IconField)
app.component('InputIcon', InputIcon)

app.mount('#app')
