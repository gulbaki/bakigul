# Cloudflare iletişim API'si

Bu Worker, `POST /contact` isteklerini doğrular ve Cloudflare Email Service üzerinden
`website@bakigul.com` adresinden `info@bakigul.com` adresine gönderir.

## Cloudflare hazırlığı

1. Cloudflare Dashboard → **Compute → Email Service → Email Sending** bölümünü açın.
2. `bakigul.com` alan adını onboard edin ve Cloudflare'ın oluşturduğu SPF, DKIM ve bounce kayıtlarını onaylayın.
3. `info@bakigul.com` adresinin çalışan bir posta kutusu veya aktif bir Email Routing adresi olduğundan emin olun.
4. Cloudflare CLI oturumunu açın:

   ```bash
   npx wrangler@latest login
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

`worker/wrangler.jsonc` dosyası Worker'ı `api.bakigul.com` özel alan adına bağlar. Gönderim
bağlaması yalnızca `website@bakigul.com` → `info@bakigul.com` yönüne izin verir.

## Güvenlik

- İzin verilen origin listesi
- 16 KB istek sınırı
- Alan uzunluğu ve e-posta doğrulaması
- Honeypot bot alanı
- Dakikada 30 istek Cloudflare rate-limit bağlaması
- Kişisel veriyi loglamayan hata kayıtları
