'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ContactPage() {
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
              <h1 className="wow fadeInUp" data-wow-delay=".3s">İletişim</h1>
              <ul className="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                <li>
                  <Link href="/">Ana Sayfa</Link>
                </li>
                <li>
                  <i className="fa-regular fa-chevrons-right"></i>
                </li>
                <li>İletişim</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section Start */}
      <section className="contact-section section-padding">
        <div className="container">
          <div className="contact-wrapper">
            <div className="row">
              <div className="col-lg-6 wow fadeInUp" data-wow-delay=".3s">
                <div className="contact-content">
                  <div className="section-title">
                    <h6><img src="/aiforge/assets/img/star.png" alt="img" /> İletişime Geçin</h6>
                    <h2>Sorularınız mı var? <br /> <span>Bize Yazın</span></h2>
                  </div>
                  <p className="mt-3 mt-md-0">
                    Castfash platformu hakkında daha fazla bilgi almak, kurumsal çözümlerimizi öğrenmek veya işbirliği yapmak için bizimle iletişime geçebilirsiniz.
                  </p>
                  <div className="contact-info-area mt-4">
                    <div className="contact-info-items mb-4">
                      <div className="icon">
                        <i className="fa-solid fa-envelope"></i>
                      </div>
                      <div className="content">
                        <h3>Email</h3>
                        <p>info@castfash.com</p>
                      </div>
                    </div>
                    <div className="contact-info-items mb-4">
                      <div className="icon">
                        <i className="fa-solid fa-phone"></i>
                      </div>
                      <div className="content">
                        <h3>Telefon</h3>
                        <p>+90 555 123 45 67</p>
                      </div>
                    </div>
                    <div className="contact-info-items">
                      <div className="icon">
                        <i className="fa-solid fa-location-dot"></i>
                      </div>
                      <div className="content">
                        <h3>Adres</h3>
                        <p>Maslak Mah. Büyükdere Cad. No:1, İstanbul</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 wow fadeInUp" data-wow-delay=".5s">
                <div className="contact-form-items">
                  <form action="#">
                    <div className="row g-4">
                      <div className="col-lg-6">
                        <div className="form-clt">
                          <input type="text" name="name" id="name" placeholder="Adınız Soyadınız" />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="form-clt">
                          <input type="text" name="email" id="email" placeholder="Email Adresiniz" />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="form-clt">
                          <input type="text" name="subject" id="subject" placeholder="Konu" />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="form-clt">
                          <textarea name="message" id="message" placeholder="Mesajınız"></textarea>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <button type="submit" className="theme-btn">
                          Gönder <i className="fa-sharp fa-regular fa-arrow-up-right"></i>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
