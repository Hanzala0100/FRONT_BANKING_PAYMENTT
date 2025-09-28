


import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { AuthGuardService } from './guards/authGuardService';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    // { path: 'dashboard', component: DashboardComponent,canActivate: [AuthGuardService] },
    { path: '**', redirectTo: '/login' }
];