import React, { useState, useEffect, useRef } from 'react';

const formatPrice = (p) => 'Rp ' + parseInt(p).toLocaleString('id-ID');

const AiRecommendationPage = () => {
    // State for Chat & Flow
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [inputPlaceholder, setInputPlaceholder] = useState('Ketik pesan...');

    const chatEndRef = useRef(null);
    const inputRef = useRef(null);
    const hasWelcomed = useRef(false);
    const sessionId = useRef('sess-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9));

    // Initial Welcome Message
    useEffect(() => {
        if (!hasWelcomed.current) {
            addBotMessage('Halo! Aku asisten pesananmu. Ada yang bisa dibantu?');
            hasWelcomed.current = true;
        }
    }, []);

    const addBotMessage = (text, content = null) => {
        setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text, content }]);
    };

    const addUserMessage = (text) => {
        setMessages(prev => [...prev, { id: Date.now(), type: 'user', text }]);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const text = userInput.trim();
        addUserMessage(text);
        setUserInput('');
        setInputPlaceholder('Ketik pesan...'); // Reset placeholder on send

        await fetchAiResponse(text);
    };

    const handleQuickAction = async (text) => {
        addUserMessage(text);
        setInputPlaceholder('Ketik pesan...'); // Reset placeholder
        await fetchAiResponse(text);
    };

    // Helper to parse input string into a map of { "Item Name": quantity }
    const parseInputToQuantities = (input) => {
        if (!input) return {};
        const map = {};
        input.split(',').map(i => i.trim()).filter(i => i).forEach(item => {
            const match = item.match(/^(\d+)\s+(.+)$/);
            if (match) {
                const [_, qty, name] = match;
                map[name.toLowerCase()] = (map[name.toLowerCase()] || 0) + parseInt(qty);
            } else {
                map[item.toLowerCase()] = (map[item.toLowerCase()] || 0) + 1;
            }
        });
        return map;
    };

    const handleUpdateQty = (itemName, change) => {
        setUserInput((prev) => {
            // Re-parsing to preserve names is safer:
            let items = prev ? prev.split(',').map(i => i.trim()).filter(i => i) : [];
            let found = false;

            let updatedItems = items.map(item => {
                const match = item.match(/^(\d+)\s+(.+)$/);
                let name = item;
                let qty = 1;

                if (match) {
                    qty = parseInt(match[1]);
                    name = match[2];
                }

                if (name.toLowerCase() === itemName.toLowerCase()) {
                    found = true;
                    const finalQty = qty + change;
                    if (finalQty <= 0) return null; // Remove
                    return finalQty === 1 ? name : `${finalQty} ${name}`;
                }
                return item;
            }).filter(Boolean);

            // If adding new item (not found in loop)
            if (!found && change > 0) {
                updatedItems.push(change === 1 ? itemName : `${change} ${itemName}`);
            }

            return updatedItems.join(', ');
        });

        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const fetchAiResponse = async (message) => {
        setIsTyping(true);
        try {
            const response = await fetch('https://auto.apps.kediritechnopark.com/webhook/api/v1/widget/interactive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, sessionId: sessionId.current }),
            });

            const data = await response.json();

            // Artificial delay for better UX if response is too fast
            setTimeout(() => {
                setIsTyping(false);
                if (data && data.ui) {
                    const { message_response, items, message_ask } = data.ui;

                    // Set placeholder if message_ask exists
                    if (message_ask) {
                        setInputPlaceholder(message_ask);
                    }

                    addBotMessage(message_response || '', items);
                } else {
                    addBotMessage("Maaf, terjadi kesalahan pada sistem. Silakan coba lagi.");
                }
            }, 800);

        } catch (error) {
            console.error('Error fetching AI response:', error);
            setIsTyping(false);
            addBotMessage("Maaf, sepertinya ada gangguan koneksi. Bisa ulangi lagi?");
        }
    };

    // --- RENDER HELPERS ---
    const renderContent = (items) => {
        if (!items || items.length === 0) return null;

        // Detect content type based on the first item
        const firstItem = items[0];

        // 1. CATEGORIES
        if (firstItem.type === 'category') {
            return (
                <div style={styles.gridContainer}>
                    {items.map((cat, index) => (
                        <button key={index} style={styles.gridBtn} onClick={() => handleQuickAction(`Kategori: ${cat.name}`)}>
                            <span style={{ fontSize: '24px' }}>{cat.icon || '🍽️'}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>
            );
        }

        // 2. PRODUCTS (Has price and name, but not qty/notes usually, or has category)
        if (firstItem.price && firstItem.imageUrl && !firstItem.qty) {
            const quantities = parseInputToQuantities(userInput);

            return (
                <div style={styles.productList}>
                    <button style={styles.secondaryBtn} onClick={() => handleQuickAction('Ganti Kategori')}>
                        ← Pilih Kategori Lain
                    </button>
                    {items.map((p, index) => {
                        const qty = quantities[p.name.toLowerCase()] || 0;
                        return (
                            <div key={p.id || index} style={{ ...styles.productCard, border: qty > 0 ? '1px solid #059669' : '1px solid #f1f5f9', background: qty > 0 ? '#f0fdfa' : '#fff' }}>
                                {p.imageUrl ? (
                                    <img src={p.imageUrl} alt={p.name} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ fontSize: '28px' }}>🍽️</div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={styles.productName}>{p.name}</div>
                                    <div style={styles.productPrice}>{formatPrice(p.price)}</div>
                                </div>

                                {qty > 0 ? (
                                    <div style={styles.qtyControl}>
                                        <button style={styles.qtyBtn} onClick={(e) => { e.stopPropagation(); handleUpdateQty(p.name, -1); }}>-</button>
                                        <span style={styles.qtyText}>{qty}</span>
                                        <button style={styles.qtyBtn} onClick={(e) => { e.stopPropagation(); handleUpdateQty(p.name, 1); }}>+</button>
                                    </div>
                                ) : (
                                    <button style={styles.addBtn} onClick={() => handleUpdateQty(p.name, 1)}>+</button>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        }

        // 3. ORDER SUMMARY / CART ITEMS (Has qty)
        if (firstItem.qty) {
            return (
                <div style={styles.summaryCard}>
                    <div style={{ marginBottom: '10px', fontWeight: '600', color: '#059669' }}>Detail Pesanan:</div>
                    {items.map((item, index) => (
                        <div key={index} style={styles.summaryItem}>
                            <span>{item.qty}x {item.name} {item.notes ? `(${item.notes})` : ''}</span>
                            <span>{formatPrice(item.price * item.qty)}</span>
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    // --- MAIN RENDER LOGIC ---
    // Only show the LAST message
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

    return (
        <div style={styles.container}>
            <style>{`
                @keyframes pulseRing { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.3); opacity: 0; } }
                @keyframes wave { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
            `}</style>

            {/* Header */}
            <div style={styles.header}>
                <button style={styles.backBtn} onClick={() => window.history.back()}>←</button>
                <div style={styles.headerCenter}>
                    <div style={{ ...styles.aiAvatar, overflow: 'hidden' }}>
                        <img src="/kedaimaster-assets/catat.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={styles.headerText}>
                        <div style={styles.headerName}>Asisten Pesanan <span style={styles.aiBadge}>AI</span></div>
                        <div style={styles.headerStatus}>Online</div>
                    </div>
                </div>
                <button style={styles.menuBtn}>⋮</button>
            </div>

            {/* Content Area (Single Slide) */}
            <div style={styles.contentArea}>
                {isTyping ? (
                    <div style={styles.typingScreen}>
                        <div style={styles.typingAvatarWrapper}>
                            <div style={styles.typingRipple}></div>
                            <div style={{ ...styles.botAvatarLarge, overflow: 'hidden' }}>
                                <img src="/kedaimaster-assets/catat.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        </div>
                        <div style={styles.typingContainer}>
                            <span style={{ ...styles.typeDot, animationDelay: '0s' }}></span>
                            <span style={{ ...styles.typeDot, animationDelay: '0.15s' }}></span>
                            <span style={{ ...styles.typeDot, animationDelay: '0.3s' }}></span>
                        </div>
                        <div style={styles.typingText}>Sedang memproses...</div>
                    </div>
                ) : (
                    lastMessage && (
                        <div style={styles.slideContainer}>
                            <div style={styles.botSection}>
                                <div style={{ ...styles.botAvatarLarge, animation: 'float 3s ease-in-out infinite', overflow: 'hidden' }}>
                                    <img src="/kedaimaster-assets/catat.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={styles.botBubble}>
                                    {lastMessage.text.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            {i < lastMessage.text.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Content (Categories, Products, etc.) */}
                            <div style={styles.dynamicContent}>
                                {renderContent(lastMessage.content)}
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Input Area */}
            <div style={styles.inputArea}>
                <form onSubmit={handleSend} style={styles.inputForm}>
                    <textarea
                        ref={inputRef}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                        placeholder={inputPlaceholder}
                        style={styles.input}
                        disabled={isTyping}
                        rows={1}
                    />
                    <button type="submit" style={{ ...styles.sendBtn, opacity: isTyping ? 0.7 : 1 }} disabled={isTyping}>
                        {isTyping ? '...' : 'Kirim Pesan'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- STYLES ---
const styles = {
    container: {
        fontFamily: "'Inter', sans-serif",
        height: '100dvh',
        maxWidth: '768px',
        width: '100%',
        margin: '0 auto',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 0 50px rgba(0,0,0,0.05)',
    },
    header: {
        background: 'linear-gradient(135deg, #059669, #064e3b)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        color: '#fff',
        boxShadow: '0 4px 20px rgba(6, 78, 59, 0.15)',
        zIndex: 10,
    },
    backBtn: { width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px' },
    headerCenter: { flex: 1, display: 'flex', alignItems: 'center', gap: '12px' },
    aiAvatar: { width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    headerName: { fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
    aiBadge: { fontSize: '10px', background: '#fff', color: '#064e3b', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' },
    headerStatus: { fontSize: '12px', opacity: 0.9 },
    menuBtn: { background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' },

    contentArea: {
        flex: 1,
        overflowY: 'auto',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
    },
    slideContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px',
        animation: 'fadeIn 0.5s ease-out',
    },
    botSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '24px',
        width: '100%',
    },
    botAvatarLarge: {
        width: '80px',
        height: '80px',
        borderRadius: '28px',
        background: 'linear-gradient(135deg, #059669, #064e3b)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        boxShadow: '0 15px 35px rgba(6, 78, 59, 0.25)',
    },
    botBubble: {
        background: '#fff',
        padding: '20px 24px',
        borderRadius: '24px',
        fontSize: '16px',
        color: '#1e293b',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        maxWidth: '90%',
        lineHeight: '1.6',
        border: '1px solid #f1f5f9',
    },
    dynamicContent: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },

    // Typing Screen
    typingScreen: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.3s ease-out',
    },
    typingAvatarWrapper: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' },
    typingRipple: { position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '2px solid #059669', animation: 'pulseRing 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite' },
    typingContainer: { display: 'flex', gap: '8px', padding: '12px 20px', background: '#f0fdfa', borderRadius: '20px', marginBottom: '16px' },
    typeDot: { width: '10px', height: '10px', background: '#059669', borderRadius: '50%', animation: 'wave 1.3s linear infinite' },
    typingText: { fontSize: '14px', color: '#64748b', fontWeight: '500', letterSpacing: '0.5px' },

    // Content Styles
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px',
        width: '100%',
        maxWidth: '600px',
    },
    gridBtn: {
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '600',
        color: '#334155',
        transition: 'all 0.2s',
        boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
    },
    productList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
    },
    productCard: {
        background: '#fff',
        padding: '16px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        border: '1px solid #f1f5f9',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
    },
    productName: { fontWeight: '700', fontSize: '15px', color: '#1e293b', marginBottom: '4px' },
    productPrice: { fontSize: '14px', color: '#059669', fontWeight: '600' },
    addBtn: {
        width: '36px',
        height: '36px',
        borderRadius: '12px',
        background: '#f0fdfa',
        color: '#059669',
        border: 'none',
        fontSize: '22px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyControl: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#fff',
        borderRadius: '12px',
        padding: '2px',
        border: '1px solid #e2e8f0',
    },
    qtyBtn: {
        width: '28px',
        height: '28px',
        borderRadius: '8px',
        background: '#f1f5f9',
        color: '#1e293b',
        border: 'none',
        fontSize: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
    },
    qtyText: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#059669',
        minWidth: '16px',
        textAlign: 'center',
    },
    secondaryBtn: {
        width: '100%',
        padding: '12px',
        background: '#f1f5f9',
        color: '#475569',
        border: 'none',
        borderRadius: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        marginBottom: '8px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
    },
    summaryCard: {
        background: '#fff',
        padding: '24px',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        width: '100%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    },
    summaryItem: { display: 'flex', justifyContent: 'space-between', fontSize: '15px', marginBottom: '8px', color: '#64748b' },

    inputArea: {
        padding: '16px',
        background: '#fff',
        borderTop: '1px solid #f1f5f9',
    },
    inputForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    input: {
        width: '100%',
        padding: '16px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        fontSize: '15px',
        outline: 'none',
        background: '#f8fafc',
        resize: 'none',
        minHeight: '54px',
        fontFamily: 'inherit',
    },
    sendBtn: {
        width: '100%',
        height: '48px',
        borderRadius: '16px',
        background: '#059669',
        color: '#fff',
        border: 'none',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.2s',
    },
};

export default AiRecommendationPage;
