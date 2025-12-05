'use client';

import { useState } from 'react';
import CostSimulator from './CostSimulator';

export default function SimulatorButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-6 right-6 z-40 px-4 py-3 rounded-xl 
                    bg-[#1a1a1a] border border-[#2a2a2a]
                    hover:border-[#00ff88] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]
                    transition-all duration-300 group
                    flex items-center gap-3"
            >
                <span className="text-xl group-hover:scale-110 transition-transform">🧮</span>
                <span className="text-gray-300 group-hover:text-[#00ff88] transition-colors font-medium text-sm">
                    Simulateur
                </span>
            </button>

            <CostSimulator isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
