import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar-old',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true
})
export class NavbarComponent implements OnInit {
  isSidebarOpen: boolean = false;
  isLogoutPopupOpen: boolean = false;


  navigationItems = [
    {
      label: 'Teams',
      route: '/dashboard',
      icon: 'people-outline',
      color: 'text-blue-600'
    },
    {
      label: 'Matches',
      route: '/matches',
      icon: 'trophy-outline',
      color: 'text-red-600'
    },
    {
      label: 'Select Draw Players',
      route: '/select-draw-players',
      icon: 'person-add-outline',
      color: 'text-green-600'
    },
    {
      label: 'Voting',
      route: '/voting',
      icon: 'checkmark-circle-outline',
      color: 'text-indigo-600'
    },
    {
      label: 'Lucky Draws',
      route: '/lucky-draw-listing',
      icon: 'gift-outline',
      color: 'text-yellow-600'
    },
    {
      label: 'Config',
      route: '/config',
      icon: 'settings-outline',
      color: 'text-gray-600'
    },
    {
      label: 'Customer Votes',
      route: '/customer-votes',
      icon: 'thumbs-up-outline',
      color: 'text-pink-600'
    },
    {
      label: 'Player Votes',
      route: '/player-votes',
      icon: 'bar-chart-outline',
      color: 'text-blue-700'
    }
  ];



  constructor(private router: Router) { }

  ngOnInit() { }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  logout() {
    // this.authService.logout();
    this.router.navigate(['/login']);
    this.isLogoutPopupOpen = false;
  }

  // Close sidebar when clicking on navigation item (for mobile)
  onNavigate() {
    if (window.innerWidth < 768) {
      this.closeSidebar();
    }
  }
}