# 🏆 Süper Lig Şampiyonluk Simülatörü

Bu proje, Trendyol Süper Lig'in son haftalarındaki kıyasıya şampiyonluk yarışını kendi tahminlerinizle simüle etmenize olanak tanıyan, modern, yüksek performanslı ve tamamen interaktif bir **Şampiyonluk Hesaplama Uygulamasıdır**. 

Canlı puan durumunu takip ederek, Galatasaray, Fenerbahçe, Trabzonspor ve Beşiktaş'ın kalan maçlarındaki (hafta hafta) senaryolarına göre kimin şampiyon olacağını matematiksel olarak anında hesaplayabilirsiniz.

## ✨ Öne Çıkan Özellikler

* **Canlı Puan Hesaplama:** Yaptığınız "Kazanır, Berabere, Kaybeder" seçimlerine göre takımların puanları anında hesaplanır ve puan durumu tablosu anlık (dinamik) olarak sıralanır.
* **Akıllı Derbi (Linked Match) Sistemi:** Fikstürdeki iki takımın birbiriyle oynadığı derbilerde sonuçları otomatik eşitler. Örneğin; Galatasaray - Fenerbahçe maçında Galatasaray "Kazanır" işaretlendiğinde, Fenerbahçe tarafındaki aynı maç otomatik olarak "Kaybeder" olarak güncellenir.
* **Kompakt ve Zengin Arayüz:** Modern spor uygulamalarından ilham alan "Slate Dark Mode" tasarımı. Gereksiz panellerden arındırılmış tam ekran sığdırılabilir yapısıyla veri ve istatistik odaklı mükemmel bir UI/UX deneyimi sunar.
* **Akıllı Liderlik (Mini-Leaderboard):** Sayfa aşağı kaydırıldığında ve ana tablo gözden kaybolduğunda, tıpkı canlı skor uygulamalarındaki gibi sadece takibini yaptığınız ilk iki takımı (şampiyonluk yarışı) gösteren, animasyonlu yapışkan bir mini çubuk tependen iner.
* **Neon Çift Renkli Göstergeler:** Geleneksel düz emojiler yerine, takımların ana formalarına estetik bir gönderme yapan çift renkli (Örn: Sarı-Kırmızı, Sarı-Lacivert) ve parlak LED görünümlü özel tasarım noktalar (Team Dots) kullanılmıştır.
* **Local Storage ile Kayıt:** Tarayıcınızı kapatsanız, sekmeyi yenileseniz veya bilgisayarınızı kapatsanız bile, daha önceden yapmış olduğunuz tüm tahmin verilerini tarayıcı önbelleğinde saklar ve verilerinizi kaybetmenizi önler.

## ⚡️ Teknik Altyapı ve Performans

Proje, herhangi bir framework (React, Vue vb.) kullanılmadan, tamamen **Vanilla Javascript, HTML5 ve CSS3** ile profesyonel bir kod mimarisi kurularak geliştirilmiştir. 

Performans açısından bir web uygulamasının sahip olması gereken ciddi optimizasyonlara sahiptir:
* **Scroll Layout Thrashing Engellemesi:** Kaydırma (Scroll) dinleyicileri direkt olarak tarayıcının doğal saniye tabanlı çizim döngüsüne (`requestAnimationFrame`) entegre edilerek, ekran kartı-işlemci darboğazı (bottleneck) engellenmiş; mobilde kusursuz performans sağlanmıştır.
* **I/O Debouncing (Asenkron Optimizasyon):** Kullanıcının hızlı hızlı yaptığı sonuç tahminlerinin tarayıcı hafızasına (`localStorage`) aşırı yüklenmesini önlemek için veriler **300ms gecikmeli** tek bir kerede yazılır, böylece kilitlenmelerin ve senkron beklemelerin önüne geçilir.
* **DOM Caching (Önbellek):** Saniyede onlarca kez çalışan okuma işlemleri, döngünün (event loop) dışına çekilerek sadece tek seferlik tanımlanmış (Cached DOM Objects) öğeler üzerinden okunur.

## 🚀 Kurulum ve Kullanım

Bu projeyi bilgisayarınızda çalıştırmak için ekstra hiçbir sunucuya veya bağımlılığa (node_modules vb.) ihtiyacınız yoktur.

1. Depoyu klonlayın veya indirin.
2. `index.html` dosyasına çift tıklayarak modern bir tarayıcıda (Chrome, Safari, Edge vb.) açın.
3. Veya doğrudan Github sayfaları üzerinden canlı olarak yayınlanan linkinizle test edin.

### Dosya Yapısı
* `index.html` : Sitenin semantik genel web şablonu ve kompakt grid inşası.
* `style.css` : Slate Dark Mode arayüzü, flexbox sistemleri ve animasyonlar.
* `script.js` : Olay yöneticileri, derbi senkronizasyon sistemi, DOM yönetimleri ve state (durum) manipülasyonu.
* `OPTIMIZATIONS.md` : Projenin yapısal ve performans açısından analizlerini içeren bir mühendislik dökümanıdır.

## 💻 Geliştirici(ler)
- **BlitzHan** - Fikir, Tasarım ve Kodlama
