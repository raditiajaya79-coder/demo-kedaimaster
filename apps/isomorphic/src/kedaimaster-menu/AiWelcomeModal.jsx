import React, { useState, useEffect } from 'react';
import { BookOpenIcon, SparklesIcon, TagIcon } from '@heroicons/react/24/solid';

const AiWelcomeModal = ({ onStartAi, bottomOffset = 24, style = {} }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowTooltip(true), 1200);
        const hideTimer = setTimeout(() => setShowTooltip(false), 15000);
        return () => {
            clearTimeout(timer);
            clearTimeout(hideTimer);
        };
    }, []);

    return (
        <div style={{
            position: 'fixed',
            bottom: typeof bottomOffset === 'number' ? `${bottomOffset}px` : bottomOffset,
            right: '24px',
            zIndex: 1000,
            transition: 'bottom 0.3s ease-in-out',
            ...style
        }}>
            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
            {showTooltip && (
                <div style={styles.tooltipContainer}>
                    <button onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }} style={styles.closeTooltip}>✕</button>
                    <div style={styles.tooltipHeader}>
                        <div style={{ ...styles.miniAvatar, overflow: 'hidden' }}>
                            <img src="/kedaimaster-assets/hubungi.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#064e3b' }}>Order Assistant</div>
                            <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>Tersedia Melayani</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.5', margin: '8px 0', fontWeight: '500' }}>
                        Halo! Ingin pesan menu segar atau butuh rekomendasi? Mari ngobrol!
                    </div>

                    <div style={styles.suggestionContainer}>
                        {[
                            { text: 'Lihat Menu', icon: <BookOpenIcon className="w-3 h-3" /> },
                            { text: 'Rekomendasi', icon: <SparklesIcon className="w-3 h-3" /> },
                            { text: 'Promo', icon: <TagIcon className="w-3 h-3" /> }
                        ].map((chip, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStartAi();
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#dcfce7';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#f0fdf4';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                                style={styles.suggestionChip}
                            >
                                <span style={{ display: 'flex', alignItems: 'center' }}>{chip.icon}</span> {chip.text}
                            </button>
                        ))}
                    </div>
                    <div style={styles.tooltipArrow} />
                </div>
            )}

            <button
                onClick={onStartAi}
                onMouseEnter={() => { setIsHovered(true); setShowTooltip(true); }}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    ...styles.floatingBtn,
                    transform: isHovered ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
                    boxShadow: isHovered ? '0 15px 35px rgba(6, 78, 59, 0.3)' : '0 10px 25px rgba(6, 78, 59, 0.2)',
                    overflow: 'hidden'
                }}
            >
                <img src="/kedaimaster-assets/hubungi.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
        </div>
    );
};

const styles = {
    floatingBtn: {
        width: '56px',
        height: '56px',
        borderRadius: '24px 24px 6px 24px',
        background: 'linear-gradient(135deg, #059669, #064e3b)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        animation: 'float 4s ease-in-out infinite',
        padding: 0,
    },
    tooltipContainer: {
        position: 'absolute',
        bottom: '86px',
        right: '0',
        background: '#ffffff',
        padding: '16px',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(6, 78, 59, 0.15)',
        width: '220px',
        animation: 'fadeIn 0.4s ease-out',
        border: '1px solid rgba(209, 250, 229, 1)',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    },
    miniAvatar: {
        width: '38px',
        height: '38px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #059669, #064e3b)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tooltipHeader: { display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '10px' },
    closeTooltip: { position: 'absolute', top: '14px', right: '14px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontSize: '14px' },
    tooltipArrow: { position: 'absolute', bottom: '-9px', right: '26px', width: '18px', height: '18px', background: '#ffffff', transform: 'rotate(45deg)', borderRight: '1px solid rgba(209, 250, 229, 1)', borderBottom: '1px solid rgba(209, 250, 229, 1)' },
    suggestionContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' },
    suggestionChip: {
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '16px',
        padding: '6px 12px',
        fontSize: '11px',
        color: '#166534',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
};

export default AiWelcomeModal;
