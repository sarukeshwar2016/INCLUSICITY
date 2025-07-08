import React, { useState } from 'react';
import Input from './ui/Input.jsx';
import Button from './ui/Button.jsx';
import { Eye, EyeOff, Mail, Lock, Twitter } from 'lucide-react';
import { supabase } from '../supabaseClient';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrors({ general: error.message });
        setIsLoading(false);
        return;
      }

      // Fetch the custom user ID from the users table
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('id, remember_me')
        .eq('email', data.user.email)
        .single();

      if (fetchError || !userData) {
        setErrors({ general: 'Error fetching user data' });
        setIsLoading(false);
        return;
      }

      // Update remember_me if checked
      if (remember) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ remember_me: true })
          .eq('email', data.user.email);

        if (updateError) {
          console.error('Error updating remember_me:', updateError);
        }
      }

      // Call onLogin with custom ID and email
      onLogin(userData.id, email, password, remember);
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">
          Welcome back
        </h2>
        <p className="mt-3 text-lg text-gray-600">
          Sign in to access your accessible city navigation
        </p>
      </div>

      {errors.general && (
        <p className="text-base text-red-500 text-center">{errors.general}</p>
      )}

      <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            autoComplete="email"
            required
            fullWidth
            leftIcon={<Mail size={20} />}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            className="h-14 text-lg"
          />

          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            autoComplete="current-password"
            required
            fullWidth
            leftIcon={<Lock size={20} />}
            rightIcon={
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            className="h-14 text-lg"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-5 w-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <label
              htmlFor="remember-me"
              className="ml-3 block text-base text-gray-700"
            >
              Remember me
            </label>
          </div>

          <div className="text-base">
            <a
              href="#"
              className="font-medium text-violet-600 hover:text-violet-500"
              onClick={async (e) => {
                e.preventDefault();
                if (email) {
                  const { error } = await supabase.auth.resetPasswordForEmail(
                    email,
                    {
                      redirectTo: window.location.origin + '/reset-password',
                    }
                  );
                  if (error) {
                    setErrors({ general: error.message });
                  } else {
                    alert('Password reset email sent!');
                  }
                } else {
                  setErrors({ email: 'Please enter your email first' });
                }
              }}
            >
              Forgot your password?
            </a>
          </div>
        </div>

        <div>
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            variant="primary"
            className="h-14 text-lg"
          >
            Sign in
          </Button>
        </div>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-base">
              <span className="bg-gradient-to-br from-violet-50 to-purple-50 px-4 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              fullWidth
              leftIcon={<Twitter size={20} />}
              className="h-14 text-lg"
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'twitter',
                  options: {
                    redirectTo: window.location.origin,
                  },
                });
                if (error) {
                  setErrors({ general: error.message });
                }
              }}
            >
              Continue with Twitter
            </Button>
          </div>
        </div>
      </form>

      <p className="mt-4 text-center text-base text-gray-600">
        Don't have an account?{' '}
        <a
          href="#"
          className="font-medium text-violet-600 hover:text-violet-500"
          onClick={async (e) => {
            e.preventDefault();
            if (!validateForm()) return;
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: window.location.origin,
              },
            });
            if (error) {
              setErrors({ general: error.message });
            } else {
              alert('Sign-up email sent! Please check your inbox.');
            }
          }}
        >
          Sign up for free
        </a>
      </p>
    </div>
  );
};

export default LoginForm;