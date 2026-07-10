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
  let session = null
  while (Date.now() - start < 5000) {
    const { data } = await supabase.auth.getSession()
    session = data.session
    if (session) break
    await new Promise(r => setTimeout(r, 300))
  }

  if (!session) {
    this.router.navigate(['/login'])
    return
  }

  try {
    const exists = await this.auth.hasProfile(session.user.id)
    this.router.navigate([exists ? '/' : '/complete-profile'])
  } catch (e) {
    console.error('Error checking profile after OAuth:', e)
    this.router.navigate(['/login'])
  }
}
}