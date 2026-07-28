import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Settings, Shield, ShieldAlert, Users, 
  ArrowLeft, ArrowRight, Check, Sparkles, Key, 
  Calendar, DollarSign, HelpCircle, Eye, EyeOff
} from 'lucide-react';
import { DEFAULT_LEAGUE_RULES, DEFAULT_LEAGUE_TIERS, generateJoinCode } from '../data/competitionConfig';
import { ATHLETES_DATA, SEED_EVENTS, COMPETITION_DAYS, DRAFT_ANALYTICS } from '../data/seedData';

// Available competitions (Phase 2 default list)
const COMPETITIONS = [
  { id: 'crossfit-games-2026', name: 'CrossFit Games 2026', athleteCount: 60, status: 'active' }
];

export default function LeagueWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showAdminPw, setShowAdminPw] = useState(false);
  const [showSitePw, setShowSitePw] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Competition
    competitionId: 'crossfit-games-2026',
    
    // Step 2: Gym/Org
    gymName: '',
    gymSlug: '',
    leagueName: '',
    
    // Step 3: Rules
    salaryCap: DEFAULT_LEAGUE_RULES.salaryCap,
    rosterMin: DEFAULT_LEAGUE_RULES.rosterMin,
    rosterMax: DEFAULT_LEAGUE_RULES.rosterMax,
    insuranceMaxPrice: DEFAULT_LEAGUE_RULES.insuranceMaxPrice,
    movingDayMultiplier: DEFAULT_LEAGUE_RULES.movingDayMultiplier,
    lovelyTimeBonus100: DEFAULT_LEAGUE_RULES.lovelyTimeBonus100,
    lovelyTimeBonus50: DEFAULT_LEAGUE_RULES.lovelyTimeBonus50,
    
    // Step 4: Tiers
    tiers: {
      free: { enabled: true, name: 'Free League', price: 0, minCoaches: 0 },
      paid2: { enabled: true, name: '£2 Buy-In League', price: 2, minCoaches: 5 },
      paid5: { enabled: true, name: '£5 Buy-In League', price: 5, minCoaches: 5 }
    },
    
    // Step 5: Security & Passwords
    organizers: 'Gym Admin',
    lockDeadline: '2026-07-20',
    sitePassword: 'nobeef',
    adminPassword: 'nobeef2026',
    joinCode: generateJoinCode()
  });

  const [errors, setErrors] = useState({});

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-generate slugs and names where logical
      if (name === 'gymName') {
        updated.gymSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        updated.leagueName = `${value} Fantasy League`;
      }
      return updated;
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNumberChange = (name, val) => {
    setFormData(prev => ({ ...prev, [name]: Number(val) }));
  };

  const toggleTier = (tierKey) => {
    setFormData(prev => {
      const updatedTiers = { ...prev.tiers };
      updatedTiers[tierKey] = {
        ...updatedTiers[tierKey],
        enabled: !updatedTiers[tierKey].enabled
      };
      return { ...prev, tiers: updatedTiers };
    });
  };

  const handleTierDetailChange = (tierKey, field, val) => {
    setFormData(prev => {
      const updatedTiers = { ...prev.tiers };
      updatedTiers[tierKey] = {
        ...updatedTiers[tierKey],
        [field]: field === 'name' ? val : Number(val)
      };
      return { ...prev, tiers: updatedTiers };
    });
  };

  const validateStep = () => {
    const stepErrors = {};
    if (step === 2) {
      if (!formData.gymName.trim()) stepErrors.gymName = 'Gym name is required';
      if (!formData.gymSlug.trim()) stepErrors.gymSlug = 'Gym slug path is required';
      if (!formData.leagueName.trim()) stepErrors.leagueName = 'League title is required';
    }
    if (step === 5) {
      if (!formData.organizers.trim()) stepErrors.organizers = 'Organizer details are required';
      if (!formData.lockDeadline) stepErrors.lockDeadline = 'Lock deadline date is required';
      if (!formData.sitePassword.trim()) stepErrors.sitePassword = 'Site password is required';
      if (!formData.adminPassword.trim()) stepErrors.adminPassword = 'Admin password is required';
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    // Build the competition data (in Phase 2 we use the seedData as fallback for default competition)
    const activeComp = COMPETITIONS.find(c => c.id === formData.competitionId);

    const newLeague = {
      id: `${formData.gymSlug}_${formData.competitionId}`,
      gymId: formData.gymSlug,
      gymSlug: formData.gymSlug,
      gymName: formData.gymName,
      competitionId: formData.competitionId,
      competitionSlug: formData.competitionId,
      competitionName: activeComp ? activeComp.name : 'Custom Competition',
      leagueName: formData.leagueName,
      tagline: 'Custom Edition',
      organizers: formData.organizers,
      lockDeadline: new Date(formData.lockDeadline).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      subtitle: 'Coach Dashboard • Live Standings • Custom Rules Configured',
      joinCode: formData.joinCode,
      sitePassword: formData.sitePassword.trim().toLowerCase(),
      adminPassword: formData.adminPassword.trim().toLowerCase(),

      rules: {
        salaryCap: formData.salaryCap,
        rosterMin: formData.rosterMin,
        rosterMax: formData.rosterMax,
        insuranceMaxPrice: formData.insuranceMaxPrice,
        movingDayMultiplier: formData.movingDayMultiplier,
        lovelyTimeBonus100: formData.lovelyTimeBonus100,
        lovelyTimeBonus50: formData.lovelyTimeBonus50,
        currency: '£',
        powerCards: DEFAULT_LEAGUE_RULES.powerCards,
        maxPowerCards: DEFAULT_LEAGUE_RULES.maxPowerCards
      },

      leagueTiers: {
        free: formData.tiers.free,
        paid2: formData.tiers.paid2,
        paid5: formData.tiers.paid5
      },

      // Copying default pools from selected seedData model
      athletes: ATHLETES_DATA,
      lockedTeams: [], // Starts empty! Coaches will join
      events: SEED_EVENTS,
      competitionDays: COMPETITION_DAYS,
      draftAnalytics: DRAFT_ANALYTICS
    };

    // Store league inside local storage list of custom leagues
    try {
      const existingLeagues = JSON.parse(localStorage.getItem('nobeef_custom_leagues') || '[]');
      // Overwrite if exists, otherwise add
      const idx = existingLeagues.findIndex(l => l.id === newLeague.id);
      if (idx >= 0) {
        existingLeagues[idx] = newLeague;
      } else {
        existingLeagues.push(newLeague);
      }
      localStorage.setItem('nobeef_custom_leagues', JSON.stringify(existingLeagues));

      // Redirect user directly to the new league path
      navigate(`/g/${formData.gymSlug}/${formData.competitionId}`);
    } catch (err) {
      console.error('Error saving custom league:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#121316] text-slate-100 font-sans py-12 px-4 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-xl w-full glass-card rounded-3xl p-6 md:p-8 border border-indigo-500/20 shadow-2xl relative z-10 space-y-6">
        
        {/* Step Indicator Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Step {step} of 6</span>
            <h1 className="font-display text-xl font-extrabold text-white uppercase tracking-wider mt-0.5">
              {step === 1 && 'Select Competition'}
              {step === 2 && 'Gym Details'}
              {step === 3 && 'Roster & Rules'}
              {step === 4 && 'League Tiers'}
              {step === 5 && 'Access & Secrets'}
              {step === 6 && 'Review & Publish'}
            </h1>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="text-xs font-bold text-slate-400 hover:text-white uppercase flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* STEP 1: Select Competition */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Choose the live sports competition for this fantasy league. Athletes, event schedule, and official score updates flow from this selection.
              </p>
              <div className="space-y-2">
                {COMPETITIONS.map(comp => (
                  <label 
                    key={comp.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition cursor-pointer ${
                      formData.competitionId === comp.id 
                        ? 'bg-indigo-500/10 border-indigo-500/60 text-white' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="competitionId" 
                        value={comp.id}
                        checked={formData.competitionId === comp.id}
                        onChange={() => setFormData(prev => ({ ...prev, competitionId: comp.id }))}
                        className="text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                      />
                      <div>
                        <span className="font-bold text-sm block uppercase tracking-wide text-white">{comp.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">{comp.athleteCount} Athletes Pool • Live score tracking</span>
                      </div>
                    </div>
                    <Trophy className="w-5 h-5 text-indigo-400" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Gym Details */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Give your local league an identity. The URL path is auto-generated based on the gym name you enter.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Gym / Organization Name</label>
                  <input
                    type="text"
                    name="gymName"
                    value={formData.gymName}
                    onChange={handleTextChange}
                    placeholder="e.g., CrossFit Colchester"
                    className={`w-full bg-slate-950 border ${errors.gymName ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'} rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition`}
                  />
                  {errors.gymName && <p className="text-rose-400 text-[10px] mt-1 font-bold">{errors.gymName}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">URL Path Slug</label>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 text-sm">
                    <span className="text-slate-500 font-mono select-none">nobeef.app/g/</span>
                    <input
                      type="text"
                      name="gymSlug"
                      value={formData.gymSlug}
                      onChange={handleTextChange}
                      placeholder="crossfit-colchester"
                      className="w-full bg-transparent border-none py-2.5 text-sm text-white focus:outline-none focus:ring-0 font-mono"
                    />
                  </div>
                  {errors.gymSlug && <p className="text-rose-400 text-[10px] mt-1 font-bold">{errors.gymSlug}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">League Title</label>
                  <input
                    type="text"
                    name="leagueName"
                    value={formData.leagueName}
                    onChange={handleTextChange}
                    placeholder="e.g., CrossFit Colchester CF Games League"
                    className={`w-full bg-slate-950 border ${errors.leagueName ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'} rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition`}
                  />
                  {errors.leagueName && <p className="text-rose-400 text-[10px] mt-1 font-bold">{errors.leagueName}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Roster & Rules */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-300">
                <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>Pre-loaded defaults match standard rules. Modify below if desired.</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Salary Cap Budget</label>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3">
                    <span className="text-slate-500 font-bold">£</span>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.salaryCap}
                      onChange={(e) => handleNumberChange('salaryCap', e.target.value)}
                      className="w-full bg-transparent border-none py-2 text-sm text-white focus:outline-none focus:ring-0 font-mono"
                    />
                    <span className="text-slate-500 font-bold">m</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Insurance Price Cap</label>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3">
                    <span className="text-slate-500 font-bold">≤ £</span>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.insuranceMaxPrice}
                      onChange={(e) => handleNumberChange('insuranceMaxPrice', e.target.value)}
                      className="w-full bg-transparent border-none py-2 text-sm text-white focus:outline-none focus:ring-0 font-mono"
                    />
                    <span className="text-slate-500 font-bold">m</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Min Squad Size</label>
                  <input
                    type="number"
                    value={formData.rosterMin}
                    onChange={(e) => handleNumberChange('rosterMin', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Max Squad Size</label>
                  <input
                    type="number"
                    value={formData.rosterMax}
                    onChange={(e) => handleNumberChange('rosterMax', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Moving Day Multiplier</label>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.movingDayMultiplier}
                      onChange={(e) => handleNumberChange('movingDayMultiplier', e.target.value)}
                      className="w-full bg-transparent border-none py-2 text-sm text-white focus:outline-none focus:ring-0 font-mono"
                    />
                    <span className="text-slate-500 font-bold">×</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">LT Override (100pt event)</label>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3">
                    <input
                      type="number"
                      value={formData.lovelyTimeBonus100}
                      onChange={(e) => handleNumberChange('lovelyTimeBonus100', e.target.value)}
                      className="w-full bg-transparent border-none py-2 text-sm text-white focus:outline-none focus:ring-0 font-mono"
                    />
                    <span className="text-slate-500 font-bold">pts</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: League Tiers */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Choose the buy-in options coaches can enroll in. Standings will separate into distinct sub-leaderboards.
              </p>

              <div className="space-y-3">
                {/* Free Tier */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm block uppercase tracking-wide text-white">🏆 Free League</span>
                    <span className="text-[10px] text-slate-500">Every coach is enrolled by default.</span>
                  </div>
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>

                {/* paid2 Tier */}
                <div className={`border rounded-xl p-4 transition ${formData.tiers.paid2.enabled ? 'bg-slate-950 border-slate-800' : 'bg-slate-900/30 border-slate-900 text-slate-500'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm block uppercase tracking-wide text-white">🥈 Paid Tier 1</span>
                      <span className="text-[10px] text-slate-400">Enable an optional side-bet buy-in.</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toggleTier('paid2')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition uppercase ${
                        formData.tiers.paid2.enabled ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {formData.tiers.paid2.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                  {formData.tiers.paid2.enabled && (
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-900">
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Buy-In Amount (£)</label>
                        <input
                          type="number"
                          value={formData.tiers.paid2.price}
                          onChange={(e) => handleTierDetailChange('paid2', 'price', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Min Coaches</label>
                        <input
                          type="number"
                          value={formData.tiers.paid2.minCoaches}
                          onChange={(e) => handleTierDetailChange('paid2', 'minCoaches', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* paid5 Tier */}
                <div className={`border rounded-xl p-4 transition ${formData.tiers.paid5.enabled ? 'bg-slate-950 border-slate-800' : 'bg-slate-900/30 border-slate-900 text-slate-500'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm block uppercase tracking-wide text-white">🥇 Paid Tier 2</span>
                      <span className="text-[10px] text-slate-400">Enable an alternative higher buy-in tier.</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toggleTier('paid5')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition uppercase ${
                        formData.tiers.paid5.enabled ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {formData.tiers.paid5.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                  {formData.tiers.paid5.enabled && (
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-900">
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Buy-In Amount (£)</label>
                        <input
                          type="number"
                          value={formData.tiers.paid5.price}
                          onChange={(e) => handleTierDetailChange('paid5', 'price', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Min Coaches</label>
                        <input
                          type="number"
                          value={formData.tiers.paid5.minCoaches}
                          onChange={(e) => handleTierDetailChange('paid5', 'minCoaches', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* STEP 5: Security & Passwords */}
          {step === 5 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Secure your league. The site password restricts roster viewing, while the admin password grants score inputs.
              </p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Organizers Names</label>
                    <input
                      type="text"
                      name="organizers"
                      value={formData.organizers}
                      onChange={handleTextChange}
                      placeholder="e.g., Team Sim & JJ"
                      className={`w-full bg-slate-950 border ${errors.organizers ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'} rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition`}
                    />
                    {errors.organizers && <p className="text-rose-400 text-[9px] mt-1 font-bold">{errors.organizers}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Rosters Lock Date</label>
                    <input
                      type="date"
                      name="lockDeadline"
                      value={formData.lockDeadline}
                      onChange={handleTextChange}
                      className={`w-full bg-slate-950 border ${errors.lockDeadline ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'} rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition font-mono`}
                    />
                    {errors.lockDeadline && <p className="text-rose-400 text-[9px] mt-1 font-bold">{errors.lockDeadline}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Site Entry Password</label>
                  <div className="relative">
                    <input
                      type={showSitePw ? 'text' : 'password'}
                      name="sitePassword"
                      value={formData.sitePassword}
                      onChange={handleTextChange}
                      placeholder="nobeef"
                      className={`w-full bg-slate-950 border ${errors.sitePassword ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'} rounded-xl pl-3 pr-10 py-2 text-xs text-white focus:outline-none transition font-mono`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSitePw(!showSitePw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showSitePw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {errors.sitePassword && <p className="text-rose-400 text-[9px] mt-1 font-bold">{errors.sitePassword}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">League Admin Password</label>
                  <div className="relative">
                    <input
                      type={showAdminPw ? 'text' : 'password'}
                      name="adminPassword"
                      value={formData.adminPassword}
                      onChange={handleTextChange}
                      placeholder="nobeef2026"
                      className={`w-full bg-slate-950 border ${errors.adminPassword ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'} rounded-xl pl-3 pr-10 py-2 text-xs text-white focus:outline-none transition font-mono`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPw(!showAdminPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showAdminPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {errors.adminPassword && <p className="text-rose-400 text-[9px] mt-1 font-bold">{errors.adminPassword}</p>}
                </div>

                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Auto-Generated League Join Code</div>
                  <div className="text-base font-black text-indigo-400 mt-0.5 tracking-wider font-mono">{formData.joinCode}</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Publish */}
          {step === 6 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Confirm your configuration before launching. You can change rules and schedules inside the Admin control panel later.
              </p>

              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500 uppercase font-semibold">Gym/Org</span>
                  <span className="text-white font-bold">{formData.gymName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500 uppercase font-semibold">URL Path</span>
                  <span className="text-indigo-400 font-bold font-mono">/g/{formData.gymSlug}/{formData.competitionId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500 uppercase font-semibold">Salary Limit</span>
                  <span className="text-white font-bold font-mono">£{formData.salaryCap}m</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500 uppercase font-semibold">Insurance limit</span>
                  <span className="text-white font-bold font-mono">≤ £{formData.insuranceMaxPrice}m</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500 uppercase font-semibold">Lock deadline</span>
                  <span className="text-white font-bold">{formData.lockDeadline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase font-semibold">Join Code</span>
                  <span className="text-emerald-400 font-mono font-bold tracking-wider">{formData.joinCode}</span>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[10px] text-amber-300 flex gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>By publishing, your URL becomes live. Coaches can join using your generated password and join code.</span>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex gap-3 pt-3 border-t border-slate-800">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs uppercase transition border border-slate-800 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase transition shadow-md shadow-indigo-500/10 flex items-center justify-center gap-1.5"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 bg-[#e8462f] hover:bg-[#ff6a4d] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs uppercase transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-1.5"
              >
                <span>Publish League</span>
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
