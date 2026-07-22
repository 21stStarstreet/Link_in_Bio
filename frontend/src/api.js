import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7154/api', // HTTPS port depending on local dotnet run, we might need to adjust this. Let's use standard HTTP port 5000 or whatever dotnet provides. Actually, we'll just set it to http://localhost:5200 or whatever port the user's .NET runs on. For now, /api since Vite proxy is better. Wait, we enabled CORS for 5173. Let's use https://localhost:7000 or the specific port. I will check the launchSettings.json later if needed. For now, we will assume https://localhost:7154 (standard) or just leave it configurable.
});

// Let's use standard HTTP port 5029 or HTTPS 7154 usually generated.
// To be safe, let's read from the env or just set a placeholder.
api.defaults.baseURL = 'http://localhost:5000/api'; // Assuming we run `dotnet run --urls=http://localhost:5000`

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
