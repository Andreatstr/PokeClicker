import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/pixelact-ui/button';

type Props = {
  onNavigate: (page: 'clicker' | 'pokedex' | 'login') => void
}

type FormValues = {
  username: string
  password: string
}

export function LoginScreen({ onNavigate }: Props) {
  const [isMobile, setIsMobile] = useState(false)
  const [modalType, setModalType] = useState<'login' | 'signup' | null>(null)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>()

  useEffect(() => {
    reset({ username: '', password: '' })
    setServerError(null)
  }, [modalType, reset])

  const loginMutation = `
    mutation Login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        token
        user {
          _id
          username
          rare_candy
          created_at
          stats { hp attack defense spAttack spDefense speed }
          owned_pokemon_ids
        }
      }
    }
  `

  const signupMutation = `
    mutation Signup($username: String!, $password: String!) {
      signup(username: $username, password: $password) {
        token
        user {
          _id
          username
          rare_candy
          created_at
          stats { hp attack defense spAttack spDefense speed }
          owned_pokemon_ids
        }
      }
    }
  `

  async function submitAuth(data: FormValues) {
    setServerError(null)
    setLoading(true)

    const query = modalType === 'login' ? loginMutation : signupMutation
    const payload = {
      query,
      variables: { username: data.username, password: data.password },
    }

    try {
      const res = await fetch('http://localhost:3001/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      // If server returns non-JSON or network-level 4xx/5xx, handle gracefully
      const body = await res.json().catch(() => null)
      if (!res.ok && body?.errors?.length) {
        setServerError(body.errors[0]?.message || 'Authentication failed')
        setLoading(false)
        return
      }

      // GraphQL errors (200 OK but errors array)
      if (body?.errors && body.errors.length) {
        setServerError(body.errors[0]?.message || 'Authentication failed')
        setLoading(false)
        return
      }

      const key = modalType === 'login' ? 'login' : 'signup'
      const result = body?.data?.[key]

      if (!result || !result.token) {
        setServerError('Authentication failed: no token returned')
        setLoading(false)
        return
      }

      // Persist token and user
      try {
        localStorage.setItem('authToken', result.token)
        if (result.user) localStorage.setItem('user', JSON.stringify(result.user))
      } catch (e) {
        // localStorage might fail in strict privacy modes; still continue
        console.warn('Could not save auth token to localStorage', e)
      }

      reset()
      setModalType(null)
      onNavigate('clicker')
    } catch (err) {
      console.error('submitAuth error', err)
      setServerError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-cover bg-center flex items-center justify-center">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        poster="/project2/loginBackground.png"
      >
        <source src="/project2/loginBackgroundVideo.mp4" type="video/mp4" />
        {/* Fallback for unsupported browsers */}
        Your browser does not support the video tag.
      </video>

      {/* Content */}
      <div className={`z-20 flex flex-col items-center text-center mx-auto ${isMobile ? 'max-w-xs gap-2 px-3' : 'max-w-md gap-6 px-6'}`}>
        <h1 className={`pixel-font text-white ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} mb-3 drop-shadow-lg`}
          style={{ WebkitTextStroke: '1.2px black', color: 'white' }}>
          PokeClicker
        </h1>

        <div className={`flex flex-col items-center justify-center gap-4 ${isMobile ? 'w-3/4' : 'w-full'
          }}`}>
          <Button className={`${isMobile ? 'text-sm py-2' : 'text-base sm:text-lg py-3'}`}
            onClick={() => setModalType('login')}>
            Log in
          </Button>
          <Button className={`${isMobile ? 'text-sm py-2' : 'text-base sm:text-lg py-3'}`}
            onClick={() => setModalType('signup')}>
            Sign up
          </Button>
          <Button className={`${isMobile ? 'text-sm py-2' : 'text-base sm:text-lg py-3'}`}
            onClick={() => onNavigate('clicker')}
          >
            Guest user
          </Button>

          {modalType && (
            <div className="fixed inset-0 z-50 flex items-center justify-center"
              onClick={() => { setModalType(null); setServerError(null) }} aria-modal="true" role="dialog">
              <div className="bg-[var(--retro-surface)] border-[4px] border-[var(--retro-border)] shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 w-full max-w-sm rounded-md text-left"
                onClick={(e) => e.stopPropagation()}>
                <h2 className="pixel-font text-xl text-black mb-4">
                  {modalType === 'login' ? 'Log in' : 'Sign up'}
                </h2>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit(submitAuth)}>
                  <label className="text-sm font-bold text-black">
                    Username:
                    <input
                      {...register('username', {
                        required: 'Username required',
                        minLength: { value: 3, message: '3+ chars' },
                        maxLength: { value: 20, message: 'Max 20 chars' },
                        pattern: { value: /^[a-zA-Z0-9_-]+$/, message: 'Only letters, numbers, _ and -' },
                      })}
                      disabled={loading}
                      type="text"
                      className="mt-1 w-full px-3 py-2 border border-black bg-white text-black text-sm"
                    />
                    {errors.username && <p className="text-xs text-red-700 mt-1">{errors.username.message}</p>}
                  </label>

                  <label className="text-sm font-bold text-black">
                    Password:
                    <input
                      {...register('password', {
                        required: 'Password required',
                        minLength: { value: 6, message: '6+ chars' },
                      })}
                      disabled={loading}
                      type="password"
                      className="mt-1 w-full px-3 py-2 border border-black bg-white text-black text-sm"
                    />
                    {errors.password && <p className="text-xs text-red-700 mt-1">{errors.password.message}</p>}
                  </label>

                  {serverError && <p className="text-xs text-red-700">{serverError}</p>}

                  <Button type="submit" className="text-sm py-2 w-full" disabled={loading}>
                    {loading ? (modalType === 'login' ? 'Logging in...' : 'Signing up...') : (modalType === 'login' ? 'Log in' : 'Sign up')}
                  </Button>

                  <button type="button" className="text-xs text-blue-700 underline mt-2" onClick={() => setModalType(modalType === 'login' ? 'signup' : 'login')}>
                    {modalType === 'login' ? "Don't have a user? Sign up here" : 'Already have an account? Log in here'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div >
  )
}
