<h1 align="center">🔗 LinkInBio Platform</h1>

<p align="center">
  <b>Modern, kişiselleştirilebilir ve detaylı analitik sunan "Link-in-Bio" SaaS Platformu</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/.NET-10.0-512BD4?style=flat-square&logo=dotnet&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-Lightning_Fast-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Entity_Framework-Core-512BD4?style=flat-square" />
  <img src="https://img.shields.io/badge/SQLite-Local_DB-003B57?style=flat-square&logo=sqlite&logoColor=white" />
</p>

---

## 📖 Proje Hakkında

**LinkInBio Platform**, kullanıcıların tüm dijital varlıklarını (sosyal medya, portfolyo, web siteleri) tek bir merkezde toplamasını sağlayan, **uçtan uca bir mikro-SaaS** (Hizmet Olarak Yazılım) çözümüdür.

Amaç sıradan bir profil sayfası veya link listesi oluşturmak değil; **gerçek zamanlı CTR (Tıklanma Oranı) analitiği, gradyan (gradient) tabanlı tema kişiselleştirmesi ve global dil desteğini** kusursuz bir kullanıcı deneyimi ile harmanlayarak ticari bir ürün standardında sunmaktı.

> Kullanıcının kendini dijital dünyada en iyi şekilde ifade etmesini sağlarken, arka planda veri odaklı sağlam bir mimari işletir.

---

## 🖥️ Ekran Görüntüleri

### Kullanıcı Profili (Canlı Görünüm)
Ziyaretçilerin karşılaştığı, özelleştirilmiş arka plan ve butonlarla tasarlanmış vitrin sayfası.

<img width="800" alt="Profil Ekran Görüntüsü" src="https://via.placeholder.com/1501x832?text=Profil+Ekrani+Goruntusunu+Buraya+Ekleyin" />

### Analitik Dashboard
Toplam görüntülenme, toplam tıklanma ve CTR oranlarını gösteren anlık performans sayfası.

<img width="800" alt="Dashboard Ekran Görüntüsü" src="https://via.placeholder.com/1501x832?text=Analitik+Dashboard+Goruntusunu+Buraya+Ekleyin" />

### Tema ve Özelleştirme Ayarları
Gradyan renk geçişleri, buton ovallikleri ve sosyal medya entegrasyonlarının yapıldığı panel.

<img width="800" alt="Tema Ekran Görüntüsü" src="https://via.placeholder.com/1501x832?text=Tema+Ayarlari+Goruntusunu+Buraya+Ekleyin" />

### 📱 Mobil Görünüm (Responsive Kanıtı)
Platformun %100 mobil uyumlu çalışan profil sayfası ve yönetici panelinin (Admin Dashboard) telefonlardaki şık görünümü.

<img width="400" alt="Mobil Ekran Görüntüsü" src="https://via.placeholder.com/400x800?text=Mobil+Cihaz+Goruntusunu+Buraya+Ekleyin" />

---

## ✨ Öne Çıkan Özellikler

- **Gelişmiş Metrikler & CTR Hesaplama:** Sadece basit sayaçlar değil; `TotalViews`, `TotalClicks` ve bu verilerden türetilen **CTR (Click-Through Rate)** hesaplamasını sunan `AnalyticsController` altyapısı.
- **Micro-Theming Motoru:** Kullanıcılara sadece "kırmızı/mavi" seçeneği değil; `GradientStart`, `GradientEnd`, `ButtonStyle` (sharp, rounded, soft) ve `ButtonTransparency` gibi CSS-vari derin özelleştirme imkanı sunan `Theme` entity'si.
- **Sosyal Medya Kısayolları:** Instagram, Twitter, GitHub ve LinkedIn gibi platformlar için entegre URL alanları.
- **Tek Tıkla QR Kod:** Kullanıcıların profillerini fiziksel ortamlarda (kartvizit, afiş vb.) kolayca paylaşabilmesi için profil linkini tek tıkla QR koda dönüştürebilme özelliği.
- **%100 Responsive (Mobil Uyumlu):** Sadece herkese açık Profil sayfası değil, **Yönetici Paneli (Admin Dashboard)** dahil tüm sistem uçtan uca telefon ve tabletlerle kusursuz çalışacak şekilde (Mobile-First) tasarlanmıştır.
- **i18n Multi-Language:** Global kullanım için `translations.js` ile desteklenen çoklu dil altyapısı.
- **%100 Tak-Çalıştır:** Migration veya ağır veritabanı kurulumlarına ihtiyaç duymadan kendi kendini kuran SQLite yapısı.
- **JWT Tabanlı Güvenlik:** Modern ve stateless kimlik doğrulama.

---

## 🏗️ Mimari

**İzole Frontend ve Backend Katmanı.** Veri erişimi ve iş kuralları tamamen REST API üzerinden yürütülürken, önyüz (frontend) bağımsız ve reaktif bir SPA (Single Page Application) olarak konumlandırılmıştır.

```text
LinkInBio/
├── backend/
│   ├── Controllers/   → Auth, Links, Themes, Analytics, Public API'leri
│   ├── Models/        → EF Core Entity'leri (Theme, ClickEvent, VisitEvent, User, Link)
│   └── Data/          → AppDbContext ve SQLite bağlantı konfigürasyonları
└── frontend/
    ├── src/pages/     → Dashboard, Login, Register, PublicProfile
    ├── src/contexts/  → React Context API ile Global State Yönetimi
    └── src/api.js     → Axios ile merkezi JWT'li API iletişimi
```

---

## ⚙️ Teknik Kararlar

<details>
<summary><b>📌 Tıklanma Oranı (CTR) ve Ayrık Analitik Tabloları</b></summary>

Veritabanı performansı (Lock Contention) düşünülerek, her tıklama Link tablosundaki bir sayacı (`ClickCount++`) güncellemek yerine, `ClickEvent` tablosuna INSERT olarak atılır. `AnalyticsController`, bu tabloları birleştirerek toplam görüntülenmeyi ve `(TotalClicks / TotalViews * 100)` matematiği ile gerçek zamanlı CTR oranını milisaniyeler içinde hesaplar.
</details>

<details>
<summary><b>📌 Granüler Tema Modeli (Granular Theming)</b></summary>

Kullanıcılara sınırsız özgürlük vermek adına `Theme` entity'si çok detaylı tasarlandı. `BackgroundType` özelliği ile sistemin hem düz renk (`BackgroundColor`) hem de CSS gradyan (`GradientStart`, `GradientEnd`) render edebilmesine olanak tanındı. Butonların transparanlığı (`ButtonTransparency`) veritabanında ondalıklı sayı olarak tutulup arayüzde doğrudan RGBA formatına çevrilir.
</details>

<details>
<summary><b>📌 Otomatik Veritabanı (Zero-Config)</b></summary>

Uygulamanın açık kaynak ruhuna uygun olarak, indirildiği anda çalışabilmesi için `dbContext.Database.EnsureCreated();` stratejisi kullanıldı. Terminal komutlarına veya dış bir SQL sunucusuna ihtiyaç duyulmaz.
</details>

---

## 🚀 Kurulum

Projeyi çalıştırmak **sadece 2 dakikanızı** alır. Veritabanı kurmanıza gerek yoktur.

```bash
# 1. Depoyu klonla
git clone https://github.com/<kullanici>/LinkInBio.git

# 2. Backend'i Başlat (API)
cd LinkInBio/backend
dotnet run
# (http://localhost:5000 adresinde başlar ve app.db'yi otomatik oluşturur)

# 3. Frontend'i Başlat (UI)
# Yeni bir terminal açın
cd LinkInBio/frontend
npm install
npm run dev
# (http://localhost:5173 adresinde başlar)
```

---

## 🛠️ Teknoloji Yığını

**Backend:** .NET 10, ASP.NET Core Web API, Entity Framework Core, JWT
**Veritabanı:** SQLite (Local DB)
**Frontend:** React 19, Vite, React Router, Axios
**Grafik & Görsellik:** Recharts, Lucide Icons, Vanilla CSS
