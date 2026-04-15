import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // se houver "next" na busca, use-o como a URL de redirecionamento, caso contrário use "/"
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // host original da Vercel
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // ambiente local
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Se houver erro ou não houver código, redireciona para login com erro
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
