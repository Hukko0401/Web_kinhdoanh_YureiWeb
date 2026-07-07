import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { supabase } from '../../supabase.client'
import { AuthService } from '../../services/auth.service'
import { Header } from '../../components/header/header'

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [Header],
  templateUrl: './auth-callback.html',
  styleUrl: './auth-callback.scss'
})
export class AuthCallback implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  async ngOnInit() {
    const start = Date.now()
    while (Date.now() - start < 5000) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) break
      await new Promise(r => setTimeout(r, 300))
    }

    try {
      await this.auth.ensureUserProfileAfterOAuth()
    } catch (e) {
      console.error('Lỗi tạo profile sau OAuth:', e)
    } finally {
      this.router.navigate(['/'])
    }
  }
}