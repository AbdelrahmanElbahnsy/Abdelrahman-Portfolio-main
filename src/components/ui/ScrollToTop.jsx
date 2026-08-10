import React, { useState, useEffect } from 'react';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <button
            id="scroll-to-top"
            className={`scroll-top-btn ${isVisible ? 'visible' : ''}`}
            onClick={scrollToTop}
            aria-label="Scroll to top"
        >
            <i className="fas fa-arrow-up"></i>

            <style dangerouslySetInnerHTML={{ __html: `
                .scroll-top-btn {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 50px;
                    height: 50px;
                    background: var(--theme-accent);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    box-shadow: 0 5px 15px rgba(200, 162, 110, 0.3);
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(20px);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 1000;
                }

                .scroll-top-btn.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .scroll-top-btn:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 20px rgba(200, 162, 110, 0.4);
                }

                @media (max-width: 768px) {
                    .scroll-top-btn {
                        bottom: 15px;
                        right: 15px;
                        width: 44px;
                        height: 44px;
                        font-size: 1rem;
                    }
                }
            ` }} />
        </button>
    );
};

export default ScrollToTop;