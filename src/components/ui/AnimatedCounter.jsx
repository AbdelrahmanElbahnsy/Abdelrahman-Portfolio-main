import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * AnimatedCounter — Counts up from 0 to a target number on scroll
 *
 * @param {number} target - The number to count up to
 * @param {string} suffix - Appended text (e.g., '%', '+', 'k')
 * @param {string} prefix - Prepended text (e.g., '$')
 * @param {number} duration - Animation duration in seconds, default 1.5
 * @param {string} className - Classes for the wrapper span
 *
 * Usage:
 *   <AnimatedCounter target={95} suffix="%" duration={1.5} />
 */
const AnimatedCounter = ({
    target = 0,
    suffix = '',
    prefix = '',
    duration = 1.5,
    className = '',
}) => {
    const spanRef = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const el = spanRef.current;
        if (!el || hasAnimated.current) return;

        const proxy = { value: 0 };

        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                hasAnimated.current = true;
                gsap.to(proxy, {
                    value: target,
                    duration: duration,
                    ease: 'power2.out',
                    snap: { value: 1 }, // Snap to integers
                    onUpdate: () => {
                        el.textContent = `${prefix}${Math.round(proxy.value)}${suffix}`;
                    },
                });
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach((t) => {
                if (t.trigger === el) t.kill();
            });
        };
    }, [target, suffix, prefix, duration]);

    return (
        <span ref={spanRef} className={className}>
            {prefix}0{suffix}
        </span>
    );
};

export default AnimatedCounter;
