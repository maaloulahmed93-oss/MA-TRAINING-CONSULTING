import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { ROUTES } from '../config/routes';

/**
 * Login Page Component
 * Authentication page with email/password form
 */
const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinCode, setPinCode] = useState('');
  
  const MASTER_PIN = 'MA-44172284';
  const MAX_ATTEMPTS = 3;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (pinCode === MASTER_PIN) {
        // PIN correct - login with admin credentials
        await login({ email: 'admin@matc.com', password: 'admin123' });
        // Reset states
        setFailedAttempts(0);
        setShowPinInput(false);
        setPinCode('');
        // Redirect to dashboard
        navigate(ROUTES.DASHBOARD);
      } else {
        setError('Code PIN incorrect');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('PIN login error:', error);
      setError('Erreur de connexion. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData);
      setFailedAttempts(0); // Reset on success
    } catch (err: any) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setShowPinInput(true);
        setError(`Trop de tentatives échouées. Veuillez entrer le code PIN de sécurité.`);
      } else {
        const errorMessage = err?.message || 'Email ou mot de passe incorrect';
        setError(`${errorMessage} (${newAttempts}/${MAX_ATTEMPTS} tentatives)`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Panneau d'Administration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous à votre compte administrateur
          </p>
        </div>

        {/* PIN Code Form (shown after 3 failed attempts) */}
        {showPinInput ? (
          <form className="mt-8 space-y-6" onSubmit={handlePinSubmit}>
            <div className="space-y-4">
              {/* PIN Code Field */}
              <div>
                <label htmlFor="pinCode" className="block text-sm font-medium text-gray-700">
                  Code PIN de Sécurité
                </label>
                <div className="mt-1">
                  <input
                    id="pinCode"
                    name="pinCode"
                    type="text"
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm text-center text-lg font-mono tracking-wider"
                    placeholder="MA-XXXXXXXX"
                    maxLength={12}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Entrez le code PIN de sécurité pour accéder au panneau
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Info Message */}
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="text-sm text-yellow-700">
                <p className="font-medium">⚠️ Accès sécurisé requis</p>
                <p className="mt-1">Vous avez dépassé le nombre de tentatives autorisées. Veuillez entrer le code PIN de sécurité.</p>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LockClosedIcon className="h-5 w-5 text-primary-500 group-hover:text-primary-400" />
                </span>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Vérification...
                  </div>
                ) : (
                  'Valider le code PIN'
                )}
              </button>
            </div>

            {/* Back to login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowPinInput(false);
                  setFailedAttempts(0);
                  setError('');
                  setPinCode('');
                }}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                ← Retour à la connexion normale
              </button>
            </div>
          </form>
        ) : (
          /* Normal Login Form */
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="admin@matc.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LockClosedIcon className="h-5 w-5 text-primary-500 group-hover:text-primary-400" />
              </span>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>
        </form>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 MATC. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
