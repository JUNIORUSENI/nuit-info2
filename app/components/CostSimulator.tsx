'use client';

import { useState, useMemo } from 'react';

interface SimulatorInputs {
    profile: 'ecole' | 'college' | 'lycee' | 'collectivite';
    nbPCs: number;
    avgAge: number;
    hasWindows: boolean;
    hasOffice365: boolean;
    hasAdobe: boolean;
    hasAntivirus: boolean;
    yearsProjection: number;
}

interface SimulatorResults {
    totalLicenseSavings: number;
    totalHardwareSavings: number;
    energySavings: number;
    trainingCost: number;
    co2Avoided: number;
    ewasteAvoided: number;
    treesEquivalent: number;
    netSavings: number;
    roiMonths: number;
    pcsToReplace: number;
    savingsPerYear: number;
    savingsPerMonth: number;
}

const COSTS = {
    windowsLicense: 145,
    office365PerYear: 70,
    adobePerYear: 600,
    antivirusPerYear: 30,
    pcReplacement: 500,
    pcReconditioning: 50,
    maintenancePerPCPerYear: 80,
    maintenanceReductionLinux: 0.4,
    energyPerPCPerYear: 50,
    energyReductionLinux: 0.15,
    trainingPerTeacher: 200,
    teacherRatio: 0.1,
    co2PerPCPerYear: 50,
    ewastePerPC: 8,
};

const PROFILE_LABELS = {
    ecole: '🏫 École primaire',
    college: '🏛️ Collège',
    lycee: '🎓 Lycée',
    collectivite: '🏢 Mairie / Collectivité',
};

interface CostSimulatorProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CostSimulator({ isOpen, onClose }: CostSimulatorProps) {
    const [inputs, setInputs] = useState<SimulatorInputs>({
        profile: 'college',
        nbPCs: 100,
        avgAge: 5,
        hasWindows: true,
        hasOffice365: true,
        hasAdobe: false,
        hasAntivirus: true,
        yearsProjection: 5,
    });

    const [step, setStep] = useState(1);
    const [isLightMode, setIsLightMode] = useState(false);

    const results = useMemo<SimulatorResults>(() => {
        const years = inputs.yearsProjection;
        const pcs = inputs.nbPCs;

        const windowsSavings = inputs.hasWindows ? COSTS.windowsLicense * pcs : 0;
        const officeSavings = inputs.hasOffice365 ? COSTS.office365PerYear * pcs * years : 0;
        const adobeSavings = inputs.hasAdobe ? COSTS.adobePerYear * pcs * years : 0;
        const antivirusSavings = inputs.hasAntivirus ? COSTS.antivirusPerYear * pcs * years : 0;
        const totalLicenseSavings = windowsSavings + officeSavings + adobeSavings + antivirusSavings;

        const pcsToReplace = Math.floor(pcs * (inputs.avgAge / 7));
        const hardwareExtensionSavings = pcsToReplace * COSTS.pcReplacement;
        const maintenanceSavings = pcs * COSTS.maintenancePerPCPerYear * COSTS.maintenanceReductionLinux * years;
        const reconditioningCost = pcs * COSTS.pcReconditioning;
        const totalHardwareSavings = hardwareExtensionSavings + maintenanceSavings - reconditioningCost;

        const energySavings = pcs * COSTS.energyPerPCPerYear * COSTS.energyReductionLinux * years;
        const trainingCost = Math.ceil(pcs * COSTS.teacherRatio) * COSTS.trainingPerTeacher;

        const co2Avoided = pcsToReplace * COSTS.co2PerPCPerYear * 5;
        const ewasteAvoided = pcsToReplace * COSTS.ewastePerPC;
        const treesEquivalent = Math.round(co2Avoided / 22);

        const totalSavings = totalLicenseSavings + totalHardwareSavings + energySavings;
        const totalCosts = trainingCost + reconditioningCost;
        const netSavings = totalSavings - totalCosts + reconditioningCost;
        const roiMonths = netSavings > 0 ? Math.ceil((totalCosts / (netSavings / years / 12))) : 0;

        return {
            totalLicenseSavings, totalHardwareSavings, energySavings, trainingCost,
            co2Avoided, ewasteAvoided, treesEquivalent, netSavings, roiMonths, pcsToReplace,
            savingsPerYear: netSavings / years,
            savingsPerMonth: netSavings / years / 12,
        };
    }, [inputs]);

    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

    const theme = isLightMode ? {
        bg: 'bg-white', bgSecondary: 'bg-gray-50', border: 'border-gray-200',
        text: 'text-gray-900', textSecondary: 'text-gray-600', textMuted: 'text-gray-500',
        accent: 'text-emerald-600', accentBg: 'bg-emerald-500', card: 'bg-white border-gray-200',
    } : {
        bg: 'bg-[#0d0d0d]', bgSecondary: 'bg-[#1a1a1a]', border: 'border-[#2a2a2a]',
        text: 'text-white', textSecondary: 'text-gray-300', textMuted: 'text-gray-500',
        accent: 'text-[#00ff88]', accentBg: 'bg-[#00ff88]', card: 'bg-[#1a1a1a] border-[#2a2a2a]',
    };

    if (!isOpen) return null;

    // Cartes d'indicateurs pour les résultats
    const indicators = [
        {
            icon: '💰',
            title: 'Économies Totales',
            value: formatMoney(results.netSavings),
            color: 'text-emerald-500',
            bgColor: isLightMode ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-900/20 border-emerald-800/50',
            desc: `Sur ${inputs.yearsProjection} ans, votre établissement économise cette somme en passant aux logiciels libres et en prolongeant la vie de vos équipements.`
        },
        {
            icon: '📅',
            title: 'Économies par Mois',
            value: formatMoney(results.savingsPerMonth),
            color: 'text-blue-500',
            bgColor: isLightMode ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/20 border-blue-800/50',
            desc: `Chaque mois, ce montant peut être réinvesti dans d'autres projets pédagogiques ou équipements.`
        },
        {
            icon: '⏱️',
            title: 'Retour sur Investissement',
            value: `${results.roiMonths} mois`,
            color: 'text-purple-500',
            bgColor: isLightMode ? 'bg-purple-50 border-purple-200' : 'bg-purple-900/20 border-purple-800/50',
            desc: `C'est le temps nécessaire pour que les économies compensent le coût de formation et de reconditionnement.`
        },
        {
            icon: '💻',
            title: 'Économies Licences',
            value: formatMoney(results.totalLicenseSavings),
            color: theme.accent,
            bgColor: isLightMode ? 'bg-gray-50 border-gray-200' : 'bg-[#1a1a1a] border-[#2a2a2a]',
            desc: `LibreOffice, GIMP et Linux remplacent Windows, Office et les antivirus payants. Même qualité, zéro frais.`
        },
        {
            icon: '🔧',
            title: 'Économies Matériel',
            value: formatMoney(results.totalHardwareSavings),
            color: 'text-orange-500',
            bgColor: isLightMode ? 'bg-orange-50 border-orange-200' : 'bg-orange-900/20 border-orange-800/50',
            desc: `${results.pcsToReplace} PC "obsolètes" sous Windows peuvent continuer à fonctionner 5 ans de plus sous Linux.`
        },
        {
            icon: '⚡',
            title: 'Économies Énergie',
            value: formatMoney(results.energySavings),
            color: 'text-yellow-500',
            bgColor: isLightMode ? 'bg-yellow-50 border-yellow-200' : 'bg-yellow-900/20 border-yellow-800/50',
            desc: `Linux consomme environ 15% d'électricité en moins que Windows. Bon pour le budget et la planète.`
        },
        {
            icon: '🌱',
            title: 'CO₂ Évité',
            value: `${results.co2Avoided.toLocaleString('fr-FR')} kg`,
            color: 'text-green-500',
            bgColor: isLightMode ? 'bg-green-50 border-green-200' : 'bg-green-900/20 border-green-800/50',
            desc: `En prolongeant la vie des PC, vous évitez la fabrication de nouveaux équipements. C'est l'équivalent de ${results.treesEquivalent} arbres plantés ! 🌳`
        },
        {
            icon: '👨‍🏫',
            title: 'Investissement Formation',
            value: formatMoney(results.trainingCost),
            color: 'text-red-500',
            bgColor: isLightMode ? 'bg-red-50 border-red-200' : 'bg-red-900/20 border-red-800/50',
            desc: `Formation initiale pour ${Math.ceil(inputs.nbPCs * 0.1)} personnes. Un investissement ponctuel rapidement rentabilisé.`
        },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className={`${theme.bg} w-[95vw] max-w-5xl h-[90vh] rounded-3xl border ${theme.border} shadow-2xl flex flex-col overflow-hidden transition-colors duration-300`}>
                {/* Header */}
                <div className={`${theme.bgSecondary} p-4 md:p-6 border-b ${theme.border} flex items-center justify-between`}>
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${theme.accentBg} flex items-center justify-center text-xl md:text-2xl shadow-lg`}>
                            🧮
                        </div>
                        <div>
                            <h2 className={`${theme.text} font-bold text-lg md:text-xl`}>Simulateur NIRD</h2>
                            <p className={`${theme.textMuted} text-xs md:text-sm`}>{step === 1 ? 'Configurez votre simulation' : 'Vos résultats'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsLightMode(!isLightMode)}
                            className={`p-2 md:p-3 rounded-xl border ${theme.border} text-lg transition-all hover:scale-110`}
                        >
                            {isLightMode ? '🌙' : '☀️'}
                        </button>
                        <button onClick={onClose} className={`${theme.textMuted} hover:${theme.text} p-2 rounded-lg`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {step === 1 && (
                        <div className="space-y-6 md:space-y-8">
                            {/* Profil */}
                            <div>
                                <h3 className={`${theme.text} font-semibold mb-3 md:mb-4`}>1. Votre établissement</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                                    {(Object.keys(PROFILE_LABELS) as Array<keyof typeof PROFILE_LABELS>).map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => setInputs(prev => ({ ...prev, profile: key }))}
                                            className={`p-3 md:p-4 rounded-xl border transition-all text-sm md:text-base ${inputs.profile === key
                                                    ? `${isLightMode ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]'}`
                                                    : `${theme.border} ${theme.textSecondary}`
                                                }`}
                                        >
                                            {PROFILE_LABELS[key]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sliders */}
                            <div>
                                <h3 className={`${theme.text} font-semibold mb-3 md:mb-4`}>2. Votre parc informatique</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                    {[
                                        { label: 'Nombre de PC', key: 'nbPCs', min: 10, max: 1000, step: 10, suffix: ' PC' },
                                        { label: 'Âge moyen', key: 'avgAge', min: 1, max: 15, step: 1, suffix: ' ans' },
                                        { label: 'Projection', key: 'yearsProjection', min: 1, max: 10, step: 1, suffix: ' ans' },
                                    ].map((item) => (
                                        <div key={item.key}>
                                            <label className={`${theme.textMuted} text-sm block mb-2`}>{item.label}</label>
                                            <input
                                                type="range" min={item.min} max={item.max} step={item.step}
                                                value={inputs[item.key as keyof SimulatorInputs] as number}
                                                onChange={(e) => setInputs(prev => ({ ...prev, [item.key]: Number(e.target.value) }))}
                                                className={`w-full ${isLightMode ? 'accent-emerald-500' : 'accent-[#00ff88]'}`}
                                            />
                                            <div className={`${theme.accent} text-xl md:text-2xl font-bold mt-1`}>
                                                {inputs[item.key as keyof SimulatorInputs]}{item.suffix}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Licences */}
                            <div>
                                <h3 className={`${theme.text} font-semibold mb-3 md:mb-4`}>3. Licences actuelles</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                                    {[
                                        { key: 'hasWindows', label: '💻 Windows', cost: '145€/poste' },
                                        { key: 'hasOffice365', label: '📄 Office 365', cost: '70€/an' },
                                        { key: 'hasAdobe', label: '🎨 Adobe CC', cost: '600€/an' },
                                        { key: 'hasAntivirus', label: '🛡️ Antivirus', cost: '30€/an' },
                                    ].map((item) => (
                                        <button
                                            key={item.key}
                                            onClick={() => setInputs(prev => ({ ...prev, [item.key]: !prev[item.key as keyof SimulatorInputs] }))}
                                            className={`p-3 md:p-4 rounded-xl border transition-all text-left ${inputs[item.key as keyof SimulatorInputs]
                                                    ? `${isLightMode ? 'border-emerald-500 bg-emerald-50' : 'border-[#00ff88] bg-[#00ff88]/10'}`
                                                    : `${theme.border}`
                                                }`}
                                        >
                                            <div className={`text-sm md:text-base ${inputs[item.key as keyof SimulatorInputs] ? theme.accent : theme.textSecondary}`}>
                                                {item.label}
                                            </div>
                                            <div className={`${theme.textMuted} text-xs mt-1`}>{item.cost}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className={`w-full py-3 md:py-4 rounded-xl ${theme.accentBg} text-black font-bold text-base md:text-lg hover:opacity-90 transition-all shadow-lg`}
                            >
                                Voir mes résultats →
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 md:space-y-6">
                            {/* Grille d'indicateurs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                {indicators.map((ind, i) => (
                                    <div
                                        key={i}
                                        className={`${ind.bgColor} rounded-2xl p-4 md:p-5 border transition-all hover:scale-[1.02]`}
                                    >
                                        <div className="flex items-start gap-3 md:gap-4">
                                            <div className="text-2xl md:text-3xl">{ind.icon}</div>
                                            <div className="flex-1">
                                                <div className={`${theme.textMuted} text-xs md:text-sm`}>{ind.title}</div>
                                                <div className={`${ind.color} text-xl md:text-2xl font-bold`}>{ind.value}</div>
                                                <p className={`${theme.textSecondary} text-xs md:text-sm mt-2 leading-relaxed`}>
                                                    {ind.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Boutons */}
                            <div className="flex gap-3 md:gap-4 pt-2">
                                <button
                                    onClick={() => setStep(1)}
                                    className={`flex-1 py-3 md:py-4 rounded-xl border ${theme.border} ${theme.textSecondary} font-semibold hover:border-gray-400 transition-all`}
                                >
                                    ← Modifier
                                </button>
                                <button
                                    onClick={onClose}
                                    className={`flex-1 py-3 md:py-4 rounded-xl ${theme.accentBg} text-black font-bold hover:opacity-90 transition-all`}
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
