import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router'
import App from "@/views/App.vue";
import RoutePath from "@shared/types/route.enum";

const routes: RouteRecordRaw[] = [
  {
    name: 'app',
    path: RoutePath.APP,
    component: App
  },
  {
    name: 'admin',
    path: RoutePath.ADMIN,
    component: () => import('../views/Admin.vue'),
  },
  {
    path: '/**',
    redirect: RoutePath.APP,
  },
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: routes
})

export default router
