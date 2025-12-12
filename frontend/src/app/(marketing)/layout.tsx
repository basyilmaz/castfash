import React from 'react';

// Import AIForge Template CSS
import "../../assets/aiforge/css/bootstrap.min.css";
import "../../assets/aiforge/css/all.min.css";
import "../../assets/aiforge/css/animate.css";
import "../../assets/aiforge/css/meanmenu.css";
import "../../assets/aiforge/css/magnific-popup.css";
import "../../assets/aiforge/css/swiper-bundle.min.css";
import "../../assets/aiforge/css/nice-select.css";
import "../../assets/aiforge/css/color.css";
import "../../assets/aiforge/css/main.css";

export const metadata = {
  title: 'Castfash - AI Moda Katalog Platformu',
  description: 'Dakikalar içinde AI moda katalog çekimi yapın.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="body-bg">{children}</div>
  );
}
