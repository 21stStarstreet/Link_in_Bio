import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'tr' : 'en');
  };

  return (
    <button 
      onClick={toggleLanguage}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.8rem',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '20px',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.2s ease',
        boxShadow: 'none'
      }}
      title={language === 'en' ? 'Türkçe\'ye Çevir' : 'Switch to English'}
    >
      {language === 'en' ? '🇹🇷 TR' : '🇬🇧 EN'}
    </button>
  );
}
