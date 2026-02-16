
import React, { useState, useEffect } from 'react';
import type { Settings, Tier } from '../types';

interface SettingsPageProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
}

// A generic version of Settings to handle string values for form state
type SettingsFormState = {
  spendingTiers: { [key in Tier]: string };
  pointsTiers: { [key in Tier]: string };
  discounts: { [key in Tier]: string };
};

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white border border-neutral-200 p-6 transition-colors hover:border-neutral-300">
        {children}
    </div>
);

const TierInput: React.FC<{ 
    type: keyof SettingsFormState; 
    tier: Tier; 
    label: string; 
    value: string;
    onChange: (type: keyof SettingsFormState, tier: Tier, value: string) => void;
    isCurrency?: boolean; 
    isPercent?: boolean 
}> = ({ type, tier, label, value, onChange, isCurrency = false, isPercent = false }) => (
    <div>
        <label className="input-label">{label}</label>
        <div className="relative">
            {isCurrency && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">₹</span>}
            <input 
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={value}
                onChange={(e) => onChange(type, tier, e.target.value)}
                className={`input-field w-full ${isCurrency ? 'pl-7' : ''} ${isPercent ? 'pr-8' : ''}`}
            />
            {isPercent && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">%</span>}
        </div>
    </div>
);


export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSave }) => {
  const settingsToStrings = (s: Settings): SettingsFormState => ({
    spendingTiers: { Platinum: String(s.spendingTiers.Platinum), Gold: String(s.spendingTiers.Gold), Silver: String(s.spendingTiers.Silver), Bronze: String(s.spendingTiers.Bronze) },
    pointsTiers: { Platinum: String(s.pointsTiers.Platinum), Gold: String(s.pointsTiers.Gold), Silver: String(s.pointsTiers.Silver), Bronze: String(s.pointsTiers.Bronze) },
    discounts: { Platinum: String(s.discounts.Platinum), Gold: String(s.discounts.Gold), Silver: String(s.discounts.Silver), Bronze: String(s.discounts.Bronze) },
  });

  const stringsToSettings = (s: SettingsFormState): Settings => {
    const parseTier = (tier: string) => parseInt(tier, 10) || 0;
    return {
      spendingTiers: { Platinum: parseTier(s.spendingTiers.Platinum), Gold: parseTier(s.spendingTiers.Gold), Silver: parseTier(s.spendingTiers.Silver), Bronze: parseTier(s.spendingTiers.Bronze) },
      pointsTiers: { Platinum: parseTier(s.pointsTiers.Platinum), Gold: parseTier(s.pointsTiers.Gold), Silver: parseTier(s.pointsTiers.Silver), Bronze: parseTier(s.pointsTiers.Bronze) },
      discounts: { Platinum: parseTier(s.discounts.Platinum), Gold: parseTier(s.discounts.Gold), Silver: parseTier(s.discounts.Silver), Bronze: parseTier(s.discounts.Bronze) },
    }
  };
  
  const [localSettings, setLocalSettings] = useState<SettingsFormState>(() => settingsToStrings(settings));

  useEffect(() => {
    setLocalSettings(settingsToStrings(settings));
  }, [settings]);

  const handleTierChange = (type: keyof SettingsFormState, tier: Tier, value: string) => {
    if (/^[0-9]*$/.test(value)) {
        setLocalSettings(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [tier]: value
            }
        }));
    }
  };

  const handleSave = () => {
    onSave(stringsToSettings(localSettings));
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-10">
      <Card>
        <h3 className="setting-title">Spending Tiers</h3>
        <p className="setting-description">Set the minimum total spending required to reach each tier.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <TierInput type="spendingTiers" tier="Bronze" label="Bronze" value={localSettings.spendingTiers.Bronze} onChange={handleTierChange} />
          <TierInput type="spendingTiers" tier="Silver" label="Silver" value={localSettings.spendingTiers.Silver} onChange={handleTierChange} />
          <TierInput type="spendingTiers" tier="Gold" label="Gold" value={localSettings.spendingTiers.Gold} onChange={handleTierChange} />
          <TierInput type="spendingTiers" tier="Platinum" label="Platinum" value={localSettings.spendingTiers.Platinum} onChange={handleTierChange} />
        </div>
      </Card>

      <Card>
        <h3 className="setting-title">Points Tiers</h3>
        <p className="setting-description">Set the minimum points balance required for each tier.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <TierInput type="pointsTiers" tier="Bronze" label="Bronze" value={localSettings.pointsTiers.Bronze} onChange={handleTierChange} />
          <TierInput type="pointsTiers" tier="Silver" label="Silver" value={localSettings.pointsTiers.Silver} onChange={handleTierChange} />
          <TierInput type="pointsTiers" tier="Gold" label="Gold" value={localSettings.pointsTiers.Gold} onChange={handleTierChange} />
          <TierInput type="pointsTiers" tier="Platinum" label="Platinum" value={localSettings.pointsTiers.Platinum} onChange={handleTierChange} />
        </div>
      </Card>

      <Card>
        <h3 className="setting-title">Tier Discounts</h3>
        <p className="setting-description">Set the discount percentage for each spending tier.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <TierInput type="discounts" tier="Bronze" label="Bronze" value={localSettings.discounts.Bronze} onChange={handleTierChange} isPercent/>
          <TierInput type="discounts" tier="Silver" label="Silver" value={localSettings.discounts.Silver} onChange={handleTierChange} isPercent/>
          <TierInput type="discounts" tier="Gold" label="Gold" value={localSettings.discounts.Gold} onChange={handleTierChange} isPercent/>
          <TierInput type="discounts" tier="Platinum" label="Platinum" value={localSettings.discounts.Platinum} onChange={handleTierChange} isPercent/>
        </div>
      </Card>

      <div className="flex justify-end mt-8">
        <button onClick={handleSave} className="btn-primary">
          Save Settings
        </button>
      </div>

      <style>{`
        .setting-title {
          font-size: 1.5rem;
          color: #000000; 
        }
        .setting-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
};
