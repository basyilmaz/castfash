'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MarketingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      require('bootstrap/dist/js/bootstrap.bundle.min.js');
      const WOW = require('wowjs');
      new WOW.WOW({
        live: false
      }).init();
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Preloader */}
      {/* <div id="preloader" className="preloader">
          <div className="animation-preloader">
              <div className="spinner"></div>
              <div className="txt-loading">
                  <span data-text-preloader="C" className="letters-loading">C</span>
                  <span data-text-preloader="A" className="letters-loading">A</span>
                  <span data-text-preloader="S" className="letters-loading">S</span>
                  <span data-text-preloader="T" className="letters-loading">T</span>
                  <span data-text-preloader="F" className="letters-loading">F</span>
                  <span data-text-preloader="A" className="letters-loading">A</span>
                  <span data-text-preloader="S" className="letters-loading">S</span>
                  <span data-text-preloader="H" className="letters-loading">H</span>
              </div>
              <p className="text-center">Yükleniyor</p>
          </div>
      </div> */}

      {/* Offcanvas Area */}
      <div className={`fix-area ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className={`offcanvas__info ${isMobileMenuOpen ? 'show' : ''}`}>
          <div className="offcanvas__wrapper">
            <div className="offcanvas__content">
              <div className="offcanvas__top mb-5 d-flex justify-content-between align-items-center">
                <div className="offcanvas__logo">
                  <Link href="/">
                    <img src="/aiforge/assets/img/logo/white-logo.svg" alt="logo-img" />
                  </Link>
                </div>
                <div className="offcanvas__close">
                  <button onClick={toggleMobileMenu}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div className="mobile-menu fix mb-3">
                <nav>
                  <ul>
                    <li><Link href="/">Ana Sayfa</Link></li>
                    <li><Link href="/about">Hakkımızda</Link></li>
                    <li><Link href="/pricing">Fiyatlandırma</Link></li>
                    <li><Link href="/blog">Blog</Link></li>
                    <li><Link href="/contact">İletişim</Link></li>
                    <li><Link href="/auth/login">Giriş Yap</Link></li>
                    <li><Link href="/auth/register">Kayıt Ol</Link></li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`offcanvas__overlay ${isMobileMenuOpen ? 'overlay-open' : ''}`} onClick={toggleMobileMenu}></div>

      {/* Header Section */}
      <header id="header-sticky" className="header-1">
        <div className="container-fluid">
          <div className="mega-menu-wrapper">
            <div className="header-main">
              <div className="header-left">
                <div className="logo">
                  <Link href="/" className="header-logo">
                    <h2 className="text-white">Castfash</h2>
                    {/* <img src="/aiforge/assets/img/logo/white-logo.svg" alt="logo-img" /> */}
                  </Link>
                </div>
                <div className="mean__menu-wrapper">
                  <div className="main-menu">
                    <nav id="mobile-menu">
                      <ul>
                        <li>
                          <Link href="/">Ana Sayfa</Link>
                        </li>
                        <li>
                          <Link href="/about">Hakkımızda</Link>
                        </li>
                        <li>
                          <Link href="/pricing">Fiyatlandırma</Link>
                        </li>
                        <li>
                          <Link href="/blog">Blog</Link>
                        </li>
                        <li>
                          <Link href="/contact">İletişim</Link>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
              <div className="header-right d-flex justify-content-end align-items-center">
                <Link href="/auth/register" className="join-text">
                  Kayıt Ol
                </Link>
                <Link href="/auth/login" className="search-trigger search-icon">
                  <i className="fa-regular fa-user"></i>
                </Link>
                <div className="header__hamburger d-xl-block my-auto" onClick={toggleMobileMenu}>
                  <div className="sidebar__toggle">
                    <i className="fas fa-bars"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-secton hero-1 bg-cover" style={{ backgroundImage: "url('/aiforge/assets/img/hero/hero-bg-3.png')" }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="hero-content">
                <div className="color-bg">
                  <img src="/aiforge/assets/img/hero/color-bg.png" alt="img" />
                </div>
                <p className="wow fadeInUp">Yapay Zeka Destekli Moda Stüdyosu</p>
                <h1 className="wow img-custom-anim-left" data-wow-duration="1.5s" data-wow-delay="0.1s">
                  Dakikalar içinde <img src="/aiforge/assets/img/hero/radius-img.png" alt="img" />
                  <b>AI</b> <span className="text-2">moda çekimi</span>
                </h1>
                <div className="hero-button">
                  <Link href="/auth/register" className="theme-btn wow fadeInUp" data-wow-delay="0.3s">
                    Hemen Başla <i className="fa-sharp fa-regular fa-arrow-up-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-image img-custom-anim-left bg-cover" style={{ backgroundImage: "url('/aiforge/assets/img/hero/hero-1.png')" }}></div>
      </section>

      {/* About Section */}
      <section className="about-section section-padding section-bg fix">
        <div className="bg-shape">
          <img src="/aiforge/assets/img/about/bg-shape.png" alt="shape-img" />
        </div>
        <div className="color-bg">
          <img src="/aiforge/assets/img/about/color-bg-shape.png" alt="img" />
        </div>
        <div className="color-bg-2">
          <img src="/aiforge/assets/img/about/color-bg-shape-2.png" alt="img" />
        </div>
        <div className="container">
          <div className="section-title ml-200">
            <h6 className="wow fadeInUp">
              <img src="/aiforge/assets/img/star.png" alt="img" /> Biz Kimiz
            </h6>
            <h2 className="wow fadeInUp" data-wow-delay=".3s">
              AI gücünü keşfedin <br />
              <span>& <b>katalog</b> deneyimini yenileyin</span>
            </h2>
          </div>
          <div className="about-wrapper mt-4 mt-md-0">
            <ul className="nav">
              <li className="nav-item wow fadeInUp" data-wow-delay=".3s">
                <a href="#Mission" data-bs-toggle="tab" className="nav-link active">
                  Misyonumuz
                </a>
              </li>
              <li className="nav-item wow fadeInUp" data-wow-delay=".5s">
                <a href="#Vision" data-bs-toggle="tab" className="nav-link">
                  Vizyonumuz
                </a>
              </li>
              <li className="nav-item wow fadeInUp" data-wow-delay=".5s">
                <a href="#Feature" data-bs-toggle="tab" className="nav-link">
                  Özellikler
                </a>
              </li>
            </ul>
            <div className="tab-content">
              <div id="Mission" className="tab-pane fade show active">
                <div className="about-items">
                  <div className="about-content">
                    <p>
                      Castfash olarak misyonumuz, her ölçekteki moda markasının profesyonel, yüksek kaliteli katalog çekimlerine saniyeler içinde, düşük maliyetle ulaşmasını sağlamaktır.
                    </p>
                    <ul className="list-items">
                      <li>
                        <i className="fas fa-check-circle text-warning me-2"></i>
                        <span>Maliyet Avantajı</span>
                      </li>
                      <li>
                        <i className="fas fa-check-circle text-warning me-2"></i>
                        <span>Hızlı Üretim</span>
                      </li>
                      <li>
                        <i className="fas fa-check-circle text-warning me-2"></i>
                        <span>Sınırsız Yaratıcılık</span>
                      </li>
                    </ul>
                    <Link href="/auth/register" className="theme-btn">Keşfetmeye Başla <i className="fa-sharp fa-regular fa-arrow-up-right"></i></Link>
                  </div>
                  <div className="about-image">
                    <img src="/aiforge/assets/img/about/01.jpg" alt="img" />
                  </div>
                </div>
              </div>
              <div id="Vision" className="tab-pane fade">
                <div className="about-items">
                  <div className="about-content">
                    <p>
                      Moda fotoğrafçılığının geleceğini yapay zeka ile yeniden şekillendiriyor, fiziksel sınırları ortadan kaldırarak markaların global standartlarda içerik üretmesine öncülük ediyoruz.
                    </p>
                    <ul className="list-items">
                      <li>
                        <i className="fas fa-check-circle text-warning me-2"></i>
                        <span>Global Standartlar</span>
                      </li>
                      <li>
                        <i className="fas fa-check-circle text-warning me-2"></i>
                        <span>Sürdürülebilir Moda</span>
                      </li>
                    </ul>
                    <Link href="/auth/register" className="theme-btn">Bize Katıl <i className="fa-sharp fa-regular fa-arrow-up-right"></i></Link>
                  </div>
                  <div className="about-image">
                    <img src="/aiforge/assets/img/about/01.jpg" alt="img" />
                  </div>
                </div>
              </div>
              <div id="Feature" className="tab-pane fade">
                <div className="about-items">
                  <div className="about-content">
                    <p>
                      Kendi modellerinizi oluşturun, sanal stüdyolarda çekim yapın ve ürünlerinizi en iyi şekilde sergileyin. Hepsi tek bir platformda.
                    </p>
                    <ul className="list-items">
                      <li>
                        <i className="fas fa-check-circle text-warning me-2"></i>
                        <span>Özelleştirilebilir Modeller</span>
                      </li>
                      <li>
                        <i className="fas fa-check-circle text-warning me-2"></i>
                        <span>Sanal Sahneler</span>
                      </li>
                    </ul>
                    <Link href="/auth/register" className="theme-btn">Özellikleri İncele <i className="fa-sharp fa-regular fa-arrow-up-right"></i></Link>
                  </div>
                  <div className="about-image">
                    <img src="/aiforge/assets/img/about/01.jpg" alt="img" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Counter Section */}
        <div className="counter-section section-padding pb-0">
          <div className="container">
            <div className="counter-wrapper">
              <div className="counter-items wow fadeInUp" data-wow-delay=".3s">
                <div className="icon">
                  <img src="/aiforge/assets/img/icon/01.svg" alt="img" />
                </div>
                <div className="content">
                  <h2><span className="count">1000</span>+</h2>
                  <p>Oluşturulan Katalog</p>
                </div>
              </div>
              <div className="counter-items wow fadeInUp" data-wow-delay=".5s">
                <div className="icon">
                  <img src="/aiforge/assets/img/icon/01.svg" alt="img" />
                </div>
                <div className="content">
                  <h2><span className="count">500</span>+</h2>
                  <p>Mutlu Marka</p>
                </div>
              </div>
              <div className="counter-items wow fadeInUp" data-wow-delay=".7s">
                <div className="icon">
                  <img src="/aiforge/assets/img/icon/01.svg" alt="img" />
                </div>
                <div className="content">
                  <h2><span className="count">50</span>+</h2>
                  <p>AI Model</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-works-section fix section-padding">
        <div className="container">
          <div className="section-title text-center">
            <h6 className="wow fadeInUp">
              <img src="/aiforge/assets/img/star.png" alt="img" /> Nasıl Çalışır
            </h6>
            <h2 className="wow fadeInUp" data-wow-delay=".3s">
              3 Basit Adımda <br />
              <span>Profesyonel <b>Katalog</b> Görselleri</span>
            </h2>
          </div>
          <div className="row mt-5">
            {/* Step 1 */}
            <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".2s">
              <div className="how-works-item text-center">
                <div className="step-number">1</div>
                <div className="icon-box mb-4">
                  <i className="fa-solid fa-upload" style={{ fontSize: '48px', color: '#ffc107' }}></i>
                </div>
                <h3>Ürün Yükle</h3>
                <p>Kıyafet veya ürün fotoğrafınızı yükleyin. Ön ve arka görsel desteği mevcuttur.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".4s">
              <div className="how-works-item text-center">
                <div className="step-number">2</div>
                <div className="icon-box mb-4">
                  <i className="fa-solid fa-user-tie" style={{ fontSize: '48px', color: '#ffc107' }}></i>
                </div>
                <h3>Model ve Sahne Seç</h3>
                <p>Kendi AI modelinizi oluşturun veya hazır modeller arasından seçin. Sahne & arka plan belirleyin.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".6s">
              <div className="how-works-item text-center">
                <div className="step-number">3</div>
                <div className="icon-box mb-4">
                  <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: '48px', color: '#ffc107' }}></i>
                </div>
                <h3>Görsel Oluştur</h3>
                <p>AI teknolojimiz saniyeler içinde profesyonel katalog görseli üretir. İndir ve kullan!</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-5 wow fadeInUp" data-wow-delay=".8s">
            <Link href="/auth/register" className="theme-btn">
              Ücretsiz Deneyin <i className="fa-sharp fa-regular fa-arrow-up-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Service Section */}
      <section className="service-section fix section-padding">
        <div className="container">
          <div className="section-title text-center">
            <h6 className="wow fadeInUp">
              <img src="/aiforge/assets/img/star.png" alt="img" />
              Hizmetlerimiz
            </h6>
            <h2 className="wow fadeInUp" data-wow-delay=".3s">
              Özel AI Destekli <br />
              <span>Moda & <b>Katalog</b> Çözümleri</span>
            </h2>
          </div>
          <div className="row">
            <div className="col-xl-6 wow fadeInUp" data-wow-delay=".2s">
              <div className="service-box-items">
                <div className="service-image">
                  <img src="/aiforge/assets/img/service/01.jpg" alt="img" />
                </div>
                <div className="service-content">
                  <h3>Model Oluşturma</h3>
                  <p>Markanızın kimliğine uygun, özelleştirilebilir sanal modeller yaratın.</p>
                  <Link href="/auth/register" className="link-btn">Detaylar <i className="fa-sharp fa-regular fa-arrow-up-right"></i></Link>
                </div>
              </div>
            </div>
            <div className="col-xl-6 wow fadeInUp" data-wow-delay=".4s">
              <div className="service-box-items">
                <div className="service-image">
                  <img src="/aiforge/assets/img/service/02.jpg" alt="img" />
                </div>
                <div className="service-content">
                  <h3>Sahne Tasarımı</h3>
                  <p>Ürünlerinizi stüdyo, dış mekan veya soyut sahnelerde sergileyin.</p>
                  <Link href="/auth/register" className="link-btn">Detaylar <i className="fa-sharp fa-regular fa-arrow-up-right"></i></Link>
                </div>
              </div>
            </div>
            <div className="col-xl-6 wow fadeInUp" data-wow-delay=".6s">
              <div className="service-box-items">
                <div className="service-image">
                  <img src="/aiforge/assets/img/service/03.jpg" alt="img" />
                </div>
                <div className="service-content">
                  <h3>Batch Üretim</h3>
                  <p>Yüzlerce ürün fotoğrafını dakikalar içinde toplu olarak işleyin.</p>
                  <Link href="/auth/register" className="link-btn">Detaylar <i className="fa-sharp fa-regular fa-arrow-up-right"></i></Link>
                </div>
              </div>
            </div>
            <div className="col-xl-6 wow fadeInUp" data-wow-delay=".8s">
              <div className="service-box-items mb-0">
                <div className="service-image">
                  <img src="/aiforge/assets/img/service/04.jpg" alt="img" />
                </div>
                <div className="service-content">
                  <h3>Kredi Takibi</h3>
                  <p>Esnek kredi sistemi ile harcamalarınızı kontrol altında tutun.</p>
                  <Link href="/auth/register" className="link-btn">Detaylar <i className="fa-sharp fa-regular fa-arrow-up-right"></i></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section fix section-padding section-bg">
        <div className="container">
          <div className="section-title text-center">
            <h6 className="wow fadeInUp">
              <img src="/aiforge/assets/img/star.png" alt="img" /> Fiyatlandırma
            </h6>
            <h2 className="wow fadeInUp" data-wow-delay=".3s">
              İhtiyacınıza Uygun <br />
              <span>Esnek <b>Paketler</b></span>
            </h2>
          </div>
          <div className="row justify-content-center">
            {/* Starter Package */}
            <div className="col-xxl-3 col-xl-4 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".2s">
              <div className="pricing-box-items">
                <div className="icon">
                  <img src="/aiforge/assets/img/icon/02.svg" alt="img" />
                </div>
                <div className="pricing-header">
                  <h3>Başlangıç</h3>
                  <p>Kişisel projeler için</p>
                  <h2>$25<span>/ay</span></h2>
                </div>
                <ul className="pricing-list">
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>50 AI Görsel Üretimi</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>Standart Çözünürlük</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>Temel Sahneler</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>E-posta Destek</span>
                  </li>
                </ul>
                <div className="pricing-button">
                  <Link href="/auth/register" className="theme-btn">
                    Hemen Başla <i className="fa-sharp fa-regular fa-arrow-up-right"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* Professional Package */}
            <div className="col-xxl-3 col-xl-4 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".4s">
              <div className="pricing-box-items active">
                <div className="popular-tag">En Popüler</div>
                <div className="icon">
                  <img src="/aiforge/assets/img/icon/02.svg" alt="img" />
                </div>
                <div className="pricing-header">
                  <h3>Profesyonel</h3>
                  <p>Büyüyen markalar için</p>
                  <h2>$49<span>/ay</span></h2>
                </div>
                <ul className="pricing-list">
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>200 AI Görsel Üretimi</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>4K Yüksek Çözünürlük</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>Tüm Premium Sahneler</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>Öncelikli Destek</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>Batch İşleme</span>
                  </li>
                </ul>
                <div className="pricing-button">
                  <Link href="/auth/register" className="theme-btn">
                    Hemen Başla <i className="fa-sharp fa-regular fa-arrow-up-right"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* Studio Package */}
            <div className="col-xxl-3 col-xl-4 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".6s">
              <div className="pricing-box-items">
                <div className="icon">
                  <img src="/aiforge/assets/img/icon/02.svg" alt="img" />
                </div>
                <div className="pricing-header">
                  <h3>Stüdyo</h3>
                  <p>Kurumsal markalar için</p>
                  <h2>$99<span>/ay</span></h2>
                </div>
                <ul className="pricing-list">
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>600+ AI Görsel Üretimi</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>Ultra HD Çözünürlük</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>Özel Model Eğitimi</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>API Erişimi</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>Özel Hesap Yöneticisi</span>
                  </li>
                </ul>
                <div className="pricing-button">
                  <Link href="/contact" className="theme-btn">
                    İletişime Geç <i className="fa-sharp fa-regular fa-arrow-up-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-5 wow fadeInUp" data-wow-delay=".8s">
            <p className="text-muted">Tüm planlar 14 gün ücretsiz deneme içerir. Kredi kartı gerekmez.</p>
            <Link href="/pricing" className="link-btn mt-3">
              Tüm özellikleri karşılaştır <i className="fa-sharp fa-regular fa-arrow-up-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section section-padding pt-0">
        <div className="container">
          <div className="cta-wrapper bg-cover" style={{ backgroundImage: "url('/aiforge/assets/img/cta-bg.jpg')" }}>
            <div className="cta-content text-center">
              <h2 className="wow fadeInUp">Moda Çekimlerinizi <br /> Dijitalleştirin</h2>
              <p className="wow fadeInUp" data-wow-delay=".3s">Hemen ücretsiz üye olun ve ilk AI kataloğunuzu oluşturun.</p>
              <Link href="/auth/register" className="theme-btn wow fadeInUp" data-wow-delay=".5s">
                Ücretsiz Dene <i className="fa-sharp fa-regular fa-arrow-up-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer-section footer-bg">
        <div className="container">
          <div className="footer-widgets-wrapper">
            <div className="row">
              <div className="col-xl-4 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".2s">
                <div className="single-footer-widget">
                  <div className="footer-content">
                    <h3 className="mb-3">Castfash</h3>
                    <p>AI destekli moda katalog platformu ile markanızı geleceğe taşıyın.</p>
                    <div className="social-icon d-flex align-items-center mt-4">
                      <a href="#"><i className="fab fa-facebook-f"></i></a>
                      <a href="#"><i className="fab fa-twitter"></i></a>
                      <a href="#"><i className="fab fa-instagram"></i></a>
                      <a href="#"><i className="fab fa-linkedin-in"></i></a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-4 col-md-6 ps-lg-5 wow fadeInUp" data-wow-delay=".4s">
                <div className="single-footer-widget">
                  <div className="widget-head">
                    <h3>Hızlı Linkler</h3>
                  </div>
                  <ul className="list-items">
                    <li><Link href="/about">Hakkımızda</Link></li>
                    <li><Link href="/contact">İletişim</Link></li>
                    <li><Link href="/blog">Blog</Link></li>
                    <li><Link href="/auth/login">Giriş Yap</Link></li>
                  </ul>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-6 ps-lg-5 wow fadeInUp" data-wow-delay=".6s">
                <div className="single-footer-widget">
                  <div className="widget-head">
                    <h3>Hizmetler</h3>
                  </div>
                  <ul className="list-items">
                    <li><Link href="#">Model Oluşturma</Link></li>
                    <li><Link href="#">Sahne Tasarımı</Link></li>
                    <li><Link href="#">Toplu İşlem</Link></li>
                    <li><Link href="#">API Entegrasyonu</Link></li>
                  </ul>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-6 ps-lg-3 wow fadeInUp" data-wow-delay=".8s">
                <div className="single-footer-widget">
                  <div className="widget-head">
                    <h3>İletişim</h3>
                  </div>
                  <div className="footer-content">
                    <p>info@castfash.com</p>
                    <p>+90 555 123 45 67</p>
                    <p>İstanbul, Türkiye</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <div className="footer-bottom-wrapper d-flex align-items-center justify-content-between">
              <p className="wow fadeInLeft" data-wow-delay=".3s">
                © Copyright 2025 <Link href="/">Castfash</Link> All Rights Reserved.
              </p>
              <ul className="footer-menu wow fadeInRight" data-wow-delay=".5s">
                <li><Link href="#">Terms & Condition</Link></li>
                <li><Link href="#">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
