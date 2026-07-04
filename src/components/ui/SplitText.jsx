import React, { forwardRef, useMemo } from 'react';

/**
 * SplitText — Splits text into individually animatable characters or words
 *
 * Wraps each character/word in a <span> so GSAP can target them individually
 * for staggered cascade animations.
 *
 * @param {string} children - Text to split
 * @param {string} mode - 'char' | 'word', default 'char'
 * @param {string} className - Classes for the wrapper
 *
 * Usage:
 *   <SplitText ref={nameRef} mode="char" className="text-5xl font-black">
 *     Abdelrahman Elbahnsy
 *   </SplitText>
 *
 * Then in GSAP:
 *   const chars = nameRef.current.querySelectorAll('.split-unit');
 *   gsap.from(chars, { y: 40, opacity: 0, stagger: 0.03 });
 */
const SplitText = forwardRef(({ children, mode = 'char', className = '', ...props }, ref) => {
    const units = useMemo(() => {
        const text = typeof children === 'string' ? children : '';

        if (mode === 'word') {
            return text.split(' ').map((word, i) => ({
                key: `w-${i}`,
                content: word,
                isSpace: false,
            }));
        }

        // Char mode — preserve spaces as visible units
        return text.split('').map((char, i) => ({
            key: `c-${i}`,
            content: char === ' ' ? '\u00A0' : char,
            isSpace: char === ' ',
        }));
    }, [children, mode]);

    return (
        <span ref={ref} className={className} aria-label={children} {...props}>
            {units.map((unit, i) => (
                <span
                    key={unit.key}
                    className="split-unit"
                    style={{
                        display: 'inline-block',
                        willChange: 'transform, opacity',
                    }}
                >
                    {unit.content}
                    {mode === 'word' && i < units.length - 1 ? '\u00A0' : ''}
                </span>
            ))}
        </span>
    );
});

SplitText.displayName = 'SplitText';

export default SplitText;
