export const problemPresets = [
  {
    id: 'baslangic',
    label: 'Nereden başlayacağımızı bilmiyoruz.',
    engagement: 'Yapay Zeka Yol Haritası',
    examines:
      'Süreçleri, veri hazırlığını ve iş etkisini birlikte inceler; fikirleri uygulanabilirlik ve değer açısından sıralarız.',
    firstStep:
      '45 dakikalık bir keşif görüşmesiyle üç öncelikli kullanım alanı ve ilk deneme kapsamı çıkarılır.'
  },
  {
    id: 'rag-agent',
    label: 'RAG veya agent sistemimiz istediğimiz gibi çalışmıyor.',
    engagement: 'RAG & Agent Architecture Review',
    examines:
      'Retrieval kalitesi, veri akışı, agent araçları, maliyet, güvenlik, ölçüm ve insan onayı katmanları incelenir.',
    firstStep:
      'Mevcut akış üzerinden ölçülebilir bir hata listesi ve öncelikli iyileştirme planı hazırlanır.'
  },
  {
    id: 'ekip',
    label: 'Ekibimiz Yapay Zeka araçlarından yeterince verim alamıyor.',
    engagement: 'Kurumsal Yapay Zeka Workshop',
    examines:
      'Ekibin gerçek görevleri, kullandığı araçlar, güvenlik sınırları ve tekrar eden iş akışları analiz edilir.',
    firstStep:
      'Ekibe özel üç iş akışı seçilir; workshop sırasında çalışan prompt ve otomasyon örnekleri oluşturulur.'
  }
];

export const siteData = {
  brand: 'Baki Gül',
  eyebrow: 'Yapay Zeka danışmanlığı',
  hero: {
    titleLead: 'Yapay zeka fikirlerini',
    titleEmphasis: 'çalışan iş akışlarına',
    titleTail: 'dönüştürüyorum.',
    description:
      'Yapay zeka stratejisi, RAG, agent sistemleri ve ekip eğitimleri. Önce doğru problemi seçer, sonra çalışan bir ilk adım çıkarırız.',
    cta: 'Probleminizi konuşalım',
    tags: ['Yapay Zeka Stratejisi', 'RAG', 'AI Agent', 'Otomasyon', 'Ekip Eğitimi']
  },
  services: [
    {
      number: '01',
      title: 'Yapay Zeka Yol Haritası',
      description: 'Fikirleri iş etkisi, veri hazırlığı, maliyet ve risk açısından önceliklendirir.'
    },
    {
      number: '02',
      title: 'RAG & Agent Review',
      description: 'Mevcut mimaride doğruluk, güvenlik, maliyet ve ölçeklenebilirlik problemlerini bulur.'
    },
    {
      number: '03',
      title: 'Kurumsal Yapay Zeka Workshop',
      description: 'Ekibin günlük işleri üzerinden uygulanabilir Yapay Zeka çalışma biçimleri oluşturur.'
    }
  ],
  useCases: [
    'Kurumsal doküman asistanı',
    "Müşteri e-postası agent'ı",
    'Hasar ve operasyon dosyası asistanı',
    'Teklif ve rapor otomasyonu',
    'Sözleşme ve doküman inceleme asistanı',
    'Satış görüşmesi özeti ve CRM güncelleme akışı'
  ],
  credibility: {
    title: 'Teknik tarafı bilen, işi de anlayan bir danışmanlık.',
    description:
      'Yazılım mühendisliği, LLM uygulamaları ve AI çözüm mimarisi geçmişini; şirketlerin gerçek süreçlerine uygulanabilir çözümlere dönüştürüyorum.',
    linkedinPrompt: 'Benim hakkımda daha fazlasını merak ediyorsanız,',
    linkedinCta: 'LinkedIn profilime göz atın',
    signals: [
      'Senior Software Engineer geçmişi',
      'Generative AI ve LLM uygulamaları',
      'Baki ile AI içerik topluluğu'
    ]
  },

  blog: {
    title: 'Baki ile AI',
    description: 'AI agent’ları, Claude/ChatGPT workflow’larını ve geliştirici verimliliğini herkesin anlayacağı dille anlatıyorum.',
    posts: [
      {
        category: 'ChatGPT Work',
        title: 'CLAUDE SİLMELİSİN.',
        excerpt: 'ChatGPT Work’ü bir cevap ekranı değil, dosyalar ve çıktılarla işi ilerleten bir çalışma alanı olarak kullanma rehberi.',
        label: 'Tem 15, 2026',
        url: 'https://bakigul.substack.com/p/claude-silmelisin',
        featured: true
      },
      {
        category: 'Agent Workflow',
        title: 'Fable 5’i Yanlış Kullanıyorsun: Boşa Token Yakan Workflow Yerine Bunu Kur',
        excerpt: 'Claude Code, Codex ve farklı model rollerini tek bir orkestrasyon akışında daha verimli kullanmanın pratik yolu.',
        label: 'Tem 3, 2026',
        url: 'https://bakigul.substack.com/p/fable-5i-yanls-kullanyorsun-bosa',
        featured: false
      },
      {
        category: 'Claude Cowork',
        title: 'Claude Cowork’u Kurmadan Yapay Zeka Kullanıyorum Deme',
        excerpt: 'Claude ile sohbet etmekten, dosyalar ve klasörlerle işi baştan sona yürütmeye geçmek için kurulum ve çalışma düzeni.',
        label: 'Haz 28, 2026',
        url: 'https://bakigul.substack.com/p/claude-coworku-kurmadan-yapay-zeka',
        featured: false
      },
      {
        category: 'Claude 101',
        title: 'Claude 101: Hiç Kullanmadıysan Buradan Başla',
        excerpt: 'Claude’u ilk kez kullanacaklar için dosyalar, Projects, Artifacts, Skills, Connectors, Research, Cowork ve Code rehberi.',
        label: 'Haz 27, 2026',
        url: 'https://bakigul.substack.com/p/claude-101-hic-kullanmadysan-buradan',
        featured: false
      }
    ]
  },
  contact: {
    title: 'Bir chatbot daha yapmadan önce doğru problemi seçelim.',
    description: 'Mevcut durumunuzu ve en mantıklı ilk adımı kısa bir görüşmede konuşalım.',
    endpoint: 'https://api.bakigul.com/contact',
    turnstileSiteKey: '0x4AAAAAAEIMknha1Q_PGydh'
  },
  links: {
    contact: 'https://www.linkedin.com/in/baki-gul/',
    linkedin: 'https://www.linkedin.com/in/baki-gul/',
    newsletter: 'https://bakigul.substack.com/',
    website: 'https://bakigul.com/'
  }
};
