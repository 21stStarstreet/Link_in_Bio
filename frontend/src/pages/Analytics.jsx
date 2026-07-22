import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { FaChartLine, FaMousePointer, FaEye, FaLink, FaMobileAlt, FaDesktop, FaSignOutAlt, FaCog, FaSync } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const COLORS = ['#4f46e5', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444'];

function Analytics() {
  const [summary, setSummary] = useState({ TotalViews: 0, TotalClicks: 0, Ctr: 0 });
  const [timeSeries, setTimeSeries] = useState([]);
  const [devices, setDevices] = useState({ Devices: [], OS: [] });
  const [referrers, setReferrers] = useState([]);
  const [topLinks, setTopLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      else setLoading(true);

      const [summaryRes, timeSeriesRes, devicesRes, referrersRes, topLinksRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/timeseries?days=7'),
        api.get('/analytics/devices'),
        api.get('/analytics/referrers'),
        api.get('/analytics/toplinks')
      ]);

      setSummary(summaryRes.data);
      setTimeSeries(timeSeriesRes.data);
      setDevices(devicesRes.data);
      setReferrers(referrersRes.data);
      setTopLinks(topLinksRes.data);
      
      if (isManual) toast.success(t('dataRefreshed'));
    } catch (err) {
      toast.error(t('dataLoadError'));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '3rem' }}>{t('loadingAnalytics')}</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
      
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 100 }}>
        <LanguageSwitcher />
      </div>

      {/* Header and Tabs */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, background: 'linear-gradient(to right, #4f46e5, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t('advancedAnalytics')}
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => fetchAnalyticsData(true)} disabled={isRefreshing} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: 'auto', height: '36px', boxSizing: 'border-box', padding: '0 1rem', background: '#1e3a8a', border: '1px solid #3b82f6', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: isRefreshing ? 'not-allowed' : 'pointer', boxShadow: 'none', opacity: isRefreshing ? 0.7 : 1 }}>
            <FaSync color="#93c5fd" className={isRefreshing ? 'spin-animation' : ''} /> {isRefreshing ? t('refreshing') : t('refresh')}
          </button>
          <Link to="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: 'auto', height: '36px', boxSizing: 'border-box', padding: '0 1rem', background: '#1e293b', border: '1px solid #64748b', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', boxShadow: 'none' }}>
            <FaCog color="#cbd5e1" /> {t('settings')}
          </Link>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: 'auto', height: '36px', boxSizing: 'border-box', padding: '0 1rem', background: '#450a0a', border: '1px solid #dc2626', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', boxShadow: 'none' }}>
            <FaSignOutAlt color="#fca5a5" /> {t('logout')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <FaEye size={30} color="#4f46e5" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1rem' }}>{t('totalProfileViews')}</h3>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{summary.totalViews || 0}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <FaMousePointer size={30} color="#ec4899" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1rem' }}>{t('totalLinkClicks')}</h3>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{summary.totalClicks || 0}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <FaChartLine size={30} color="#14b8a6" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1rem' }}>{t('ctr')}</h3>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{summary.ctr || 0}%</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem' }}>
        
        {/* Time-Series Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{t('trafficOverview')}</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={timeSeries} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} />
                <Line type="monotone" dataKey="views" name={t('profileViews')} stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="clicks" name={t('linkClicks')} stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Links */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{t('topPerformingLinks')}</h3>
          {topLinks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>{t('noClicksYet')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topLinks.map((link, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{index + 1}</div>
                    <span style={{ fontWeight: '600' }}>{link.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ec4899', fontWeight: 'bold' }}>
                    <FaMousePointer size={12} /> {link.clickCount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Devices & OS */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{t('devicesAndOs')}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center', flex: 1 }}>
            
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{t('deviceType')}</h4>
              <PieChart width={200} height={200}>
                <Pie data={devices.devices} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {devices.devices.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              </PieChart>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                {devices.devices.map((entry, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></span>
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{t('operatingSystem')}</h4>
              <PieChart width={200} height={200}>
                <Pie data={devices.os} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {devices.os.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              </PieChart>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                {devices.os.map((entry, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[(index + 2) % COLORS.length] }}></span>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Referrers */}
        <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{t('topTrafficSources')}</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={referrers} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.8)" width={100} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="value" fill="#14b8a6" radius={[0, 4, 4, 0]}>
                  {referrers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Analytics;
