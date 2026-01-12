import React, { useState, useEffect, useRef } from 'react';

const formatPrice = (p) => 'Rp ' + parseInt(p).toLocaleString('id-ID');

const Typewriter = ({ text, speed = 15 }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            setDisplayedText(text.slice(0, i + 1));
            i++;
            if (i >= text.length) {
                clearInterval(timer);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return <>{displayedText.split('\n').map((line, i) => (
        <React.Fragment key={i}>
            {line}
            {i < displayedText.split('\n').length - 1 && <br />}
        </React.Fragment>
    ))}</>;
};

const AiRecommendationPage = ({ onBack, isWidget = false }) => {
    // State for Chat & Flow
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasStartedTyping, setHasStartedTyping] = useState(false);
    const [inputPlaceholder, setInputPlaceholder] = useState('Ketik pesan...');

    const chatEndRef = useRef(null);
    const inputRef = useRef(null);
    const hasWelcomed = useRef(false);
    const sessionId = useRef('sess-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9));

    // Auto-resize textarea when userInput changes
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';

            let contentHeight;
            if (userInput) {
                contentHeight = inputRef.current.scrollHeight;
            } else {
                // Heuristic for placeholder height
                // Assuming approx 45 chars per line for mobile/widget width
                const lines = Math.ceil((inputPlaceholder.length || 1) / 45);
                // 20px line height + 24px padding
                contentHeight = (lines * 20) + 24;
            }

            const newHeight = Math.max(contentHeight, 40);
            inputRef.current.style.height = newHeight + 'px';
        }
        // Switch logo based on input content
        if (userInput.trim().length > 0) {
            if (!hasStartedTyping) setHasStartedTyping(true);
        } else {
            if (hasStartedTyping) setHasStartedTyping(false);
        }
    }, [userInput, hasStartedTyping, inputPlaceholder]);

    // Initial Welcome Message
    useEffect(() => {
        if (!hasWelcomed.current) {
            addBotMessage('Halo! Aku asisten pesananmu. Ada yang bisa dibantu?', [
                { type: 'suggestion', text: 'Lihat Menu', icon: '🍽️' },
                { type: 'suggestion', text: 'Rekomendasi', icon: '✨' },
                { type: 'suggestion', text: 'Cara Pesan', icon: '❓' }
            ]);
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

        // --- MOCK INTERCEPTOR FOR DEMO ---
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('cara pesan')) {
            setTimeout(() => {
                setIsTyping(false);
                addBotMessage('Mudah kok! Berikut cara pesannya:\n1. Ketik menu yang mau dipesan (contoh: "Pesan 2 Kopi Susu")\n2. Atau klik "Lihat Menu" untuk memilih dari daftar.\n3. Ikuti langkah selanjutnya untuk pembayaran.\n\nAda yang mau ditanyakan lagi?');
            }, 600);
            return;
        }

        if (lowerMsg.includes('mulai')) {
            setTimeout(() => {
                setIsTyping(false);
                addBotMessage('Baik, mau makan di tempat atau bawa pulang?', [
                    { type: 'options', label: '🍽️ Makan di Tempat', value: 'Makan di Tempat' },
                    { type: 'options', label: '🥡 Bawa Pulang', value: 'Bawa Pulang' }
                ]);
            }, 600);
            return;
        }
        if (lowerMsg.includes('bayar') || lowerMsg.includes('payment')) {
            setTimeout(() => {
                setIsTyping(false);
                addBotMessage('Silakan pilih metode pembayaran yang diinginkan:', [
                    { type: 'options', label: '💵 Tunai / Cash', value: 'Tunai' },
                    { type: 'options', label: '📱 QRIS', value: 'QRIS' },
                    { type: 'options', label: '💳 Transfer Bank', value: 'Transfer' }
                ]);
            }, 600);
            return;
        }

        // --- MOCK FOR RECOMMENDATION BADGES ---
        if (lowerMsg.includes('rekomendasi')) {
            setTimeout(() => {
                setIsTyping(false);
                const mockData = [
                    {
                        "ui": {
                            "message_response": "Ini menu paling laris di toko kami! 🔥",
                            "items": [
                                {
                                    "id": "080ff04a-d55d-4a3e-84e6-b4eb5109a422",
                                    "name": "Dirty latte",
                                    "price": 20000,
                                    "imageUrl": "https://sixro-gun.sgp1.cdn.digitaloceanspaces.com/kedaimaster-demo/Screenshot from 2025-12-30 12-59-03.png",
                                    "category": "Drink",
                                    "badge": "🥇 Best Seller"
                                },
                                {
                                    "id": "2818ec65-15f4-4066-8a91-c2e71970daa8",
                                    "name": "Nasi ayam harapan",
                                    "price": 15000,
                                    "imageUrl": "https://sixro-gun.sgp1.cdn.digitaloceanspaces.com/kedaimaster-demo/Screenshot from 2025-12-30 12-59-19.png",
                                    "category": "Food",
                                    "badge": "🥈 Top 2"
                                },
                                {
                                    "id": "5151e8d2-aa1f-4765-a95a-d5a2e2dbd649",
                                    "name": "Americano",
                                    "price": 12000,
                                    "imageUrl": "https://sixro-gun.sgp1.cdn.digitaloceanspaces.com/kedaimaster-demo/Screenshot from 2025-12-30 12-58-50.png",
                                    "category": "Coffee",
                                    "badge": "🥉 Top 3"
                                }
                            ],
                            "message_ask": "Mau pesan yang mana?"
                        }
                    }
                ];

                const responseData = Array.isArray(mockData) ? mockData[0] : mockData;
                if (responseData && responseData.ui) {
                    const { message_response, items, message_ask } = responseData.ui;
                    if (message_ask) setInputPlaceholder(message_ask);
                    addBotMessage(message_response || '', items);
                }
            }, 800);
            return;
        }
        // --- MOCK FOR SERVICE TYPE ---
        if (lowerMsg.includes('pesan dirty latte')) {
            setTimeout(() => {
                setIsTyping(false);
                const mockData = [
                    {
                        "ui": {
                            "message_response": "Oke, Dirty latte nya less sugar ya! 🥛",
                            "items": [
                                {
                                    "id": "PICKUP",
                                    "name": "Bawa Pulang",
                                    "category": "SERVING_TYPE"
                                },
                                {
                                    "id": "DINE_IN",
                                    "name": "Makan di Sini",
                                    "category": "SERVING_TYPE"
                                }
                            ],
                            "message_ask": "Mau makan di tempat atau bawa pulang?"
                        }
                    }
                ];

                const responseData = Array.isArray(mockData) ? mockData[0] : mockData;
                if (responseData && responseData.ui) {
                    const { message_response, items, message_ask } = responseData.ui;
                    if (message_ask) setInputPlaceholder(message_ask);
                    addBotMessage(message_response || '', items);
                }
            }, 800);
            return;
        }
        // ---------------------------------

        try {
            const response = await fetch('https://auto.apps.kediritechnopark.com/webhook/api/v1/widget/interactive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, sessionId: sessionId.current }),
            });

            const rawData = await response.json();
            const data = Array.isArray(rawData) ? rawData[0] : rawData; // Handle Array Response

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


        // 1. SERVING TYPE (Dine In / Takeaway) - Special Category
        if (firstItem.category === 'SERVING_TYPE') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '8px' }}>
                    {items.map((opt, index) => (
                        <button
                            key={index}
                            style={{ background: '#fff', border: '1px solid #059669', borderRadius: '12px', padding: '12px', color: '#059669', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', width: '100%' }}
                            onClick={() => handleQuickAction(opt.name)}
                        >
                            {opt.name}
                        </button>
                    ))}
                </div>
            );
        }

        // 2. PAYMENT METHOD (Cash / QRIS) - Special Category
        if (firstItem.category === 'PAYMENT_METHOD') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '8px' }}>
                    {items.map((opt, index) => (
                        <button
                            key={index}
                            style={{ background: '#fff', border: '1px solid #059669', borderRadius: '12px', padding: '12px', color: '#059669', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', width: '100%' }}
                            onClick={() => handleQuickAction(opt.name)}
                        >
                            {opt.name}
                        </button>
                    ))}
                </div>
            );
        }

        // 2. PRODUCTS (Has price and name, but not qty/notes usually, or has category)
        if (firstItem.price && firstItem.imageUrl && !firstItem.qty) {
            const quantities = parseInputToQuantities(userInput);

            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                    {items.map((p, index) => {
                        const qty = quantities[p.name.toLowerCase()] || 0;
                        return (
                            <div key={p.id || index} className="ai-product-card" style={{ border: qty > 0 ? '1px solid #059669' : '1px solid #f1f5f9', background: qty > 0 ? '#f0fdfa' : '#fff' }}>
                                {p.badge && (
                                    <div style={{ position: 'absolute', top: '0', right: '0', background: '#fef3c7', color: '#b45309', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '0 0 0 8px', borderBottom: '1px solid #fcd34d', borderLeft: '1px solid #fcd34d' }}>
                                        {p.badge}
                                    </div>
                                )}
                                {p.imageUrl ? (
                                    <img src={p.imageUrl} alt={p.name} className="ai-product-image" />
                                ) : (
                                    <div style={{ fontSize: '24px' }}>🍽️</div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <div className="ai-product-name">{p.name}</div>
                                    <div className="ai-product-price">{formatPrice(p.price)}</div>
                                </div>

                                {qty > 0 ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', borderRadius: '10px', padding: '2px', border: '1px solid #e2e8f0' }}>
                                        <button style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#f1f5f9', color: '#1e293b', border: 'none', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }} onClick={(e) => { e.stopPropagation(); handleUpdateQty(p.name, -1); }}>-</button>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#059669', minWidth: '14px', textAlign: 'center' }}>{qty}</span>
                                        <button style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#f1f5f9', color: '#1e293b', border: 'none', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }} onClick={(e) => { e.stopPropagation(); handleUpdateQty(p.name, 1); }}>+</button>
                                    </div>
                                ) : (
                                    <button style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#f0fdfa', color: '#059669', border: 'none', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleUpdateQty(p.name, 1)}>+</button>
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
                <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', width: '100%', boxShadow: '0 6px 20px rgba(0,0,0,0.04)' }}>
                    <div style={{ marginBottom: '10px', fontWeight: '600', color: '#059669', fontSize: '14px' }}>Detail Pesanan:</div>
                    {items.map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', color: '#64748b' }}>
                            <span>{item.qty}x {item.name} {item.notes ? `(${item.notes})` : ''}</span>
                            <span>{formatPrice(item.price * item.qty)}</span>
                        </div>
                    ))}
                </div>
            );
        }

        // 4. SUGGESTIONS (Quick Actions)
        if (firstItem.type === 'suggestion') {
            return (
                <div className="ai-suggestion-grid">
                    {items.map((item, index) => (
                        <button
                            key={index}
                            className="ai-suggestion-btn"
                            onClick={() => handleQuickAction(item.text)}
                        >
                            <span style={{ fontSize: '16px' }}>{item.icon}</span>
                            <span>{item.text}</span>
                        </button>
                    ))}
                </div>
            );
        }

        // 5. OPTIONS (Quick Replies like Dine In / Takeaway)
        if (firstItem.type === 'options') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '8px' }}>
                    {items.map((opt, index) => (
                        <button
                            key={index}
                            style={{ background: '#fff', border: '1px solid #059669', borderRadius: '12px', padding: '12px', color: '#059669', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', width: '100%' }}
                            onClick={() => handleQuickAction(opt.value || opt.label)}
                        >
                            {opt.label}
                        </button>
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
        <div className={`ai-chat-container ${isWidget ? 'widget-mode' : ''}`}>
            <style>{`
                @keyframes pulseRing { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.3); opacity: 0; } }
                @keyframes wave { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                /* Responsive Styles - Mobile First */
                .ai-chat-container {
                    font-family: 'Inter', sans-serif;
                    height: 100dvh;
                    width: 100%;
                    max-width: 100%;
                    margin: 0 auto;
                    background: #fff;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    box-shadow: none;
                }
                .ai-chat-container.widget-mode {
                    height: 100%;
                    border-radius: 24px 24px 0 0;
                    overflow: visible;
                }
                
                /* Header */
                .ai-header {
                    background: linear-gradient(135deg, #059669, #064e3b);
                    padding: 20px 24px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    color: #fff;
                    box-shadow: 0 4px 20px rgba(6, 78, 59, 0.15);
                    z-index: 10;
                    border-radius: 24px 24px 0 0;
                    position: relative;
                }
                .ai-header-name {
                    font-weight: 800;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    letter-spacing: 0.5px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .ai-back-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                /* Content Area */
                .ai-content-area {
                    flex: 1;
                    overflow-y: auto;
                    background: #f8fafc;
                    display: flex;
                    flex-direction: column;
                    scrollbar-width: thin;
                    scrollbar-color: #e2e8f0 transparent;
                }
                .ai-content-area::-webkit-scrollbar {
                    width: 5px;
                }
                .ai-content-area::-webkit-scrollbar-track {
                    background: transparent;
                }
                .ai-content-area::-webkit-scrollbar-thumb {
                    background-color: #e2e8f0;
                    border-radius: 10px;
                }
                
                .ai-slide-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 16px;
                    animation: fadeIn 0.5s ease-out;
                }
                
                /* Bot Section */
                .ai-bot-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 16px;
                    width: 100%;
                }
                .ai-bot-avatar-large {
                    width: 80px;
                    height: 80px;
                    border-radius: 28px;
                    background: linear-gradient(135deg, #059669, #064e3b);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    box-shadow: 0 15px 35px rgba(6, 78, 59, 0.25);
                    overflow: hidden;
                    border: 3px solid #fff;
                }
                .ai-bot-bubble {
                    background: #fff;
                    padding: 16px 24px;
                    border-radius: 20px;
                    font-size: 15px;
                    color: #1e293b;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    max-width: 90%;
                    line-height: 1.6;
                    border: 1px solid #f1f5f9;
                    font-weight: 600;
                    word-break: break-word;
                    position: relative;
                }
                
                /* Dynamic Content */
                .ai-dynamic-content {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                /* Typing Screen */
                .ai-typing-screen {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.3s ease-out;
                }
                .ai-typing-avatar-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                }
                
                /* Input Area */
                .ai-input-area {
                    padding: 12px;
                    background: #fff;
                    border-top: 1px solid #f1f5f9;
                }
                .ai-input-form {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .ai-input-textarea {
                    width: 100%;
                    padding: 12px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    font-size: 14px;
                    outline: none;
                    background: #f8fafc;
                    line-height: 1.4;
                    box-sizing: border-box;
                    resize: none;
                    overflow: hidden;
                    min-height: 40px;
                    max-height: 100px;
                    font-family: inherit;
                    transition: all 0.2s ease;
                }
                .ai-input-textarea:focus {
                    background: #fff;
                    border-color: #059669;
                    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
                }
                .ai-send-btn {
                    width: 100%;
                    height: 44px;
                    border-radius: 12px;
                    background: #059669;
                    color: #fff;
                    border: none;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                .ai-send-btn:active {
                    transform: scale(0.98);
                    opacity: 0.9;
                }
                
                /* Product Cards */
                .ai-product-card {
                    background: #fff;
                    padding: 12px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border: 1px solid #f1f5f9;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                    position: relative;
                    overflow: hidden;
                    transition: all 0.2s ease;
                }
                .ai-product-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.06);
                    border-color: #e2e8f0;
                }
                .ai-product-card:active {
                    transform: scale(0.98);
                }
                .ai-product-image {
                    width: 50px;
                    height: 50px;
                    border-radius: 10px;
                    object-fit: cover;
                }
                .ai-product-name {
                    font-weight: 700;
                    font-size: 13px;
                    color: #1e293b;
                    margin-bottom: 2px;
                }
                .ai-product-price {
                    font-size: 12px;
                    color: #059669;
                    font-weight: 600;
                }
                
                /* Suggestion Buttons */
                .ai-suggestion-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    width: 100%;
                    justify-content: center;
                }
                .ai-suggestion-btn {
                    background: #fff;
                    border: 1px solid #f1f5f9;
                    border-radius: 12px;
                    padding: 10px 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                    color: #334155;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                    min-width: 100px;
                    justify-content: center;
                }
                .ai-suggestion-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
                    border-color: #e2e8f0;
                }
                .ai-suggestion-btn:active {
                    transform: scale(0.95);
                }
                
                /* Tablet & Desktop Responsive */
                @media (min-width: 480px) {
                    .ai-header {
                        padding: 14px 18px;
                        gap: 14px;
                    }
                    .ai-header-avatar {
                        width: 40px;
                        height: 40px;
                        border-radius: 12px;
                    }
                    .ai-header-name {
                        font-size: 15px;
                    }
                    .ai-back-btn {
                        width: 40px;
                        height: 40px;
                        border-radius: 12px;
                        font-size: 20px;
                    }
                    .ai-slide-container {
                        padding: 20px;
                    }
                    .ai-bot-avatar-large {
                        width: 70px;
                        height: 70px;
                        border-radius: 24px;
                        margin-bottom: 16px;
                    }
                    .ai-bot-bubble {
                        padding: 14px 20px;
                        font-size: 15px;
                        border-radius: 18px;
                    }
                    .ai-input-area {
                        padding: 14px;
                    }
                    .ai-input-textarea {
                        padding: 14px;
                        border-radius: 14px;
                    }
                    .ai-send-btn {
                        height: 46px;
                        border-radius: 14px;
                        font-size: 15px;
                    }
                    .ai-product-card {
                        padding: 14px;
                        border-radius: 18px;
                        gap: 14px;
                    }
                    .ai-product-image {
                        width: 56px;
                        height: 56px;
                        border-radius: 12px;
                    }
                    .ai-product-name {
                        font-size: 14px;
                    }
                    .ai-product-price {
                        font-size: 13px;
                    }
                    .ai-suggestion-btn {
                        padding: 12px 16px;
                        font-size: 13px;
                        border-radius: 14px;
                        min-width: 120px;
                    }
                }

                @media (min-width: 768px) {
                    .ai-chat-container.widget-mode {
                        border-radius: 24px;
                    }
                    .ai-input-area {
                        border-radius: 0 0 24px 24px;
                    }
                }
                
                /* Desktop Only - Centered layout (1280px+) */
                @media (min-width: 1280px) {
                    .ai-chat-container:not(.widget-mode) {
                        max-width: 900px; /* Increased width */
                        box-shadow: 0 0 60px rgba(0,0,0,0.08);
                        border-radius: 32px;
                        margin: 40px auto;
                        height: calc(100dvh - 80px);
                    }
                    .ai-chat-container.widget-mode {
                        height: 100%;
                        margin: 0;
                        max-width: 100%;
                    }
                    .ai-chat-container:not(.widget-mode) .ai-header {
                        padding: 24px 40px;
                        gap: 24px;
                        border-radius: 32px 32px 0 0;
                    }
                    .ai-chat-container.widget-mode .ai-header {
                        padding: 20px 24px;
                    }
                    .ai-chat-container:not(.widget-mode) .ai-header-name {
                        font-size: 20px;
                        gap: 12px;
                    }
                    .ai-chat-container:not(.widget-mode) .ai-header-status {
                        font-size: 16px;
                    }
                    .ai-chat-container:not(.widget-mode) .ai-slide-container {
                        padding: 60px; /* More padding */
                    }
                    .ai-chat-container:not(.widget-mode) .ai-bot-section {
                        margin-bottom: 60px;
                    }
                    .ai-chat-container:not(.widget-mode) .ai-bot-avatar-large {
                        width: 180px; /* HUGE Avatar */
                        height: 180px;
                        border-radius: 50px;
                        margin-bottom: 40px;
                        box-shadow: 0 25px 50px rgba(6, 78, 59, 0.3);
                    }
                    .ai-chat-container:not(.widget-mode) .ai-bot-bubble {
                        padding: 32px 48px; /* Huge bubble */
                        font-size: 24px; /* Big text */
                        border-radius: 32px;
                        max-width: 85%;
                        line-height: 1.6;
                        box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1);
                    }
                    .ai-chat-container:not(.widget-mode) .ai-input-area {
                        padding: 32px;
                    }
                    .ai-chat-container:not(.widget-mode) .ai-input-form {
                        gap: 20px;
                    }
                    .ai-chat-container:not(.widget-mode) .ai-input-textarea {
                        padding: 24px;
                        border-radius: 24px;
                        font-size: 18px;
                        max-height: 200px;
                    }
                    .ai-chat-container:not(.widget-mode) .ai-send-btn {
                        height: 64px;
                        border-radius: 24px;
                        font-size: 20px;
                    }
                    .ai-chat-container:not(.widget-mode) .ai-product-card {
                        padding: 24px;
                        border-radius: 28px;
                        gap: 24px;
                    }
                    .ai-chat-container:not(.widget-mode) .ai-product-image {
                        width: 100px;
                        height: 100px;
                        border-radius: 20px;
                    }
                    .ai-chat-container:not(.widget-mode) .ai-product-name {
                        font-size: 20px;
                        margin-bottom: 8px;
                    }
                    .ai-chat-container:not(.widget-mode) .ai-product-price {
                        font-size: 18px;
                    }
                    .ai-chat-container:not(.widget-mode) .ai-suggestion-grid {
                        gap: 20px;
                    }
                    .ai-chat-container:not(.widget-mode) .ai-suggestion-btn {
                        padding: 20px 32px; /* Big buttons */
                        font-size: 20px;
                        border-radius: 24px;
                        min-width: 200px;
                        gap: 16px;
                    }
                }
            `}</style>

            {/* Header */}
            <div className="ai-header">
                <button className="ai-back-btn" onClick={onBack}>
                    ←
                </button>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: '5', paddingRight: '120px' }}>
                    <div className="ai-header-name">
                        Asisten Pesanan
                    </div>
                </div>

                {/* Pop-out Logo: Perfectly aligned with header bottom to hide cut-off */}
                <img
                    src={hasStartedTyping ? "/kedaimaster-assets/catat.png" : "/kedaimaster-assets/mikirr.png"}
                    alt="Logo"
                    style={{
                        position: 'absolute',
                        bottom: '0', // Perfectly aligned with header bottom
                        right: '-10px',
                        width: '200px',
                        height: 'auto',
                        zIndex: '20',
                        filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.3))',
                        pointerEvents: 'none'
                    }}
                />

                {!isWidget && <button style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', position: 'relative', zIndex: '5' }}>⋮</button>}
            </div>

            {/* Content Area (Single Slide) */}
            <div className="ai-content-area">
                {isTyping ? (
                    <div className="ai-typing-screen">
                        <div className="ai-typing-avatar-wrapper">
                            <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '28px', border: '2px solid #059669', animation: 'pulseRing 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite' }}></div>
                            <div className="ai-bot-avatar-large">
                                <img src="/kedaimaster-assets/catat.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', padding: '12px 20px', background: '#f0fdfa', borderRadius: '20px', marginBottom: '16px' }}>
                            <span style={{ width: '10px', height: '10px', background: '#059669', borderRadius: '50%', animation: 'wave 1.3s linear infinite', animationDelay: '0s' }}></span>
                            <span style={{ width: '10px', height: '10px', background: '#059669', borderRadius: '50%', animation: 'wave 1.3s linear infinite', animationDelay: '0.15s' }}></span>
                            <span style={{ width: '10px', height: '10px', background: '#059669', borderRadius: '50%', animation: 'wave 1.3s linear infinite', animationDelay: '0.3s' }}></span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', letterSpacing: '0.5px' }}>Sedang memproses...</div>
                    </div>
                ) : (
                    lastMessage && (
                        <div className="ai-slide-container">
                            <div className="ai-bot-section">
                                <div className="ai-bot-avatar-large">
                                    <img src="/kedaimaster-assets/catat.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div className="ai-bot-bubble">
                                    {lastMessage.type === 'bot' ? (
                                        <Typewriter text={lastMessage.text} key={lastMessage.id} />
                                    ) : (
                                        lastMessage.text.split('\n').map((line, i) => (
                                            <React.Fragment key={i}>
                                                {line}
                                                {i < lastMessage.text.split('\n').length - 1 && <br />}
                                            </React.Fragment>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Dynamic Content (Categories, Products, etc.) */}
                            <div className="ai-dynamic-content">
                                {renderContent(lastMessage.content)}
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Input Area */}
            <div className="ai-input-area">
                <form onSubmit={handleSend} className="ai-input-form">
                    <textarea
                        ref={inputRef}
                        rows={1}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                        placeholder={inputPlaceholder}
                        className="ai-input-textarea"
                        disabled={isTyping}
                    />
                    <button type="submit" className="ai-send-btn" style={{ opacity: isTyping ? 0.7 : 1 }} disabled={isTyping}>
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
        padding: '16px 24px',
        borderRadius: '20px',
        fontSize: '16px',
        color: '#1e293b',
        textAlign: 'center',
        boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)',
        maxWidth: '90%',
        lineHeight: '1.5',
        border: '1px solid #f1f5f9',
        fontWeight: '500',
        wordBreak: 'break-word',
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
        fontSize: '14px',
        outline: 'none',
        background: '#f8fafc',
        lineHeight: '1.4',
        boxSizing: 'border-box',
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
    suggestionGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        width: '100%',
        justifyContent: 'center',
    },
    suggestionBtn: {
        background: '#fff',
        border: '1px solid #f1f5f9',
        borderRadius: '16px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        color: '#334155',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        minWidth: '140px',
        justifyContent: 'center',
    },
    optionsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
        marginTop: '8px',
    },
    optionBtn: {
        background: '#fff',
        border: '1px solid #059669',
        borderRadius: '12px',
        padding: '12px',
        color: '#059669',
        fontWeight: '600',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'center',
        width: '100%',
    },
    productBadge: {
        position: 'absolute',
        top: '0',
        right: '0',
        background: '#fef3c7',
        color: '#b45309',
        fontSize: '10px',
        fontWeight: '700',
        padding: '2px 8px',
        borderRadius: '0 0 0 8px',
        borderBottom: '1px solid #fcd34d',
        borderLeft: '1px solid #fcd34d',
    },
};

export default AiRecommendationPage;
