# Baki Gül — Claude Notebook AI Danışmanlık Sitesi

Claude'un sıcak krem ve turuncu renklerinden ilham alan, not defteri detaylarına sahip tek sayfalık AI danışmanlık sitesi.

İlk sürüm gerçek bir LLM çağrısı yapmaz. Ziyaretçi üç hazır AI probleminden birini seçtiğinde önerilen çalışma, inceleme alanı ve ilk adım ekranda değişir.

## Tasarım yapısı

- Sıcak krem, kahve ve Claude turuncusu renk paleti
- Defter çizgileri, bant, ataş ve el yazısı notları
- İki sayfalık hero alanı
- Hazır seçeneklerle çalışan mini AI check-up
- Üç danışmanlık çalışma alanı
- Kullanım senaryoları ve danışman profili
- Gerçek Baki ile AI yazılarını gösteren blog bölümü
- Mobil ve masaüstü uyumlu düzen

## Hızlı önizleme

Bu klasörde terminal açın:

```bash
npm run serve
```

Ardından tarayıcıdan `http://localhost:4173` adresini açın.

Python komutunu doğrudan da kullanabilirsiniz:

```bash
python3 -m http.server 4173
```

## Metinleri değiştirme

Ana içerik, blog yazıları ve bağlantılar şu dosyadadır:

```text
assets/site-data.js
```

Buradan şunları değiştirebilirsiniz:

- Ana başlık ve açıklama
- Uzmanlık etiketleri
- Üç çalışma biçimi
- Kullanım alanları
- Profil metni
- LinkedIn, bülten ve site bağlantıları
- Hazır AI problem seçenekleri ve önerileri
- Blog bölümü başlığı ve açıklaması
- Blog yazılarının kategorisi, başlığı, özeti, tarihi ve bağlantısı

### Yeni blog yazısı ekleme

`siteData.blog.posts` dizisine şu yapıda bir kayıt ekleyin:

```js
{
  category: 'Kategori',
  title: 'Yazı başlığı',
  excerpt: 'Kısa açıklama',
  label: 'Ağu 3, 2026',
  url: 'https://bakigul.substack.com/p/yazi-adresi',
  featured: false
}
```

Yalnızca bir yazıda `featured: true` kullanılması önerilir. Bu yazı blog bölümünde büyük kart olarak görünür.

Blog yazıları şu anda manuel olarak yönetilir; Substack ile otomatik senkronizasyon yapılmaz.

## Tasarımı değiştirme

Renkler, defter dokuları, kart düzeni ve responsive kurallar:

```text
assets/styles.css
```

Ana sayfa yapısı ve JavaScript kapalıyken gösterilen yedek içerik:

```text
index.html
```

Etkileşim ve içerik bağlama kodu:

```text
assets/app.js
```

## Yayınlama

Site statik olduğu için klasörü doğrudan şu platformlardan birine yükleyebilirsiniz:

- Netlify Drop
- Vercel
- GitHub Pages
- Herhangi bir klasik hosting veya CDN

Build komutuna gerek yoktur. Yayın kökü `index.html` dosyasının bulunduğu klasördür.

## Gerçek AI özelliği ekleneceği zaman

İkinci sürümde `assets/app.js` içindeki hazır öneri akışı bir API endpoint'ine bağlanabilir. Kullanıcının yazdığı problem backend'e gönderilir; modelden yapılandırılmış çözüm, ihtiyaçlar ve ilk adım çıktısı alınır.

## Test

```bash
npm test
```

## İletişim formu ve Cloudflare Worker

AI check-up bölümündeki form, geliştirme ortamında `http://localhost:8787/contact`,
üretimde `https://api.bakigul.com/contact` adresine gönderilir.

Yerel Worker'ı başlatmak için ayrı bir terminalde:

```bash
npm run worker:dev
```

Worker şunları uygular:

- Yalnız izin verilen site origin'lerinden form kabulü
- Alan doğrulama ve 16 KB istek sınırı
- Honeypot spam koruması
- Cloudflare rate-limit bağlaması
- Cloudflare Email Service ile `info@bakigul.com` adresine teslimat

Cloudflare alan adı ve yayınlama adımları `worker/README.md` dosyasındadır.

## GitHub fork'una gönderme

Bu klasörü açtıktan sonra terminalde şu komutu çalıştırın:

```bash
./publish-to-github.sh
```

Script otomatik olarak:

1. `gulbaki/bakigul` reposunu klonlar.
2. `template` branch'inden `agent/claude-notebook-site` branch'ini açar.
3. Orijinal `LICENSE` dosyasını ve fork geçmişini korur.
4. Claude Notebook site dosyalarını tek commit halinde yükler.
5. Push sonrasında açılacak Pull Request bağlantısını gösterir.

GitHub kimlik doğrulaması istenirse hesabınızla giriş yapın. HTTPS kimlik doğrulaması çalışmıyorsa repo adresini SSH olarak verebilirsiniz:

```bash
REPO_URL=git@github.com:gulbaki/bakigul.git ./publish-to-github.sh
```

Branch daha önce oluşturulduysa farklı bir branch adı kullanın:

```bash
TARGET_BRANCH=agent/claude-notebook-site-v2 ./publish-to-github.sh
```

## GitHub Pages

Projede `.github/workflows/pages.yml` dosyası hazırdır. Pull Request `template` branch'ine birleştirildikten sonra:

1. Repository **Settings → Pages** bölümüne gidin.
2. **Source** olarak **GitHub Actions** seçin.
3. `Deploy static site to GitHub Pages` workflow'unu çalıştırın veya yeni bir commit gönderin.
