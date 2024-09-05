import { Routes } from '@angular/router';
import RoutePath from "@shared/types/route.enum";
import {AdminComponent} from "../components/admin/admin.component";
import {AppComponent} from "../components/app/app.component";

export const routes: Routes = [
  { path: RoutePath.APP, component: AppComponent },
  { path: RoutePath.ADMIN, component: AdminComponent },
  { path: '**', redirectTo: RoutePath.APP, pathMatch: 'full' },
];
