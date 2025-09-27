import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PersistenceService {

    set(key: string, data: unknown): void {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        }
        catch (error) {
            console.log('Error saving to localStorage', error);
        }
    }

    get(key: string): unknown {
        try {
            let data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            console.log('Error getting data from localStorage', error);
            return null;
        }
    }

    delete(key: string): void {
        try {
            localStorage.removeItem(key);
        }
        catch (error) {
            console.log('Error deleting data from localStorage', error);
        }
    }
}
