import React from 'react';

const CloudArchitectureSVG = () => {
    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03] text-[var(--clr-accent)]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1920 1080"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
        >
            {/* ─── API Gateway / Load Balancer ─── */}
            <g transform="translate(400, 200)">
                <rect x="0" y="0" width="120" height="60" rx="8" />
                <text x="60" y="35" textAnchor="middle" fill="currentColor" stroke="none" fontSize="14" fontFamily="monospace" opacity="0.7">API G/W</text>
            </g>

            {/* ─── Cloud Core ─── */}
            <g transform="translate(850, 150)">
                <path d="M40 80 Q 20 80 20 60 Q 20 40 40 40 Q 50 10 80 10 Q 110 10 120 40 Q 140 40 140 60 Q 140 80 120 80 Z" />
                <text x="80" y="55" textAnchor="middle" fill="currentColor" stroke="none" fontSize="14" fontFamily="monospace" opacity="0.7">VPC</text>
            </g>

            {/* ─── Kubernetes Clusters / Microservices ─── */}
            <g transform="translate(600, 450)">
                <rect x="0" y="0" width="200" height="120" rx="8" />
                <text x="100" y="25" textAnchor="middle" fill="currentColor" stroke="none" fontSize="14" fontFamily="monospace" opacity="0.7">K8s Cluster</text>
                {/* Pods */}
                <rect x="20" y="40" width="40" height="40" rx="4" />
                <rect x="80" y="40" width="40" height="40" rx="4" />
                <rect x="140" y="40" width="40" height="40" rx="4" />
            </g>

            {/* ─── Databases ─── */}
            <g transform="translate(1100, 500)">
                {/* DB 1 */}
                <path d="M0 20 C0 0, 80 0, 80 20 L80 80 C80 100, 0 100, 0 80 Z" />
                <path d="M0 20 C0 40, 80 40, 80 20" />
                <text x="40" y="60" textAnchor="middle" fill="currentColor" stroke="none" fontSize="14" fontFamily="monospace" opacity="0.7">DB-Primary</text>
            </g>
            <g transform="translate(1250, 500)">
                {/* DB 2 */}
                <path d="M0 20 C0 0, 80 0, 80 20 L80 80 C80 100, 0 100, 0 80 Z" />
                <path d="M0 20 C0 40, 80 40, 80 20" />
                <text x="40" y="60" textAnchor="middle" fill="currentColor" stroke="none" fontSize="14" fontFamily="monospace" opacity="0.7">DB-Replica</text>
            </g>

            {/* ─── Server Racks / EC2 ─── */}
            <g transform="translate(300, 700)">
                <rect x="0" y="0" width="100" height="200" rx="4" />
                <line x1="10" y1="20" x2="90" y2="20" />
                <line x1="10" y1="60" x2="90" y2="60" />
                <line x1="10" y1="100" x2="90" y2="100" />
                <line x1="10" y1="140" x2="90" y2="140" />
                <line x1="10" y1="180" x2="90" y2="180" />
            </g>

            {/* ─── Connecting Lines ─── */}
            <path d="M520 230 L850 190" /> {/* API to VPC */}
            <path d="M900 230 L700 450" /> {/* VPC to K8s */}
            <path d="M950 230 L1140 500" /> {/* VPC to DB 1 */}
            <path d="M1180 550 L1250 550" /> {/* DB 1 to DB 2 */}
            <path d="M700 570 L350 700" /> {/* K8s to Servers */}
            <path d="M800 570 L1100 550" /> {/* K8s to DB 1 */}
            
            {/* ─── Floating decorative nodes ─── */}
            <circle cx="200" cy="300" r="4" />
            <circle cx="1600" cy="250" r="6" />
            <circle cx="1400" cy="800" r="3" />
            <circle cx="450" cy="900" r="5" />
            
            <path d="M200 300 L400 230" opacity="0.5" />
            <path d="M1600 250 L1250 520" opacity="0.5" />
        </svg>
    );
};

export default CloudArchitectureSVG;
