import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/pixelact-ui/button'

export function LoginScreen({
  onNavigate,
}: {
  onNavigate: (page: 'clicker' | 'pokedex' | 'login') => void
}) {
  const [isMobile, setIsMobile] = useState(false)
  const [modalType, setModalType] = useState<'login' | 'signup' | null>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
      <div
        className={`z-20 flex flex-col items-center text-center mx-auto ${isMobile ? 'max-w-xs gap-2 px-3' : 'max-w-md gap-6 px-6'
          }`}
      >
        <h1
          className={`pixel-font text-white ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'
            } mb-3 drop-shadow-lg`}
          style={{
            WebkitTextStroke: '1.2px black',
            color: 'white',
          }}
        >
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
            <div className="fixed inset-0 z-50  bg-opacity-50 flex items-center justify-center"
              onClick={() => setModalType(null)}
              aria-modal="true"
              role="dialog"
            >
              <div className="bg-[var(--retro-surface)] border-[4px] border-[var(--retro-border)] shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 w-full max-w-sm rounded-md text-left"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="pixel-font text-xl text-black mb-4">
                  {modalType === 'login' ? 'Log in' : 'Sign up'}
                </h2>

                <form className="flex flex-col gap-4">
                  <label className="text-sm font-bold text-black">
                    Username:
                    <input
                      type="text"
                      className="mt-1 w-full px-3 py-2 border border-black bg-white text-black text-sm"
                    />
                  </label>

                  <label className="text-sm font-bold text-black">
                    Password:
                    <input
                      type="password"
                      className="mt-1 w-full px-3 py-2 border border-black bg-white text-black text-sm"
                    />
                  </label>

                  <Button className="text-sm py-2 w-full">
                    {modalType === 'login' ? 'Log in' : 'Sign up'}
                  </Button>

                  <button
                    type="button"
                    className="text-xs text-blue-700 underline mt-2"
                    onClick={() =>
                      setModalType(modalType === 'login' ? 'signup' : 'login')
                    }
                  >
                    {modalType === 'login'
                      ? "Don't have a user? Sign up here"
                      : 'Already have an account? Log in here'}
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
