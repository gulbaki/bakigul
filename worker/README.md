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

## Yerel geliştirme

```bash
npm run worker:dev
```

Yerel simülasyonda gerçek e-posta gönderilmez; e-posta içeriği Wrangler çıktısında görünür.
Site `http://localhost:4173`, API `http://localhost:8787/contact` adresinde çalışır.

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
- Dakikada 30 istek Cloudflare rate-limit bağlaması
- Kişisel veriyi loglamayan hata kayıtları
