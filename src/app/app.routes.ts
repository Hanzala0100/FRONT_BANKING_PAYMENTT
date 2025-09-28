


import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';


import { AuthGuardService } from './guards/authGuardService';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    // { path: 'dashboard', component: DashboardComponent,canActivate: [AuthGuardService] },
    { path: '**', redirectTo: '/login' }
];