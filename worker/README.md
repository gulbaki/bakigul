# Cloudflare iletişim API'si

Bu Worker, `POST /contact` isteklerini doğrular ve Cloudflare Email Service üzerinden
`website@bakigul.com` adresinden `info@bakigul.com` yönlendirmesinin arkasındaki doğrulanmış
posta kutusuna gönderir.

## Cloudflare hazırlığı

1. Cloudflare Dashboard → **Compute → Email Service → Email Sending** bölümünü açın.
2. `bakigul.com` alan adını onboard edin ve Cloudflare'ın oluşturduğu SPF, DKIM ve bounce kayıtlarını onaylayın.
3. `info@bakigul.com` adresini doğrulanmış gerçek posta kutusuna yönlendiren aktif bir Email Routing kuralı oluşturun.
4. Cloudflare CLI oturumunu açın:

   ```bash
   npx wrangler@latest login
   ```

5. Worker'ın doğrulanmış hedef posta kutusunu bir Cloudflare secret olarak tanımlayın:

   ```bash
   npx wrangler@latest secret put CONTACT_DELIVERY_TO --config worker/wrangler.jsonc
   ```

## Turnstile bot koruması

1. Cloudflare Dashboard → **Turnstile** bölümünde `Baki iletişim formu` adında, **Managed** modda bir widget oluşturun.
2. İzin verilen alan adlarına `bakigul.com`, `www.bakigul.com` ve GitHub Pages yedeği kullanılacaksa `gulbaki.github.io` ekleyin.
3. Herkese açık **site key** değerini `assets/site-data.js` içindeki `contact.turnstileSiteKey` alanına yazın.
4. **Secret key** değerini kaynak koduna yazmadan Worker secret'ı olarak kaydedin:

   ```bash
   npx wrangler@latest secret put TURNSTILE_SECRET_KEY --config worker/wrangler.jsonc
   ```

Worker, Turnstile tokenını Cloudflare Siteverify API üzerinden doğrular; doğrulama, alan adı veya
`contact_form` action değeri eşleşmezse e-posta göndermez.

## Yerel geliştirme

```bash
npm run worker:dev
```

Yerel simülasyonda gerçek e-posta gönderilmez; e-posta içeriği Wrangler çıktısında görünür.
Site `http://localhost:4173`, API `http://localhost:8787/contact` adresinde çalışır.

Yerel geliştirmede Cloudflare'ın resmi test anahtarını kullanmak için, git tarafından yok sayılan
`worker/.dev.vars` dosyasına aşağıdaki satırı ekleyin:

```text
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

Ön yüz localhost üzerinde resmi test site key'ini otomatik kullanır. Test anahtarları üretimde
kullanılmamalıdır.

## Yayınlama

```bash
npm run worker:deploy
```

`worker/wrangler.jsonc` dosyası Worker'ı `api.bakigul.com` özel alan adına bağlar. Gönderici
`website@bakigul.com` göndericisi ve doğrulanmış teslimat adresiyle sınırlandırılır. Cloudflare binding
allowlist'i doğrulanmış adresi açıkça tanımlar; Worker'ın kullandığı hedef değer ayrıca
`CONTACT_DELIVERY_TO` Cloudflare secret'ında tutulur.

## Güvenlik

- İzin verilen origin listesi
- 16 KB istek sınırı
- Alan uzunluğu ve e-posta doğrulaması
- Honeypot bot alanı
- Cloudflare Turnstile ve sunucu taraflı Siteverify doğrulaması
- Dakikada 30 istek Cloudflare rate-limit bağlaması
- Kişisel veriyi loglamayan hata kayıtları
