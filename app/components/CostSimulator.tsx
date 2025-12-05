'use client';

import { useState, useMemo } from 'react';

// Types
interface SimulatorInputs {
    profile: 'ecole' | 'college' | 'lycee' | 'collectivite';
    nbPCs: number;
    avgAge: number;
    hasWindows: boolean;
    hasOffice365: boolean;
    hasAdobe: boolean;
    hasAntivirus: boolean;
    electricityPrice: number;
    yearsProjection: number;
}

interface SimulatorResults {
    // Licences
    windowsSavings: number;
    officeSavings: number;
    adobeSavings: number;
    antivirusSavings: number;
    totalLicenseSavings: number;

    // Matériel
    hardwareExtensionSavings: number;
    maintenanceSavings: number;
    reconditioningCost: number;
    totalHardwareSavings: number;

    // Énergie
    energySavings: number;

    // Formation
    trainingCost: number;

    // Environnement
    co2Avoided: number;
    ewasteAvoided: number;
    treesEquivalent: number;

    // Totaux
    totalSavings: number;
    totalCosts: number;
    netSavings: number;
    roiMonths: number;
}

// Constantes de calcul
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
    teacherRatio: 0.1, // 1 enseignant pour 10 PC
    co2PerPCPerYear: 50,
    ewastePerPC: 8, // kg
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
        electricityPrice: 0.25,
        yearsProjection: 5,
    });

    const [step, setStep] = useState(1);

    // Calculs des résultats
    const results = useMemo<SimulatorResults>(() => {
        const years = inputs.yearsProjection;
        const pcs = inputs.nbPCs;

        // Licences
        const windowsSavings = inputs.hasWindows ? COSTS.windowsLicense * pcs : 0;
        const officeSavings = inputs.hasOffice365 ? COSTS.office365PerYear * pcs * years : 0;
        const adobeSavings = inputs.hasAdobe ? COSTS.adobePerYear * pcs * years : 0;
        const antivirusSavings = inputs.hasAntivirus ? COSTS.antivirusPerYear * pcs * years : 0;
        const totalLicenseSavings = windowsSavings + officeSavings + adobeSavings + antivirusSavings;

        // Matériel - Extension de vie de 5 ans
        const pcsToReplace = Math.floor(pcs * (inputs.avgAge / 7)); // PCs qui auraient dû être remplacés
        const hardwareExtensionSavings = pcsToReplace * COSTS.pcReplacement;
        const maintenanceSavingsPerYear = pcs * COSTS.maintenancePerPCPerYear * COSTS.maintenanceReductionLinux;
        const maintenanceSavings = maintenanceSavingsPerYear * years;
        const reconditioningCost = pcs * COSTS.pcReconditioning;
        const totalHardwareSavings = hardwareExtensionSavings + maintenanceSavings - reconditioningCost;

        // Énergie
        const energySavingsPerYear = pcs * COSTS.energyPerPCPerYear * COSTS.energyReductionLinux;
        const energySavings = energySavingsPerYear * years;

        // Formation
        const nbTeachers = Math.ceil(pcs * COSTS.teacherRatio);
        const trainingCost = nbTeachers * COSTS.trainingPerTeacher;

        // Environnement
        const co2Avoided = pcsToReplace * COSTS.co2PerPCPerYear * 5; // 5 ans de vie en plus
        const ewasteAvoided = pcsToReplace * COSTS.ewastePerPC;
        const treesEquivalent = Math.round(co2Avoided / 22); // 22kg CO2 absorbé par arbre/an

        // Totaux
        const totalSavings = totalLicenseSavings + totalHardwareSavings + energySavings;
        const totalCosts = trainingCost + reconditioningCost;
        const netSavings = totalSavings - totalCosts + reconditioningCost; // recond déjà soustrait
        const roiMonths = netSavings > 0 ? Math.ceil((totalCosts / (netSavings / years / 12))) : 0;

        return {
            windowsSavings,
            officeSavings,
            adobeSavings,
            antivirusSavings,
            totalLicenseSavings,
            hardwareExtensionSavings,
            maintenanceSavings,
            reconditioningCost,
            totalHardwareSavings,
            energySavings,
            trainingCost,
            co2Avoided,
            ewasteAvoided,
            treesEquivalent,
            totalSavings,
            totalCosts,
            netSavings,
            roiMonths,
        };
    }, [inputs]);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0d0d0d] w-[95vw] max-w-5xl h-[90vh] rounded-3xl border border-[#2a2a2a] shadow-[0_0_60px_rgba(0,255,136,0.1)] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-[#1a1a1a] p-6 border-b border-[#2a2a2a] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#00ff88] flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(0,255,136,0.4)]">
                            🧮
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-xl">Simulateur de Coûts NIRD</h2>
                            <p className="text-gray-500 text-sm">Calculez vos économies potentielles</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 && (
                        <div className="space-y-8">
                            {/* Profil */}
                            <div>
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-[#00ff88]/20 text-[#00ff88] flex items-center justify-center text-sm font-bold">1</span>
                                    Votre profil
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {(Object.keys(PROFILE_LABELS) as Array<keyof typeof PROFILE_LABELS>).map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => setInputs(prev => ({ ...prev, profile: key }))}
                                            className={`p-4 rounded-xl border transition-all ${inputs.profile === key
                                                    ? 'border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]'
                                                    : 'border-[#2a2a2a] text-gray-400 hover:border-gray-600'
                                                }`}
                                        >
                                            {PROFILE_LABELS[key]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Parc informatique */}
                            <div>
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-[#00ff88]/20 text-[#00ff88] flex items-center justify-center text-sm font-bold">2</span>
                                    Votre parc informatique
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="text-gray-400 text-sm block mb-2">Nombre de PC</label>
                                        <input
                                            type="range"
                                            min="10"
                                            max="1000"
                                            step="10"
                                            value={inputs.nbPCs}
                                            onChange={(e) => setInputs(prev => ({ ...prev, nbPCs: Number(e.target.value) }))}
                                            className="w-full accent-[#00ff88]"
                                        />
                                        <div className="text-[#00ff88] text-2xl font-bold mt-2">{inputs.nbPCs} PC</div>
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-sm block mb-2">Âge moyen du parc</label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="15"
                                            value={inputs.avgAge}
                                            onChange={(e) => setInputs(prev => ({ ...prev, avgAge: Number(e.target.value) }))}
                                            className="w-full accent-[#00ff88]"
                                        />
                                        <div className="text-[#00ff88] text-2xl font-bold mt-2">{inputs.avgAge} ans</div>
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-sm block mb-2">Projection sur</label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={inputs.yearsProjection}
                                            onChange={(e) => setInputs(prev => ({ ...prev, yearsProjection: Number(e.target.value) }))}
                                            className="w-full accent-[#00ff88]"
                                        />
                                        <div className="text-[#00ff88] text-2xl font-bold mt-2">{inputs.yearsProjection} ans</div>
                                    </div>
                                </div>
                            </div>

                            {/* Licences actuelles */}
                            <div>
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-[#00ff88]/20 text-[#00ff88] flex items-center justify-center text-sm font-bold">3</span>
                                    Licences actuelles
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { key: 'hasWindows', label: '💻 Windows', cost: '145€/poste' },
                                        { key: 'hasOffice365', label: '📄 Office 365', cost: '70€/an' },
                                        { key: 'hasAdobe', label: '🎨 Adobe CC', cost: '600€/an' },
                                        { key: 'hasAntivirus', label: '🛡️ Antivirus', cost: '30€/an' },
                                    ].map((item) => (
                                        <button
                                            key={item.key}
                                            onClick={() => setInputs(prev => ({ ...prev, [item.key]: !prev[item.key as keyof SimulatorInputs] }))}
                                            className={`p-4 rounded-xl border transition-all text-left ${inputs[item.key as keyof SimulatorInputs]
                                                    ? 'border-[#00ff88] bg-[#00ff88]/10'
                                                    : 'border-[#2a2a2a] hover:border-gray-600'
                                                }`}
                                        >
                                            <div className={inputs[item.key as keyof SimulatorInputs] ? 'text-[#00ff88]' : 'text-gray-400'}>
                                                {item.label}
                                            </div>
                                            <div className="text-gray-500 text-xs mt-1">{item.cost}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-4 rounded-xl bg-[#00ff88] text-black font-bold text-lg hover:bg-[#00cc6a] transition-all hover:shadow-[0_0_30px_rgba(0,255,136,0.4)]"
                            >
                                Calculer mes économies →
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            {/* Résumé principal */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-[#00ff88]/20 to-[#00ff88]/5 rounded-2xl p-6 border border-[#00ff88]/30">
                                    <div className="text-gray-400 text-sm mb-1">Économies totales</div>
                                    <div className="text-[#00ff88] text-3xl font-bold">{formatMoney(results.netSavings)}</div>
                                    <div className="text-gray-500 text-xs mt-1">sur {inputs.yearsProjection} ans</div>
                                </div>
                                <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#2a2a2a]">
                                    <div className="text-gray-400 text-sm mb-1">Retour sur investissement</div>
                                    <div className="text-white text-3xl font-bold">{results.roiMonths} mois</div>
                                    <div className="text-gray-500 text-xs mt-1">pour être rentable</div>
                                </div>
                                <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#2a2a2a]">
                                    <div className="text-gray-400 text-sm mb-1">CO₂ évité</div>
                                    <div className="text-green-400 text-3xl font-bold">{results.co2Avoided.toLocaleString('fr-FR')} kg</div>
                                    <div className="text-gray-500 text-xs mt-1">≈ {results.treesEquivalent} arbres 🌳</div>
                                </div>
                            </div>

                            {/* Détails par catégorie */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Licences */}
                                <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#2a2a2a]">
                                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                        💻 Économies Licences
                                        <span className="text-[#00ff88] ml-auto">{formatMoney(results.totalLicenseSavings)}</span>
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        {results.windowsSavings > 0 && (
                                            <div className="flex justify-between text-gray-400">
                                                <span>Windows</span>
                                                <span className="text-[#00ff88]">+{formatMoney(results.windowsSavings)}</span>
                                            </div>
                                        )}
                                        {results.officeSavings > 0 && (
                                            <div className="flex justify-between text-gray-400">
                                                <span>Office 365</span>
                                                <span className="text-[#00ff88]">+{formatMoney(results.officeSavings)}</span>
                                            </div>
                                        )}
                                        {results.adobeSavings > 0 && (
                                            <div className="flex justify-between text-gray-400">
                                                <span>Adobe CC</span>
                                                <span className="text-[#00ff88]">+{formatMoney(results.adobeSavings)}</span>
                                            </div>
                                        )}
                                        {results.antivirusSavings > 0 && (
                                            <div className="flex justify-between text-gray-400">
                                                <span>Antivirus</span>
                                                <span className="text-[#00ff88]">+{formatMoney(results.antivirusSavings)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Matériel */}
                                <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#2a2a2a]">
                                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                        🔧 Économies Matériel
                                        <span className="text-[#00ff88] ml-auto">{formatMoney(results.totalHardwareSavings)}</span>
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-gray-400">
                                            <span>PC non remplacés</span>
                                            <span className="text-[#00ff88]">+{formatMoney(results.hardwareExtensionSavings)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400">
                                            <span>Maintenance réduite</span>
                                            <span className="text-[#00ff88]">+{formatMoney(results.maintenanceSavings)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400">
                                            <span>Reconditionnement</span>
                                            <span className="text-red-400">-{formatMoney(results.reconditioningCost)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Énergie */}
                                <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#2a2a2a]">
                                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                        ⚡ Économies Énergie
                                        <span className="text-[#00ff88] ml-auto">{formatMoney(results.energySavings)}</span>
                                    </h4>
                                    <div className="text-gray-400 text-sm">
                                        Linux consomme ~15% d&apos;énergie en moins que Windows
                                    </div>
                                </div>

                                {/* Formation */}
                                <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#2a2a2a]">
                                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                        👨‍🏫 Coût Formation
                                        <span className="text-red-400 ml-auto">-{formatMoney(results.trainingCost)}</span>
                                    </h4>
                                    <div className="text-gray-400 text-sm">
                                        Formation initiale de {Math.ceil(inputs.nbPCs * COSTS.teacherRatio)} enseignants/agents
                                    </div>
                                </div>
                            </div>

                            {/* Impact environnemental */}
                            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-800/50">
                                <h4 className="text-white font-semibold mb-4">🌱 Impact Environnemental</h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-green-400 text-2xl font-bold">{results.co2Avoided.toLocaleString('fr-FR')} kg</div>
                                        <div className="text-gray-400 text-sm">CO₂ évité</div>
                                    </div>
                                    <div>
                                        <div className="text-green-400 text-2xl font-bold">{results.ewasteAvoided} kg</div>
                                        <div className="text-gray-400 text-sm">Déchets évités</div>
                                    </div>
                                    <div>
                                        <div className="text-green-400 text-2xl font-bold">{results.treesEquivalent}</div>
                                        <div className="text-gray-400 text-sm">Arbres équivalents 🌳</div>
                                    </div>
                                </div>
                            </div>

                            {/* Barre de progression visuelle */}
                            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#2a2a2a]">
                                <h4 className="text-white font-semibold mb-4">📊 Répartition des économies</h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">Licences</span>
                                            <span className="text-[#00ff88]">{Math.round(results.totalLicenseSavings / results.totalSavings * 100)}%</span>
                                        </div>
                                        <div className="h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#00ff88] rounded-full transition-all duration-500"
                                                style={{ width: `${results.totalLicenseSavings / results.totalSavings * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">Matériel</span>
                                            <span className="text-blue-400">{Math.round(results.totalHardwareSavings / results.totalSavings * 100)}%</span>
                                        </div>
                                        <div className="h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-400 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.max(0, results.totalHardwareSavings / results.totalSavings * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">Énergie</span>
                                            <span className="text-yellow-400">{Math.round(results.energySavings / results.totalSavings * 100)}%</span>
                                        </div>
                                        <div className="h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                                style={{ width: `${results.energySavings / results.totalSavings * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-4 rounded-xl border border-[#2a2a2a] text-gray-400 font-semibold hover:border-gray-600 transition-all"
                                >
                                    ← Modifier les paramètres
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 rounded-xl bg-[#00ff88] text-black font-bold hover:bg-[#00cc6a] transition-all"
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
