import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Input from './ui/Input.jsx';
import Button from './ui/Button.jsx';
import { Lock } from 'lucide-react';
import CryptoJS from 'crypto-js';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const { data: { user }, error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashPassword(newPassword) })
        .eq('email', user.email);

      if (updateError) {
        setError('Error updating user data');
        setIsLoading(false);
        return;
      }

      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-24 xl:px-32">
      <div className="mx-auto w-full max-w-lg">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900 text-center">
          Reset Password
        </h2>
        <p className="mt-3 text-lg text-gray-600 text-center">
          Enter your new password
        </p>

        {error && <p className="mt-4 text-base text-red-500 text-center">{error}</p>}
        {message && <p className="mt-4 text-base text-green-500 text-center">{message}</p>}

        <form className="mt-10 space-y-8" onSubmit={handleResetPassword}>
          <Input
            id="new-password"
            name="new-password"
            type="password"
            label="New Password"
            autoComplete="new-password"
            required
            fullWidth
            leftIcon={<Lock size={20} />}
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-14 text-lg"
          />
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            variant="primary"
            className="h-14 text-lg"
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;