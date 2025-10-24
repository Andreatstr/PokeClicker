import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {gql, useMutation} from '@apollo/client';
import {Button} from '@ui/pixelact';
import {useAuth} from '@features/auth';

type Props = {
  onNavigate: (page: 'clicker' | 'pokedex' | 'login') => void;
};

type FormValues = {
  username: string;
  password: string;
};

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        _id
        username
        rare_candy
        created_at
        stats {
          hp
          attack
          defense
          spAttack
          spDefense
          speed
        }
        owned_pokemon_ids
        favorite_pokemon_id
      }
    }
  }
`;

const SIGNUP_MUTATION = gql`
  mutation Signup($username: String!, $password: String!) {
    signup(username: $username, password: $password) {
      token
      user {
        _id
        username
        rare_candy
        created_at
        stats {
          hp
          attack
          defense
          spAttack
          spDefense
          speed
        }
        owned_pokemon_ids
        favorite_pokemon_id
      }
    }
  }
`;

export function LoginScreen({onNavigate}: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [modalType, setModalType] = useState<'login' | 'signup' | null>(null);
  const {login: authLogin} = useAuth();

  const [loginMutation, {loading: loginLoading, error: loginError}] =
    useMutation(LOGIN_MUTATION);
  const [signupMutation, {loading: signupLoading, error: signupError}] =
    useMutation(SIGNUP_MUTATION);

  const loading = loginLoading || signupLoading;
  const error = loginError || signupError;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  async function submitAuth(data: FormValues) {
    try {
      const mutation = modalType === 'login' ? loginMutation : signupMutation;
      const result = await mutation({
        variables: {username: data.username, password: data.password},
      });

      const authData =
        result.data?.[modalType === 'login' ? 'login' : 'signup'];

      if (authData?.token && authData?.user) {
        await authLogin(authData.token, authData.user);
        reset();
        setModalType(null);
        onNavigate('clicker');
      }
    } catch (err) {
      console.error('Authentication error:', err);
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
        Your browser does not support the video tag.
      </video>

      {/* Content */}
      <div
        className={`z-20 flex flex-col items-center text-center mx-auto ${isMobile ? 'max-w-xs gap-2 px-3' : 'max-w-md gap-6 px-6'}`}
      >
        <h1
          className={`pixel-font text-white ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} mb-3 drop-shadow-lg`}
          style={{WebkitTextStroke: '2px black', color: 'white'}}
        >
          PokeClicker
        </h1>

        <div
          className={`flex flex-col items-center justify-center gap-4 ${isMobile ? 'w-3/4' : 'w-full'}`}
        >
          <Button
            className={`w-52 ${isMobile ? 'text-sm py-2' : 'text-base sm:text-lg py-3'}`}
            onClick={() => setModalType('login')}
          >
            Log in
          </Button>
          <Button
            className={`w-52 ${isMobile ? 'text-sm py-2' : 'text-base sm:text-lg py-3'}`}
            onClick={() => setModalType('signup')}
          >
            Sign up
          </Button>
          <Button
            className={`w-52 ${isMobile ? 'text-sm py-2' : 'text-base sm:text-lg py-3'}`}
            onClick={() => onNavigate('clicker')}
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
                className="border-[4px] shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 w-full max-w-sm rounded-md text-left"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
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
                    type="submit"
                    className="text-sm py-2 w-full"
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
    </div>
  );
}
