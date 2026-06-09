import React, { useState } from 'react';
import { X, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginModalProps {
    onSave: (name: string, id: string) => void;
    onClose: () => void;
    existingName: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSave, onClose, existingName }) => {
    const [name, setName] = useState(existingName);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // No existing name = mandatory first-visit login, hide the × close button
    const isFirstLogin = !existingName;

    const handleSubmit = async () => {
        const trimmed = name.trim();
        if (!trimmed) { setError('Please enter a display name.'); return; }
        if (trimmed.length < 2) { setError('Name must be at least 2 characters.'); return; }
        if (trimmed.length > 15) { setError('Max 15 characters.'); return; }

        setLoading(true);
        setError('');

        try {
            const { data: existing } = await supabase
                .from('players')
                .select('id, name')
                .eq('name', trimmed)
                .single();

            if (existing) {
                onSave(existing.name, existing.id);
                return;
            }

            const { data: created, error: insertError } = await supabase
                .from('players')
                .insert({ name: trimmed })
                .select('id, name')
                .single();

            if (insertError) throw insertError;
            onSave(created.name, created.id);
        } catch (err: any) {
            setError('Could not save. Check your connection and try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div
                className="w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden relative"
                style={{
                    background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                    border: '1px solid rgba(99,102,241,0.25)',
                }}
            >
                {/* Close button — hidden on first login, shown when changing name */}
                {!isFirstLogin && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                <div className="flex flex-col items-center pt-8 pb-5 px-6">
                    {/* 2048 logo */}
                    <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent select-none mb-1">
                        2048
                    </h1>

                    {/* Premium badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/40 mb-5">
                        <Sparkles className="w-2.5 h-2.5" />
                        Premium Edition
                    </span>

                    <div className="w-full h-px bg-white/10 mb-5" />

                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 self-start">
                        Your display name
                    </p>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
                        placeholder="e.g. TileWizard99"
                        maxLength={15}
                        autoFocus
                        className="w-full px-4 py-3 rounded-2xl text-sm font-semibold text-white placeholder-slate-500 outline-none transition-all duration-200 mb-1"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1.5px solid rgba(99,102,241,0.4)',
                            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3)',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.border = '1.5px solid rgba(139,92,246,0.7)';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15), inset 0 1px 4px rgba(0,0,0,0.3)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.border = '1.5px solid rgba(99,102,241,0.4)';
                            e.currentTarget.style.boxShadow = 'inset 0 1px 4px rgba(0,0,0,0.3)';
                        }}
                    />

                    {error ? (
                        <p className="text-xs text-rose-400 font-semibold self-start mb-3 mt-1 px-1">{error}</p>
                    ) : (
                        <p className="text-[10px] text-slate-500 self-start mb-4 mt-1 px-1">
                            Max 15 characters. Used on the leaderboard.
                        </p>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !name.trim()}
                        className="w-full py-3.5 rounded-2xl text-sm font-extrabold text-white transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                        style={{
                            background: loading || !name.trim()
                                ? 'rgba(99,102,241,0.4)'
                                : 'linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #a855f7 100%)',
                            boxShadow: loading || !name.trim()
                                ? 'none'
                                : '0 4px 20px rgba(99,102,241,0.4)',
                        }}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Saving...' : isFirstLogin ? 'Start Playing 🎮' : 'Update Name'}
                    </button>
                </div>

                <div className="px-6 pb-5 text-center">
                    <p className="text-[10px] text-slate-600">
                        A unique player ID will be created for your scores.
                    </p>
                </div>
            </div>
        </div>
    );
};
