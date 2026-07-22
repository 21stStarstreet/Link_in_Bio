import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaInstagram, FaTwitter, FaGithub, FaLinkedin, FaYoutube, FaSpotify, FaTiktok, FaTwitch } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

function getIconForUrl(url) {
  if (!url) return null;
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('instagram.com')) return <FaInstagram />;
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return <FaTwitter />;
  if (lowerUrl.includes('github.com')) return <FaGithub />;
  if (lowerUrl.includes('linkedin.com')) return <FaLinkedin />;
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return <FaYoutube />;
  if (lowerUrl.includes('spotify.com')) return <FaSpotify />;
  if (lowerUrl.includes('tiktok.com')) return <FaTiktok />;
  if (lowerUrl.includes('twitch.tv')) return <FaTwitch />;
  return null;
}

export default function Profile() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/p/${username}`)
      .then(res => {
        setData(res.data);
        document.title = `@${username} | Links`;
        
        // Update meta description if bio exists
        if (res.data.bio) {
          let meta = document.querySelector('meta[name="description"]');
          if (!meta) {
            meta = document.createElement('meta');
            meta.name = "description";
            document.head.appendChild(meta);
          }
          meta.content = res.data.bio;
        }
      })
      .catch(err => {
        if (err.response?.status === 404) setError(t('profileNotFound'));
        else setError(t('errorOccurred'));
      });
  }, [username]);

  const handleLinkClick = (linkId, url) => {
    axios.post(`http://localhost:5000/api/p/click/${linkId}`).catch(console.error);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '5rem', color: 'white' }}><h2>{error}</h2></div>;
  }

  if (!data) {
    return <div style={{ textAlign: 'center', marginTop: '5rem', color: 'white' }}>{t('loading')}</div>;
  }

  const { displayName, avatarUrl, bio, theme, links } = data;
  const { backgroundColor, backgroundType, buttonStyle, buttonTransparency, buttonTextColor, instagramUrl, twitterUrl, githubUrl, linkedinUrl } = theme;

  const getBackgroundStyle = () => {
    if (backgroundType === 'color') return { backgroundColor: backgroundColor };
    if (backgroundType === 'gradient') return { background: `linear-gradient(135deg, ${theme.gradientStart || '#0f172a'}, ${theme.gradientEnd || '#1e1b4b'})` };
    return {};
  };

  return (
    <>
      <div 
        style={{ 
        minHeight: '100vh', 
        fontFamily: "'Inter', sans-serif",
        transition: 'background-color 0.5s ease',
        position: 'relative',
        ...getBackgroundStyle()
      }}>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 100 }}>
          <LanguageSwitcher />
        </div>
        <div className="profile-container animate-fade-in">
          <img 
            src={avatarUrl || `https://ui-avatars.com/api/?name=${username}&background=random`} 
            alt="Avatar" 
            className="profile-avatar"
          />
          <h1 style={{ marginBottom: '0.5rem', fontWeight: '600' }}>@{username}</h1>
          <p style={{ 
            marginBottom: '2rem', 
            color: 'rgba(255,255,255,0.8)',
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word' 
          }}>{bio}</p>

          <div>
            {links.map((link, index) => (
              <a 
                key={link.id} 
                href={link.url}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.id, link.url);
                }}
                className={`profile-link style-${buttonStyle} stagger-item`}
                style={{ 
                  background: `rgba(255, 255, 255, ${buttonTransparency ?? 0.1})`,
                  color: buttonTextColor || 'white',
                  animationDelay: `${index * 0.1}s`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {getIconForUrl(link.url)}
                {link.title}
              </a>
            ))}
          </div>

          <div className="social-icons-container">
            {instagramUrl && <a href={instagramUrl} target="_blank" rel="noreferrer" className="social-icon"><FaInstagram size={28} /></a>}
            {twitterUrl && <a href={twitterUrl} target="_blank" rel="noreferrer" className="social-icon"><FaTwitter size={28} /></a>}
            {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="social-icon"><FaGithub size={28} /></a>}
            {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="social-icon"><FaLinkedin size={28} /></a>}
          </div>
        </div>
      </div>
    </>
  );
}
