


import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LogsComponent } from './components/logs/logs.component';
import { AuthGuardService } from './guards/authGuardService';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'logs', component: LogsComponent, canActivate: [AuthGuardService] },
    { path: '**', redirectTo: '/login' }
];