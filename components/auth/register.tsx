'use client';

import { Input, Button, Card } from '@nextui-org/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import $api from '@/config/api/api';
import { Toaster, toast } from 'react-hot-toast';
import { useTheme } from 'next-themes';
import { getLanguage } from '@/config/languageUtils';

export default function SignUp() {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1); // 1 - Регистрация, 2 - Подтверждение
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Access the current theme
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const language = getLanguage(window.navigator.language);
    i18n.changeLanguage(language).then(() => setMounted(true));
  }, [i18n]);

  if (!mounted) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCodeChange = e => {
    setVerificationCode(e.target.value);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('notifications.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      await $api.post('/users/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      toast.success(t('notifications.registrationSuccess'));
      setStep(2); // Переход на шаг подтверждения
    } catch (error) {
      console.error('Registration error:', error);
      const message =
        error.response?.data?.message || t('notifications.registrationError');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async e => {
    e.preventDefault();

    setLoading(true);

    try {
      await $api.post('/users/verify-email', {
        email: formData.email,
        code: verificationCode,
      });

      toast.success(t('signUp.notifications.verificationSuccess'));
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (error) {
      console.error('Verification error:', error);
      const message =
        error.response?.data?.message || t('signUp.notifications.verificationError');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex dark:bg-[#121212] justify-center items-start sm:items-center bg-gray-100 pl-3 pr-3 py-20 sm:py-0">
      <Card className="p-8 max-w-md w-full dark:border-gray-700 border-2 border-gray-200 rounded-[34px] shadow-none">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <svg
            width="46"
            height="46"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="36" height="36" rx="18" fill="white" />
            <path
              d="M18.665 28.2384C20.3034 27.9377 21.6877 27.3481 23.0934 26.3411C23.9355 25.7346 25.0385 24.5834 25.621 23.7001C25.9998 23.1215 26.5739 21.9945 26.7413 21.5007C26.779 21.3863 26.8438 21.1935 26.8875 21.0789C27.0116 20.7115 27.2067 19.8119 27.2923 19.1899C27.4441 18.0716 27.3342 16.4444 27.0178 15.2114C26.7905 14.3204 25.9955 12.5027 25.7449 12.3149C25.7021 12.2807 25.4987 12.4246 25.1294 12.7588C24.0208 13.7496 22.436 14.7389 21.2076 15.1921C20.9196 15.2973 20.6617 15.4134 20.633 15.4442C20.5813 15.4995 21.1707 16.8779 21.6444 17.8377C21.6954 17.9372 21.792 18.1481 21.8632 18.3123C21.9343 18.4765 22.0502 18.7285 22.1205 18.8689C22.2165 19.062 22.9562 20.6554 23.2008 21.1886C23.2203 21.2356 22.5317 21.2892 20.4455 21.3792C17.8128 21.5 17.4745 21.5296 16.6305 21.7374C14.8423 22.1802 13.3042 22.9715 11.9285 24.156C11.3275 24.6768 10.3713 25.7694 9.93568 26.4273C9.58518 26.9633 8.82723 28.4538 8.83238 28.6024C8.83587 28.7035 17.9669 28.3637 18.665 28.2384Z"
              fill="black"
            />
            <path
              d="M17.6051 7.35172C15.9573 7.59562 14.5534 8.13697 13.1138 9.09472C12.2512 9.67175 11.109 10.7842 10.4963 11.6468C10.0977 12.2119 9.485 13.3184 9.30059 13.8062C9.25895 13.9192 9.18756 14.1096 9.13997 14.2226C9.00315 14.5855 8.77709 15.4778 8.67002 16.0964C8.47965 17.2089 8.53319 18.8388 8.80684 20.0821C9.00315 20.9804 9.73485 22.8245 9.97875 23.0208C10.0204 23.0565 10.2286 22.9197 10.6093 22.5985C11.7515 21.6467 13.3696 20.7127 14.6129 20.3022C14.9043 20.2071 15.1661 20.1 15.1958 20.0702C15.2494 20.0167 14.708 18.6187 14.2678 17.6431C14.2202 17.542 14.131 17.3278 14.0656 17.1613C14.0001 16.9947 13.8931 16.7389 13.8276 16.5961C13.7384 16.3998 13.0543 14.7818 12.8282 14.2404C12.8104 14.1928 13.5004 14.1631 15.5885 14.1452C18.2238 14.1155 18.5629 14.0977 19.4135 13.9192C21.216 13.5385 22.7806 12.8008 24.1964 11.6646C24.815 11.1649 25.8085 10.106 26.2665 9.46355C26.6354 8.94005 27.4444 7.47665 27.4444 7.32793C27.4444 7.2268 18.3071 7.2506 17.6051 7.35172Z"
              fill="#A50AFF"
            />
          </svg>
        </div>
        {/* Step 1: Registration */}
        {step === 1 && (
          <>
            <h1 className="text-gray-800 dark:text-gray-100 text-center text-2xl font-bold mb-6">
              {t('signUp.title')}
            </h1>
            <form onSubmit={handleSubmit}>
              <Input
                type="text"
                label={t('signUp.usernameLabel')}
                placeholder={t('signUp.usernamePlaceholder')}
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="mb-4"
                fullWidth
              />
              <Input
                type="email"
                label={t('signUp.emailLabel')}
                placeholder={t('signUp.emailPlaceholder')}
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mb-4"
                fullWidth
              />
              <Input
                type="password"
                label={t('signUp.passwordLabel')}
                placeholder={t('signUp.passwordPlaceholder')}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mb-4"
                fullWidth
              />
              <Input
                type="password"
                label={t('signUp.confirmPasswordLabel')}
                placeholder={t('signUp.confirmPasswordPlaceholder')}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mb-4"
                fullWidth
              />
              <Button
                className="w-full text-black dark:text-white"
                type="submit"
                size="lg"
                disabled={loading}
              >
                {loading ? t('signUp.notifications.loading') : t('signUp.submitButton')}
              </Button>
            </form>
          </>
        )}
        {/* Step 2: Email Verification */}
        {step === 2 && (
          <>
            <h1 className="text-gray-800 dark:text-gray-100 text-center text-2xl font-bold mb-6">
              {t('emailVerification.notifications.verifyEmail')}
            </h1>
            <form onSubmit={handleVerification}>
              <Input
                type="text"
                label={t('emailVerification.codeLabel')}
                placeholder={t('emailVerification.codePlaceholder')}
                value={verificationCode}
                onChange={handleCodeChange}
                className="mb-4"
                fullWidth
              />
              <Button
                className="w-full text-black dark:text-white"
                type="submit"
                size="lg"
                disabled={loading}
              >
                {loading
                  ? t('emailVerification.notifications.loading')
                  : t('emailVerification.verifyButton')}
              </Button>
            </form>
          </>
        )}

        <div className="flex justify-center items-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/auth/login" className="hover:underline">
            {t('signUp.haveAccount')}
          </Link>
        </div>

        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: resolvedTheme === 'dark' ? '#333' : '#fff',
              color: resolvedTheme === 'dark' ? '#fff' : '#000',
            },
          }}
        />
      </Card>
    </div>
  );
}
