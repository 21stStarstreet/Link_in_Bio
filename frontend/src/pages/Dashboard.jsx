import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ExternalLink, QrCode, Copy, Eye, Check } from 'lucide-react';
import { FaInstagram, FaTwitter, FaGithub, FaLinkedin, FaYoutube, FaSpotify, FaTiktok, FaTwitch, FaChartLine, FaSignOutAlt, FaSync } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import api from '../api';
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

function SortableLinkItem({ link, originalLink, onDelete, onUpdate, onSave }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: link.id });
  const hasChanges = JSON.stringify(link) !== JSON.stringify(originalLink);
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useLanguage();
  
  const handleSaveClick = async () => {
    setIsSaving(true);
    await onSave(link);
    setIsSaving(false);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={{...style, flexDirection: 'column', alignItems: 'stretch'}} className="link-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
        <div {...attributes} {...listeners} style={{ cursor: 'grab', padding: '0.5rem', color: 'var(--text-muted)' }}>
        <GripVertical size={20} />
      </div>
      <div className="link-card-content">
        <input 
          type="text" 
          value={link.title} 
          onChange={(e) => onUpdate(link.id, { ...link, title: e.target.value })}
          className="glass-input" 
          style={{ marginBottom: '0.5rem', padding: '0.5rem' }}
          placeholder={t('title')}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>{getIconForUrl(link.url)}</span>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
            <select
              value={link.url?.startsWith('http://') ? 'http' : 'https'}
              onChange={(e) => {
                const isHttp = link.url?.startsWith('http://');
                const isHttps = link.url?.startsWith('https://');
                const cleanPath = isHttp ? link.url.substring(7) : (isHttps ? link.url.substring(8) : (link.url || ''));
                onUpdate(link.id, { ...link, url: `${e.target.value}://${cleanPath}` });
              }}
              className="glass-input"
              style={{ width: 'auto', marginBottom: 0, padding: '0.5rem', appearance: 'none', cursor: 'pointer' }}
            >
              <option value="https" style={{ color: 'black' }}>https</option>
              <option value="http" style={{ color: 'black' }}>http</option>
            </select>
            <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>://</span>
            <input 
              type="text" 
              value={(() => {
                const isHttp = link.url?.startsWith('http://');
                const isHttps = link.url?.startsWith('https://');
                return isHttp ? link.url.substring(7) : (isHttps ? link.url.substring(8) : (link.url || ''));
              })()} 
              onChange={(e) => {
                let val = e.target.value;
                let proto = link.url?.startsWith('http://') ? 'http' : 'https';
                
                if (val.startsWith('http://')) {
                  proto = 'http';
                  val = val.substring(7);
                } else if (val.startsWith('https://')) {
                  proto = 'https';
                  val = val.substring(8);
                }
                
                onUpdate(link.id, { ...link, url: `${proto}://${val}` });
              }}
              className="glass-input" 
              style={{ flex: 1, marginBottom: 0, padding: '0.5rem' }}
              placeholder={t('urlPlaceholder')}
            />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <input 
            type="checkbox" 
            checked={link.isActive}
            onChange={(e) => onUpdate(link.id, { ...link, isActive: e.target.checked })}
            style={{ marginRight: '0.3rem' }}
          /> {t('active')}
        </label>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{link.clickCount} {t('clicks')}</span>
        <button onClick={() => onDelete(link.id)} style={{ color: 'var(--danger-color)', padding: '0.5rem' }}>
          <Trash2 size={18} />
        </button>
      </div>
      </div>
      <div style={{
        maxHeight: hasChanges ? '60px' : '0',
        opacity: hasChanges ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: hasChanges ? '0.5rem' : '0'
      }}>
        <button onClick={handleSaveClick} disabled={isSaving} style={{ 
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          width: 'auto', padding: '0.4rem 1rem', 
          background: '#04552b', border: '1px solid #108a46', 
          borderRadius: '8px', color: 'white', fontWeight: '600', 
          cursor: isSaving ? 'not-allowed' : 'pointer', boxShadow: 'none',
          opacity: isSaving ? 0.8 : 1
        }}>
          {isSaving ? (
            <><FaSync size={16} color="#6ee7b7" className="spin-animation" /> {t('pleaseWait')}</>
          ) : (
            <><Check size={16} color="#6ee7b7" strokeWidth={3} /> {t('save')}</>
          )}
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState({ displayName: '', bio: '', profileViews: 0 });
  const [links, setLinks] = useState([]);
  const [theme, setTheme] = useState({ 
    backgroundColor: '#0f172a', 
    backgroundType: 'color',
    buttonStyle: 'rounded', 
    instagramUrl: '',
    twitterUrl: '',
    githubUrl: '',
    linkedinUrl: ''
  });
  const [originalLinks, setOriginalLinks] = useState([]);
  const [originalTheme, setOriginalTheme] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [showQr, setShowQr] = useState(false);
  const [isSavingAppearance, setIsSavingAppearance] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const username = localStorage.getItem('username');
  const profileUrl = `${window.location.origin}/${username}`;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [linksRes, themeRes, profileRes] = await Promise.all([
        api.get('/links'),
        api.get('/themes'),
        api.get('/auth/me')
      ]);
      setLinks(linksRes.data);
      setOriginalLinks(linksRes.data);
      if (themeRes.data) {
        setTheme(themeRes.data);
        setOriginalTheme(themeRes.data);
      }
      if (profileRes.data) {
        setUserProfile(profileRes.data);
        setOriginalProfile(profileRes.data);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await api.put('/auth/profile', { displayName: userProfile.displayName, bio: userProfile.bio });
      toast.success(t('profileSaved'));
    } catch (err) {
      toast.error(t('profileSaveError'));
    }
  };

  const handleAddLink = async () => {
    try {
      const res = await api.post('/links', { title: 'New Link', url: 'https://' });
      setLinks([...links, res.data]);
      setOriginalLinks([...originalLinks, res.data]);
      toast.success(t('linkAdded'));
    } catch (err) {
      toast.error(t('linkAddError'));
    }
  };

  const handleDeleteLink = async (id) => {
    try {
      await api.delete(`/links/${id}`);
      setLinks(links.filter(l => l.id !== id));
      setOriginalLinks(originalLinks.filter(l => l.id !== id));
      toast.success(t('linkDeleted'));
    } catch (err) {
      toast.error(t('linkDeleteError'));
    }
  };

  const hasLinkChanges = JSON.stringify(links) !== JSON.stringify(originalLinks);
  const hasAppearanceChanges = JSON.stringify(theme) !== JSON.stringify(originalTheme) || JSON.stringify(userProfile) !== JSON.stringify(originalProfile);

  const handleUpdateLink = (id, updatedLink) => {
    setLinks(links.map(l => l.id === id ? updatedLink : l));
  };

  const handleSaveSingleLink = async (linkToSave) => {
    try {
      await api.put(`/links/${linkToSave.id}`, linkToSave);
      setOriginalLinks(originalLinks.map(l => l.id === linkToSave.id ? linkToSave : l));
      toast.success(t('linkSaved'));
    } catch (err) {
      toast.error(t('linkSaveError'));
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setLinks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        const reorderReq = newItems.map((item, index) => ({ linkId: item.id, newOrder: index }));
        api.post('/links/reorder', reorderReq).catch(() => toast.error(t('orderSaveError')));
        
        return newItems;
      });
      toast.success(t('orderSaved'));
    }
  };

  const handleThemeUpdate = (newTheme) => {
    setTheme(newTheme);
  };

  const handleSaveAppearance = async () => {
    try {
      setIsSavingAppearance(true);
      await api.put('/themes', theme);
      await api.put('/auth/profile', { displayName: userProfile.displayName, bio: userProfile.bio });
      setOriginalTheme(theme);
      setOriginalProfile(userProfile);
      toast.success(t('appearanceSaved'));
    } catch (err) {
      toast.error(t('appearanceSaveError'));
    } finally {
      setIsSavingAppearance(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success('Profile link copied!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const getBackgroundStyle = () => {
    if (theme.backgroundType === 'color') return { backgroundColor: theme.backgroundColor };
    if (theme.backgroundType === 'gradient') return { background: `linear-gradient(135deg, ${theme.gradientStart || '#0f172a'}, ${theme.gradientEnd || '#1e1b4b'})` };
    return {}; 
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: '1200px' }}>
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 100 }}>
        <LanguageSwitcher />
      </div>
      <div className="dashboard-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ margin: 0, background: 'linear-gradient(to right, #4f46e5, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('dashboard')}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
              <Eye size={16} /> {userProfile.profileViews} {t('views')}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', width: 'fit-content' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              {t('publicProfile')} <Link to={`/${username}`} target="_blank" style={{ color: 'var(--primary-color)', fontWeight: '500', marginLeft: '0.3rem' }}>{profileUrl} <ExternalLink size={14} /></Link>
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
              <button onClick={handleCopyLink} className="btn-primary" style={{ padding: '0.4rem 0.8rem', width: 'auto', background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }}>
                <Copy size={16} />
              </button>
              <button onClick={() => setShowQr(!showQr)} className="btn-primary" style={{ padding: '0.4rem 0.8rem', width: 'auto', background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }}>
                <QrCode size={16} />
              </button>
            </div>
          </div>
          {showQr && (
            <div style={{ marginTop: '1rem', background: 'white', padding: '1rem', borderRadius: '8px', display: 'inline-block' }}>
              <QRCodeSVG value={profileUrl} size={150} />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/admin/analyze" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: 'auto', height: '36px', boxSizing: 'border-box', padding: '0 1rem', background: '#1e3a8a', border: '1px solid #3b82f6', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', boxShadow: 'none' }}>
            <FaChartLine color="#93c5fd" /> {t('analytics')}
          </Link>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: 'auto', height: '36px', boxSizing: 'border-box', padding: '0 1rem', background: '#450a0a', border: '1px solid #dc2626', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', boxShadow: 'none' }}>
            <FaSignOutAlt color="#fca5a5" /> {t('logout')}
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Links Column */}
        <div className="links-column">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>{t('yourLinks')}</h3>
            <button onClick={handleAddLink} className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>{t('addLink')}</button>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
              {links.map(link => (
                <SortableLinkItem 
                  key={link.id} 
                  link={link} 
                  originalLink={originalLinks.find(l => l.id === link.id) || link}
                  onDelete={handleDeleteLink} 
                  onUpdate={handleUpdateLink}
                  onSave={handleSaveSingleLink}
                />
              ))}
            </SortableContext>
          </DndContext>
          {links.length === 0 && <p style={{ color: 'var(--text-muted)' }}>{t('noLinksAdded')}</p>}
        </div>

        {/* Theme Setup Column */}
        <div className="theme-column">
          
          <div style={{
            maxHeight: hasAppearanceChanges ? '100px' : '0',
            opacity: hasAppearanceChanges ? 1 : 0,
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            marginBottom: hasAppearanceChanges ? '1.5rem' : '0'
          }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#10b981', fontWeight: '500' }}>{t('unsavedAppearance')}</span>
              <button onClick={handleSaveAppearance} disabled={isSavingAppearance} style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                width: 'auto', padding: '0.4rem 1rem', 
                background: '#04552b', border: '1px solid #108a46', 
                borderRadius: '8px', color: 'white', fontWeight: '600', 
                cursor: isSavingAppearance ? 'not-allowed' : 'pointer', boxShadow: 'none',
                opacity: isSavingAppearance ? 0.8 : 1
              }}>
                {isSavingAppearance ? (
                  <><FaSync size={16} color="#6ee7b7" className="spin-animation" /> {t('pleaseWait')}</>
                ) : (
                  <><Check size={16} color="#6ee7b7" strokeWidth={3} /> {t('save')}</>
                )}
              </button>
            </div>
          </div>

          {/* Profile Edit Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{t('profile')}</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{t('username')}</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <span style={{ padding: '0.5rem 0.8rem', color: 'var(--text-muted)', borderRight: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>@</span>
                <input 
                  type="text" 
                  value={username} 
                  readOnly
                  style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '0.5rem', outline: 'none', cursor: 'not-allowed' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <span>{t('bio')}</span>
                <span style={{ fontSize: '0.8rem' }}>{(userProfile.bio || '').length} / 400</span>
              </label>
              <textarea 
                ref={(el) => {
                  if (el) {
                    el.style.height = 'auto';
                    el.style.height = el.scrollHeight + 'px';
                  }
                }}
                value={userProfile.bio} 
                onChange={(e) => {
                  setUserProfile({...userProfile, bio: e.target.value});
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                maxLength={400}
                className="glass-input"
                rows="1"
                style={{ overflow: 'hidden', resize: 'none', minHeight: '3rem' }}
                placeholder={t('bioPlaceholder')}
              ></textarea>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{t('appearance')}</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{t('backgroundType')}</label>
              <select 
                value={theme.backgroundType} 
                onChange={(e) => handleThemeUpdate({ ...theme, backgroundType: e.target.value })}
                className="glass-input"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <option value="color" style={{ color: 'black' }}>{t('solidColor')}</option>
                <option value="gradient" style={{ color: 'black' }}>{t('customGradient')}</option>
              </select>
            </div>

            {theme.backgroundType === 'color' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{t('backgroundColor')}</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="color" 
                    value={theme.backgroundColor} 
                    onChange={(e) => handleThemeUpdate({ ...theme, backgroundColor: e.target.value })}
                    style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    value={theme.backgroundColor} 
                    onChange={(e) => handleThemeUpdate({ ...theme, backgroundColor: e.target.value })}
                    className="glass-input"
                    style={{ marginBottom: 0 }}
                  />
                </div>
              </div>
            )}

            {theme.backgroundType === 'gradient' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Gradient</label>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('gradientStart')}</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="color" 
                        value={theme.gradientStart || '#0f172a'} 
                        onChange={(e) => handleThemeUpdate({ ...theme, gradientStart: e.target.value })}
                        style={{ width: '30px', height: '30px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      />
                      <input 
                        type="text" 
                        value={theme.gradientStart || '#0f172a'} 
                        onChange={(e) => handleThemeUpdate({ ...theme, gradientStart: e.target.value })}
                        className="glass-input"
                        style={{ marginBottom: 0, padding: '0.2rem', fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('gradientEnd')}</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="color" 
                        value={theme.gradientEnd || '#1e1b4b'} 
                        onChange={(e) => handleThemeUpdate({ ...theme, gradientEnd: e.target.value })}
                        style={{ width: '30px', height: '30px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      />
                      <input 
                        type="text" 
                        value={theme.gradientEnd || '#1e1b4b'} 
                        onChange={(e) => handleThemeUpdate({ ...theme, gradientEnd: e.target.value })}
                        className="glass-input"
                        style={{ marginBottom: 0, padding: '0.2rem', fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>
                </div>

                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('presetGradients')}</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleThemeUpdate({ ...theme, gradientStart: '#0f172a', gradientEnd: '#1e1b4b' })} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', border: '2px solid white', cursor: 'pointer' }} title="Dark Blue"></button>
                  <button onClick={() => handleThemeUpdate({ ...theme, gradientStart: '#4f46e5', gradientEnd: '#ec4899' })} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #ec4899)', border: '2px solid white', cursor: 'pointer' }} title="Purple Pink"></button>
                  <button onClick={() => handleThemeUpdate({ ...theme, gradientStart: '#14b8a6', gradientEnd: '#0f172a' })} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #14b8a6, #0f172a)', border: '2px solid white', cursor: 'pointer' }} title="Teal Dark"></button>
                  <button onClick={() => handleThemeUpdate({ ...theme, gradientStart: '#f59e0b', gradientEnd: '#ef4444' })} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', border: '2px solid white', cursor: 'pointer' }} title="Orange Red"></button>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{t('buttonStyle')}</label>
              <select 
                value={theme.buttonStyle} 
                onChange={(e) => handleThemeUpdate({ ...theme, buttonStyle: e.target.value })}
                className="glass-input"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <option value="rounded" style={{ color: 'black' }}>{t('roundedPill')}</option>
                <option value="soft" style={{ color: 'black' }}>{t('softRounded')}</option>
                <option value="sharp" style={{ color: 'black' }}>{t('sharpSquare')}</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <span>{t('buttonTransparency')}</span>
                <span>{Math.round((theme.buttonTransparency ?? 0.1) * 100)}%</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={theme.buttonTransparency ?? 0.1} 
                onChange={(e) => handleThemeUpdate({ ...theme, buttonTransparency: parseFloat(e.target.value) })}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{t('buttonTextColor')}</label>
              <select 
                value={theme.buttonTextColor || 'white'} 
                onChange={(e) => handleThemeUpdate({ ...theme, buttonTextColor: e.target.value })}
                className="glass-input"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <option value="white" style={{ color: 'black' }}>{t('white')}</option>
                <option value="black" style={{ color: 'black' }}>{t('black')}</option>
              </select>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{t('socialIcons')}</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <FaInstagram size={16}/> Instagram
              </label>
              <input 
                type="url" 
                placeholder="https://instagram.com/..."
                value={theme.instagramUrl || ''} 
                onChange={(e) => handleThemeUpdate({ ...theme, instagramUrl: e.target.value })}
                className="glass-input"
                style={{ marginBottom: 0 }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <FaTwitter size={16}/> Twitter / X
              </label>
              <input 
                type="url" 
                placeholder="https://twitter.com/..."
                value={theme.twitterUrl || ''} 
                onChange={(e) => handleThemeUpdate({ ...theme, twitterUrl: e.target.value })}
                className="glass-input"
                style={{ marginBottom: 0 }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <FaGithub size={16}/> GitHub
              </label>
              <input 
                type="url" 
                placeholder="https://github.com/..."
                value={theme.githubUrl || ''} 
                onChange={(e) => handleThemeUpdate({ ...theme, githubUrl: e.target.value })}
                className="glass-input"
                style={{ marginBottom: 0 }}
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <FaLinkedin size={16}/> LinkedIn
              </label>
              <input 
                type="url" 
                placeholder="https://linkedin.com/in/..."
                value={theme.linkedinUrl || ''} 
                onChange={(e) => handleThemeUpdate({ ...theme, linkedinUrl: e.target.value })}
                className="glass-input"
                style={{ marginBottom: 0 }}
              />
            </div>

          </div>
        </div>

        {/* Live Preview Column */}
        <div className="preview-column">
          <div style={{ 
            width: '320px', 
            height: '650px', 
            border: '12px solid #000', 
            borderRadius: '40px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            {/* The notch */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120px', height: '25px', background: '#000', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px', zIndex: 10 }}></div>
            
            <div 
              style={{ 
              width: '100%', 
              height: '100%', 
              padding: '3rem 1.5rem',
              overflowY: 'auto',
              fontFamily: "'Inter', sans-serif",
              ...getBackgroundStyle()
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', margin: '0 auto 1rem' }}></div>
                <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>@{username}</h4>
                <p style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  fontSize: '0.9rem', 
                  marginBottom: '1.5rem', 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word' 
                }}>{userProfile.bio}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {links.filter(l => l.isActive).map(link => (
                    <div 
                      key={link.id} 
                      className={`style-${theme.buttonStyle}`}
                      style={{ 
                        padding: '0.8rem', 
                        background: `rgba(255, 255, 255, ${theme.buttonTransparency ?? 0.1})`, 
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: theme.buttonTextColor || 'white',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {getIconForUrl(link.url)}
                      {link.title}
                    </div>
                  ))}
                </div>

                {/* Social Icons Preview */}
                <div className="social-icons-container" style={{ marginTop: '1.5rem' }}>
                  {theme.instagramUrl && <FaInstagram className="social-icon" size={20} />}
                  {theme.twitterUrl && <FaTwitter className="social-icon" size={20} />}
                  {theme.githubUrl && <FaGithub className="social-icon" size={20} />}
                  {theme.linkedinUrl && <FaLinkedin className="social-icon" size={20} />}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
