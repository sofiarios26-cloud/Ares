export function mapAuthError(message: string): string {
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos.'
  }
  if (normalized.includes('user already registered')) {
    return 'Este email ya está registrado.'
  }
  if (normalized.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }
  if (normalized.includes('unable to validate email')) {
    return 'El email no es válido.'
  }
  if (normalized.includes('email not confirmed')) {
    return 'Confirmá tu email antes de iniciar sesión.'
  }
  if (normalized.includes('signup requires a valid password')) {
    return 'Ingresá una contraseña válida.'
  }
  if (normalized.includes('username')) {
    return 'Ese nombre de usuario no está disponible.'
  }
  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'Error de conexión. Revisá tu internet.'
  }
  if (normalized.includes('supabase not configured')) {
    return 'Supabase no está configurado. Agregá las variables en .env'
  }

  return message || 'Ocurrió un error. Intentá de nuevo.'
}
