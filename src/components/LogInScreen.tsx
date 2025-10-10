import { Button } from '@/components/ui/pixelact-ui/button'

export function LoginScreen() {
  return (
    <div
      className="fixed inset-0 bg-cover bg-center flex flex-col items-center justify-center"
    >
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
      <h1 className="z-10 pixel-font text-white text-3xl sm:text-4xl md:text-5xl mb-8 text-center drop-shadow-lg">
        PokeClicker
      </h1>

      <div className="z-10 flex flex-col gap-4 w-64">
        <Button className="text-lg w-full">Log in</Button>
        <Button className="text-lg w-full">Sign up</Button>
        <Button className="text-lg w-full">Guest user</Button>
      </div>
    </div>
  )
}
