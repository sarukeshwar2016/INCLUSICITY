import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from './ui/Input.jsx';
import Button from './ui/Button.jsx';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { supabase } from '../supabaseClient';
import CryptoJS from 'crypto-js';

const SignUpForm = ({ onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!email.trim()) { // Updated to trim whitespace
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password.trim()) { // Updated to trim whitespace
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before proceeding
    if (!validateForm()) {
      setIsLoading(false); // Ensure loading is reset
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear previous errors

    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), // Trim email
        password: password.trim(), // Trim password
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setErrors({ general: error.message });
        setIsLoading(false);
        return;
      }

      // Wait briefly to ensure the trigger has created the user record
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update the users table with the hashed password
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashPassword(password.trim()) })
        .eq('email', email.trim());

      if (updateError) {
        console.error('Error storing password:', updateError);
        setErrors({ general: 'Error storing user data' });
        setIsLoading(false);
        return;
      }

      // Fetch the custom user ID
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.trim())
        .single();

      if (fetchError || !userData) {
        console.error('Error fetching user data:', fetchError);
        setErrors({ general: 'Error fetching user data. Please try signing up again.' });
        setIsLoading(false);
        return;
      }

      // Call onSignUp and redirect to login page
      onSignUp(userData.id, email.trim());
      alert('Sign-up email sent! Please check your inbox.');
      navigate('/'); // Redirect to login page
    } catch (error) {
      console.error('Sign-up error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">
          Create an Account
        </h2>
        <p className="mt-3 text-lg text-gray-600">
          Sign up to access your accessible city navigation
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
            autoComplete="new-password"
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

        <div>
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            variant="primary"
            className="h-14 text-lg"
          >
            Sign Up
          </Button>
        </div>
      </form>

      <p className="mt-4 text-center text-base text-gray-600">
        Already have an account?{' '}
        <a
          href="/"
          className="font-medium text-violet-600 hover:text-violet-500"
        >
          Sign in
        </a>
      </p>
    </div>
  );
};

export default SignUpForm;