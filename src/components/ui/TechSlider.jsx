import React from 'react';
import { SiMicrosoftazure } from 'react-icons/si';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

const TechSlider = () => {
  const techItems = [
    { icon: 'SiMicrosoftazure', text: 'Azure (Cloud)' },
    { icon: 'fab fa-docker', text: 'Kubernetes' },
    { icon: 'fas fa-rocket', text: 'CI/CD' },
    { icon: 'fas fa-code', text: 'Terraform' },
    { icon: 'fab fa-linux', text: 'Linux Admin' },
    { icon: 'fas fa-network-wired', text: 'Networking' },
  ];

  return (
    <Swiper
      modules={[Autoplay, FreeMode]}
      slidesPerView="auto"
      spaceBetween={20}
      loop={true}
      speed={5000}
      autoplay={{ delay: 0, disableOnInteraction: false }}
      freeMode={true}
      className="w-full"
    >
      {techItems.map((item, idx) => (
        <SwiperSlide key={idx} className="!w-auto">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-[var(--theme-text-muted)] hover:text-primary hover:border-primary transition-all duration-300 hover:-translate-y-1">
            {item.icon === 'SiMicrosoftazure' ? (
                <SiMicrosoftazure className="text-primary" />
            ) : (
                <i className={`${item.icon} text-primary`}></i>
            )}
            {item.text}
          </span>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default TechSlider;