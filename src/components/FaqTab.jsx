import React, { useState } from 'react';
import { HelpCircle, Flame, Sparkles, RefreshCw, Shield, Lock, Award, DollarSign, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

export default function FaqTab() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(prev => prev === idx ? null : idx);
  };

  const powerCardRules = [
    {
      icon: Flame,
      title: 'Moving Day Card (1.5× Multiplier)',
      desc: 'Multiplies one active athlete’s total earned points by 1.5× across an entire competition day. Useful on days with multiple events for high-volume scorers.'
    },
    {
      icon: Sparkles,
      title: 'Lovely Time Card (+50 / +25 Guaranteed Pts)',
      desc: 'Guarantees points regardless of workout performance. Proportional to event cap: 100-point events yield +50 guaranteed points; 50-point events yield +25 guaranteed points.'
    },
    {
      icon: RefreshCw,
      title: 'Hot Tag Card (1-Event Swap)',
      desc: 'Temporarily swaps an active squad athlete for an unpicked athlete of equal or lesser £ value for 1 specific event. Swap-in athlete must cost ≤ the athlete being swapped out.'
    },
    {
      icon: Lock,
      title: 'Anti-Stacking & Event Locking Rules',
      desc: 'You cannot play multiple Power Cards on the same athlete for the same event. All card selections lock automatically once an event start time passes.'
    }
  ];

  const faqs = [
    {
      cat: 'CARDS',
      q: 'How many Power Cards can a coach play per season?',
      a: 'Each coach receives 3 RX+ Power Cards (Moving Day, Lovely Time, Hot Tag). Each card can be played once per season.'
    },
    {
      cat: 'CARDS',
      q: 'What happens if an event start time passes before I submit my card?',
      a: 'Card assignments lock automatically at the official scheduled start time. Once locked, cards for that event cannot be changed or submitted.'
    },
    {
      cat: 'ROSTER',
      q: 'What is the salary cap and roster size requirement?',
      a: 'Each coach had an £11.5m budget to pick between 3 to 5 active athletes (Men & Women) from the official 60-competitor pool.'
    },
    {
      cat: 'ROSTER',
      q: 'How does the Insurance Policy backup pick work?',
      a: 'Each team designated 1 Insurance Athlete costing £2.0m or less. If an active squad member withdraws due to official injury or illness, the Insurance Athlete automatically replaces them from that event forward.'
    },
    {
      cat: 'SCORING',
      q: 'How are event scores calculated?',
      a: 'Points are awarded based on official CrossFit Games workout finishes (up to 100 pts for standard events, 50 pts for half-point workouts). Base event points are combined with Power Card boosts and bonus picks.'
    },
    {
      cat: 'SCORING',
      q: 'What are Analyst and Scout Bonus Picks?',
      a: 'Coaches submitted podium predictions (Analyst) and sleeper pick selections (Scout). Bonus points awarded by the admin panel are added directly to the total fantasy score.'
    }
  ];

  const filteredFaqs = activeCategory === 'ALL'
    ? faqs
    : faqs.filter(f => f.cat === activeCategory);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-zinc-800">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="w-7 h-7 text-red-500" />
          <h2 className="text-2xl sm:text-3xl font-black text-white font-athletic uppercase tracking-wider">
            League Rules & Official FAQ
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400 font-medium">
          Comprehensive guide to RX+ Power Cards, roster salary constraints, insurance policies, and scoring rules.
        </p>
      </div>

      {/* Power Card Detailed Rules Grid */}
      <div className="glass-card rounded-2xl p-5 border border-zinc-800">
        <h3 className="text-xl font-black text-white mb-4 font-athletic uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-red-500" />
          <span>RX+ Power Card Rules & Specifications</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {powerCardRules.map((rule, i) => {
            const Icon = rule.icon;
            return (
              <div key={i} className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-500 font-black text-lg font-athletic uppercase">
                  <Icon className="w-5 h-5 text-red-500 shrink-0" />
                  <span>{rule.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categorized FAQ Section */}
      <div className="glass-card rounded-2xl p-5 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-800">
          <h3 className="text-xl font-black text-white font-athletic uppercase tracking-wider">
            Frequently Asked Questions
          </h3>

          <div className="flex items-center gap-2">
            {['ALL', 'CARDS', 'ROSTER', 'SCORING'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-athletic uppercase transition-all ${
                  activeCategory === cat
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 font-extrabold text-sm sm:text-base text-white font-athletic uppercase tracking-wide hover:bg-zinc-800/50"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-mono border border-red-500/30">
                      {faq.cat}
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-red-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-zinc-300 font-medium border-t border-zinc-800/60 leading-relaxed bg-zinc-950/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
