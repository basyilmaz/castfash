'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const WOW = require('wowjs');
      new WOW.WOW({
        live: false
      }).init();
    }
  }, []);

  return (
    <>
      {/* Breadcrumb Section Start */}
      <div className="breadcrumb-wrapper bg-cover" style={{ backgroundImage: "url('/aiforge/assets/img/breadcrumb.jpg')" }}>
        <div className="container">
          <div className="page-heading">
            <div className="page-header-left">
              <h1 className="wow fadeInUp" data-wow-delay=".3s">Hakkımızda</h1>
              <ul className="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                <li>
                  <Link href="/">Ana Sayfa</Link>
                </li>
                <li>
                  <i className="fa-regular fa-chevrons-right"></i>
                </li>
                <li>Hakkımızda</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* About Section Start */}
      <section className="about-section section-padding section-bg fix">
        <div className="container">
          <div className="about-wrapper">
            <div className="row">
              <div className="col-lg-6 wow fadeInUp" data-wow-delay=".3s">
                <div className="about-image">
                  <img src="/aiforge/assets/img/about/01.jpg" alt="img" />
                </div>
              </div>
              <div className="col-lg-6 wow fadeInUp" data-wow-delay=".5s">
                <div className="about-content">
                  <div className="section-title">
                    <h6><img src="/aiforge/assets/img/star.png" alt="img" /> Biz Kimiz</h6>
                    <h2>Moda Dünyasını <br /> <span>AI ile Dönüştürüyoruz</span></h2>
                  </div>
                  <p className="mt-3 mt-md-0">
                    Castfash, moda markalarının görsel içerik üretim süreçlerini kökten değiştirmek için yola çıktı. Geleneksel fotoğraf çekimlerinin yüksek maliyetlerini, lojistik zorluklarını ve zaman kayıplarını ortadan kaldırıyoruz.
                  </p>
                  <p className="mt-3">
                    Yapay zeka teknolojimiz sayesinde, markalar kendi sanal modellerini oluşturabilir, ürünlerini istedikleri sahnede sergileyebilir ve dakikalar içinde profesyonel kataloglar hazırlayabilir.
                  </p>
                  <ul className="list-items mt-3">
                    <li>
                      <i className="fa-solid fa-check text-success me-2"></i>
                      <span>Yenilikçi Teknoloji</span>
                    </li>
                    <li>
                      <i className="fa-solid fa-check text-success me-2"></i>
                      <span>Sürdürülebilir Moda</span>
                    </li>
                    <li>
                      <i className="fa-solid fa-check text-success me-2"></i>
                      <span>Global Vizyon</span>
                    </li>
                  </ul>
                  <Link href="/contact" className="theme-btn mt-4">
                    Bize Ulaşın <i className="fa-sharp fa-regular fa-arrow-up-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
