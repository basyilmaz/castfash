'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PricingPage() {
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
              <h1 className="wow fadeInUp" data-wow-delay=".3s">Fiyatlandırma</h1>
              <ul className="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                <li>
                  <Link href="/">Ana Sayfa</Link>
                </li>
                <li>
                  <i className="fa-regular fa-chevrons-right"></i>
                </li>
                <li>Fiyatlandırma</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section Start */}
      <section className="pricing-section fix section-padding">
        <div className="container">
          <div className="section-title text-center">
            <h6 className="wow fadeInUp">
              <img src="/aiforge/assets/img/star.png" alt="img" /> Paketlerimiz
            </h6>
            <h2 className="wow fadeInUp" data-wow-delay=".3s">
              İhtiyacınıza Uygun <br />
              <span>Esnek <b>Fiyatlandırma</b></span>
            </h2>
          </div>
          <div className="row justify-content-center">
            {/* Standard Package */}
            <div className="col-xxl-3 col-xl-4 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".2s">
              <div className="pricing-box-items">
                <div className="icon">
                  <img src="/aiforge/assets/img/icon/02.svg" alt="img" />
                </div>
                <div className="pricing-header">
                  <h3>Başlangıç</h3>
                  <p>Kişisel projeler için ideal</p>
                  <h2>$25</h2>
                </div>
                <ul className="pricing-list">
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>50 AI Model Çekimi</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>Standart Çözünürlük</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>Temel Sahneler</span>
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
                <div className="icon">
                  <img src="/aiforge/assets/img/icon/02.svg" alt="img" />
                </div>
                <div className="pricing-header">
                  <h3>Profesyonel</h3>
                  <p>Büyüyen markalar için</p>
                  <h2>$49</h2>
                </div>
                <ul className="pricing-list">
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>200 AI Model Çekimi</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>Yüksek Çözünürlük (4K)</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>Tüm Sahneler</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>Öncelikli Destek</span>
                  </li>
                </ul>
                <div className="pricing-button">
                  <Link href="/auth/register" className="theme-btn">
                    Hemen Başla <i className="fa-sharp fa-regular fa-arrow-up-right"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* Enterprise Package */}
            <div className="col-xxl-3 col-xl-4 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".6s">
              <div className="pricing-box-items">
                <div className="icon">
                  <img src="/aiforge/assets/img/icon/02.svg" alt="img" />
                </div>
                <div className="pricing-header">
                  <h3>Stüdyo</h3>
                  <p>Büyük ölçekli üretimler için</p>
                  <h2>$99</h2>
                </div>
                <ul className="pricing-list">
                  <li>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    <span>Sınırsız Çekim</span>
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
                </ul>
                <div className="pricing-button">
                  <Link href="/contact" className="theme-btn">
                    İletişime Geç <i className="fa-sharp fa-regular fa-arrow-up-right"></i>
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
