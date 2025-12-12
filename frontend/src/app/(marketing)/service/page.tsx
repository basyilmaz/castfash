'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ServicePage() {
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
                            <h1 className="wow fadeInUp" data-wow-delay=".3s">Hizmetlerimiz</h1>
                            <ul className="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                                <li>
                                    <Link href="/">Ana Sayfa</Link>
                                </li>
                                <li>
                                    <i className="fa-regular fa-chevrons-right"></i>
                                </li>
                                <li>Hizmetler</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Section Start */}
            <section className="service-section fix section-padding">
                <div className="container">
                    <div className="section-title text-center">
                        <h6 className="wow fadeInUp">
                            <img src="/aiforge/assets/img/star.png" alt="img" /> Neler Sunuyoruz?
                        </h6>
                        <h2 className="wow fadeInUp" data-wow-delay=".3s">
                            AI Destekli Moda <br />
                            <span>Çözümlerimiz</span>
                        </h2>
                    </div>
                    <div className="row">
                        <div className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".2s">
                            <div className="service-box-items">
                                <div className="service-image">
                                    <img src="/aiforge/assets/img/service/01.jpg" alt="img" />
                                </div>
                                <div className="service-content">
                                    <h3>Model Oluşturma</h3>
                                    <p>Markanızın yüzü olacak sanal modelleri saniyeler içinde tasarlayın.</p>
                                    <Link href="/auth/register" className="link-btn">Detaylar <i className="fa-sharp fa-regular fa-arrow-up-right"></i></Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".4s">
                            <div className="service-box-items">
                                <div className="service-image">
                                    <img src="/aiforge/assets/img/service/02.jpg" alt="img" />
                                </div>
                                <div className="service-content">
                                    <h3>Sahne Tasarımı</h3>
                                    <p>Ürünlerinizi stüdyo, dış mekan veya hayalinizdeki herhangi bir mekanda sergileyin.</p>
                                    <Link href="/auth/register" className="link-btn">Detaylar <i className="fa-sharp fa-regular fa-arrow-up-right"></i></Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".6s">
                            <div className="service-box-items">
                                <div className="service-image">
                                    <img src="/aiforge/assets/img/service/03.jpg" alt="img" />
                                </div>
                                <div className="service-content">
                                    <h3>Toplu İşlem</h3>
                                    <p>Yüzlerce ürün fotoğrafını tek seferde işleyerek zamandan tasarruf edin.</p>
                                    <Link href="/auth/register" className="link-btn">Detaylar <i className="fa-sharp fa-regular fa-arrow-up-right"></i></Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".2s">
                            <div className="service-box-items">
                                <div className="service-image">
                                    <img src="/aiforge/assets/img/service/04.jpg" alt="img" />
                                </div>
                                <div className="service-content">
                                    <h3>Yüksek Çözünürlük</h3>
                                    <p>Baskı kalitesinde (4K+) görseller elde edin.</p>
                                    <Link href="/auth/register" className="link-btn">Detaylar <i className="fa-sharp fa-regular fa-arrow-up-right"></i></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
