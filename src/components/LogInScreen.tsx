import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/pixelact-ui/button'

export function LoginScreen() {
  const [isMobile, setIsMobile] = useState(false)

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
          <Button className={`${isMobile ? 'text-sm py-2' : 'text-base sm:text-lg py-3'}`}>
            Log in
          </Button>
          <Button className={`${isMobile ? 'text-sm py-2' : 'text-base sm:text-lg py-3'}`}>
            Sign up
          </Button>
          <Button className={`${isMobile ? 'text-sm py-2' : 'text-base sm:text-lg py-3'}`}>
            Guest user
          </Button>
        </div>
      </div>
    </div >
  )
}
