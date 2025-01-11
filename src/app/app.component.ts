import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'front-alertas-medicas';
  isLoggedIn = false;

  constructor(private readonly msalService: MsalService) { }

  ngOnInit(): void {
    const account = this.msalService.instance.getActiveAccount();
    this.isLoggedIn = !!account;
  }

  login() {
    this.msalService.loginPopup().subscribe({
      next: (result) => {
        console.log('Login success:', result);
        this.isLoggedIn = true;
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoggedIn = false;
      },
    });
  }

  logout() {
    this.msalService.logoutPopup().subscribe({
      next: () => {
        console.log('Logout success');
        this.isLoggedIn = false;
      },
      error: (error) => {
        console.error('Logout error:', error);
      },
    });
  }
}