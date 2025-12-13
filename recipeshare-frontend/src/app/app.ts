import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './services/auth.service';


@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule
  ],
})
export class AppComponent {}

