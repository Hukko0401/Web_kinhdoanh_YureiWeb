import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from '../services/auth.service'

export const authGuard = async () => {
const auth = inject(AuthService)
const router = inject(Router)

const user = await auth.getCurrentUserAsync()

if (user) {
    return true        // ← có login → cho vào
} else {
    router.navigate(['/login'])
    return false       // ← chưa login → đá về login
}
}