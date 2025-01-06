import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { getLanguage } from '../config/languageUtils';

const TranslationInitializer = ({ children }) => {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const language = getLanguage(window.navigator.language);
    i18n.changeLanguage(language).then(() => setMounted(true));
  }, [i18n]);

  if (!mounted) return null;
  return <>{children}</>;
};

export default TranslationInitializer;
