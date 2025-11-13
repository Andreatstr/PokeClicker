import {useState, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {useMutation} from '@apollo/client';
import {Button} from '@ui/pixelact';
import {useAuth} from '@features/auth/hooks/useAuth';
import {
  LOGIN_MUTATION,
  SIGNUP_MUTATION,
  type LoginData,
  type SignupData,
  type AuthVariables,
} from '@/lib/graphql';
import {logger} from '@/lib/logger';
import {useMobileDetection} from '@/hooks';

type Props = {
  onNavigate: (page: 'pokedex' | 'clicker' | 'login') => void;
};

type FormValues = {
  username: string;
  password: string;
};

export function LoginScreen({onNavigate}: Props) {
  const [modalType, setModalType] = useState<'login' | 'signup' | null>(null);
  const {login: authLogin} = useAuth();

  // Use centralized mobile detection hook
  const isMobile = useMobileDetection(768);

  const [loginMutation, {loading: loginLoading, error: loginError}] =
    useMutation<LoginData, AuthVariables>(LOGIN_MUTATION);
  const [signupMutation, {loading: signupLoading, error: signupError}] =
    useMutation<SignupData, AuthVariables>(SIGNUP_MUTATION);

  const loading = loginLoading || signupLoading;
  const error = loginError || signupError;

  const {
    register,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<FormValues>({
    mode: 'onSubmit',
  });

  useEffect(() => {
    reset({username: '', password: ''});
  }, [modalType, reset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalType(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCloseButtonKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      setModalType(null);
    }
  };

  async function submitAuth(data: FormValues) {
    try {
      const mutation = modalType === 'login' ? loginMutation : signupMutation;
      const result = await mutation({
        variables: {username: data.username, password: data.password},
      });

      const authData =
        modalType === 'login'
          ? (result.data as LoginData | undefined)?.login
          : (result.data as SignupData | undefined)?.signup;

      if (authData?.token && authData?.user) {
        await authLogin(authData.token, authData.user);
        reset();
        setModalType(null);
        onNavigate('pokedex');
      }
    } catch (err) {
      logger.logError(err, 'Authentication');
    }
  }

  async function loginAsGuest() {
    try {
      const guestUsername = `g_${crypto.randomUUID().slice(0, 8)}`;
      const guestPassword = crypto.randomUUID();

      console.log('Creating guest user:', guestUsername);

      const signupResult = await signupMutation({
        variables: {
          username: guestUsername,
          password: guestPassword,
          isGuestUser: true,
        },
      });

      console.log('Signup result:', signupResult);

      if (!signupResult) {
        logger.logError(new Error('No result from signup'), 'GuestSignup');
        return;
      }

      const authData = (signupResult.data as SignupData | undefined)?.signup;

      console.log('Auth data:', authData);

      if (!authData) {
        logger.logError(new Error('No auth data in response'), 'GuestSignup');
        return;
      }

      if (authData?.token && authData?.user) {
        await authLogin(authData.token, authData.user);
        onNavigate('pokedex');
      } else {
        logger.logError(
          new Error('Missing token or user in auth data'),
          'GuestSignup'
        );
      }
    } catch (err) {
      logger.logError(err, 'GuestSignup');
    }
  }

  return (
    <main className="fixed inset-0 bg-cover bg-center flex items-center justify-center">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        poster="/project2/loginBackground.webp"
      >
        <source src="/project2/loginBackgroundVideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Content */}
      <section
        className={`z-20 flex flex-col items-center text-center mx-auto ${isMobile ? 'max-w-xs gap-2 px-3' : 'max-w-md gap-6 px-6'}`}
        aria-labelledby="login-heading"
      >
        <h1
          id="login-heading"
          className={`pixel-font text-white ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} mb-3 drop-shadow-lg`}
          style={{WebkitTextStroke: '2px black', color: 'white'}}
        >
          PokeClicker
        </h1>

        <div
          className={`flex flex-col items-center justify-center gap-4 ${isMobile ? 'w-3/4' : 'w-full'}`}
        >
          <Button
            tabIndex={0}
            className={`w-52 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-0 ${isMobile ? 'text-sm py-2' : 'text-base sm:text-lg py-3'}`}
            onClick={() => setModalType('login')}
            aria-label="Log in"
          >
            Log in
          </Button>
          <Button
            tabIndex={0}
            className={`w-52 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-0 ${isMobile ? 'text-sm py-2' : 'text-base sm:text-lg py-3'}`}
            onClick={() => setModalType('signup')}
            aria-label="Sign up"
          >
            Sign up
          </Button>
          <Button
            tabIndex={0}
            className={`w-52 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-0 ${isMobile ? 'text-sm py-2' : 'text-base sm:text-lg py-3'}`}
            onClick={loginAsGuest}
            disabled={loading}
            aria-label="Guest user"
          >
            Guest user
          </Button>

          {modalType && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center"
              onClick={() => {
                setModalType(null);
              }}
              aria-modal="true"
              role="dialog"
            >
              <div
                id="auth-modal"
                className="border-[4px] shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 w-full max-w-sm rounded-md text-left relative"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setModalType(null)}
                  onKeyDown={handleCloseButtonKey}
                  className="absolute top-3 right-4 text-xl font-bold text-red-600 focus:outline-red"
                  aria-label="Close modal"
                >
                  x
                </button>
                <h2
                  className="pixel-font text-xl mb-4"
                  style={{color: 'var(--foreground)'}}
                >
                  {modalType === 'login' ? 'Log in' : 'Sign up'}
                </h2>

                <form
                  className="flex flex-col gap-4"
                  onSubmit={handleSubmit(submitAuth)}
                >
                  <label
                    className="text-sm font-bold"
                    style={{color: 'var(--foreground)'}}
                  >
                    Username:
                    <input
                      {...register('username', {
                        required: 'Username required',
                        minLength: {value: 3, message: '3+ chars'},
                        maxLength: {value: 20, message: 'Max 20 chars'},
                        pattern: {
                          value: /^[a-zA-Z0-9_-]+$/,
                          message: 'Only letters, numbers, _ and -',
                        },
                      })}
                      disabled={loading}
                      type="text"
                      className="mt-1 w-full px-3 py-2 border border-black text-sm"
                      aria-label="Username"
                      style={{
                        backgroundColor: 'var(--input)',
                        color: 'var(--foreground)',
                      }}
                    />
                    {errors.username && (
                      <p
                        className="text-xs mt-1"
                        style={{color: 'var(--destructive)'}}
                      >
                        {errors.username.message}
                      </p>
                    )}
                  </label>

                  <label
                    className="text-sm font-bold"
                    style={{color: 'var(--foreground)'}}
                  >
                    Password:
                    <input
                      {...register('password', {
                        required: 'Password required',
                        minLength: {value: 6, message: '6+ chars'},
                      })}
                      disabled={loading}
                      type="password"
                      className="mt-1 w-full px-3 py-2 border border-black text-sm"
                      aria-label="Password"
                      style={{
                        backgroundColor: 'var(--input)',
                        color: 'var(--foreground)',
                      }}
                    />
                    {errors.password && (
                      <p
                        className="text-xs mt-1"
                        style={{color: 'var(--destructive)'}}
                      >
                        {errors.password.message}
                      </p>
                    )}
                  </label>

                  {error && (
                    <p className="text-xs text-red-700">{error.message}</p>
                  )}

                  <Button
                    tabIndex={0}
                    type="submit"
                    className="text-sm py-2 w-full"
                    aria-label={`${modalType === 'login' ? 'Log in' : 'Sign up'}`}
                    disabled={loading}
                  >
                    {loading
                      ? modalType === 'login'
                        ? 'Logging in...'
                        : 'Signing up...'
                      : modalType === 'login'
                        ? 'Log in'
                        : 'Sign up'}
                  </Button>

                  <button
                    type="button"
                    className="text-xs text-blue-700 underline mt-2"
                    aria-label={`${modalType === 'login' ? "Don't have a user? Sign up here" : 'Already have an account? Log in here'}`}
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
      </section>
    </main>
  );
}
