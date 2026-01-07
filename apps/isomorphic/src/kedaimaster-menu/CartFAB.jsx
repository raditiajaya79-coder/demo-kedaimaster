import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import CartFormPage from './CartFormPage';
// Impor getTransactionById
import { createTransaction, getTransactionById, cancelTransactionById } from '@/kedaimaster-api/transactionsApi';
import OrderDetails from './OrderDetails';

const CartFAB = ({ cart, onIncreaseQuantity, onDecreaseQuantity, onResetCart, isDeleteModalOpen, onVisibilityChange, onExpandChange, onHeightChange }) => {
    const [isCartExpanded, setIsCartExpanded] = useState(false);
    const [isEditingCart, setIsEditingCart] = useState(false);
    const [cartPage, setCartPage] = useState(1);
    const [isCheckOut, setIsCheckout] = useState(false);
    const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
    const [transactionList, setTransactionList] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Pilih Metode');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [orderNotes, setOrderNotes] = useState('');
    const [transactionStatus, setTransactionStatus] = useState(null);
    const [newestTransactionId, setNewestTransactionId] = useState(null);
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
    const [showOrderDetails, setShowOrderDetails] = useState(false);

    // State baru untuk polling pembayaran
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [isPaid, setIsPaid] = useState(false);

    const cartFabRef = useRef(null);
    const paymentDropdownRef = useRef(null);
    const pollIntervalRef = useRef(null); // Ref untuk menyimpan ID interval

    // ==============================
    // Hitung total
    // ==============================
    const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);


    // ==============================
    // Format waktu ke "YYYY-MM-DD HH:mm:ss"
    // ==============================
    const formatDateTime = (date) => {
        const pad = (num) => String(num).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    // ==============================
    // Restore transactionList dari localStorage
    // ==============================
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('transactionList') || '[]');
        setTransactionList(saved);
        if (saved.length > 0) setNewestTransactionId(saved[0].id);
    }, []);

    // ==============================
    // Handle klik luar FAB & dropdown
    // ==============================
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (cartFabRef.current && !cartFabRef.current.contains(event.target) && !isDeleteModalOpen) {
                setIsCartExpanded(false);
                setCartPage(1);
            }
            if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(event.target)) {
                setIsPaymentDropdownOpen(false);
            }
        };
        if (isCartExpanded || isPaymentDropdownOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        }
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isCartExpanded, isPaymentDropdownOpen, isDeleteModalOpen]);

    // ==============================
    // Reset kalau keranjang kosong
    // ==============================
    useEffect(() => {
        if (totalItems === 0 && !newestTransactionId) {
            setIsCartExpanded(false);
            setCartPage(1);
            setIsCheckout(false);
            setSelectedPaymentMethod('Pilih Metode');
            // Reset status pembayaran
            setIsPaid(false);
            setIsLoadingPayment(false);
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        }
    }, [totalItems]);
    useEffect(() => {
        let pollTimeout = null;
        let isCancelled = false;

        const pollTransactions = async () => {
            try {
                const saved = JSON.parse(localStorage.getItem('transactionList') || '[]');
                const activeTransactions = saved.filter(t => !t.paid && !t.canceled);

                if (activeTransactions.length === 0) {
                    console.log('✅ Tidak ada transaksi aktif untuk dipolling.');
                    return; // hentikan polling
                }

                console.log(`🔄 Polling ${activeTransactions.length} transaksi aktif...`);
                const updatedList = await Promise.all(
                    activeTransactions.map(async (transaction) => {
                        try {
                            const updated = await getTransactionById(transaction.id);
                            // kembalikan versi terbaru jika berhasil
                            return updated || transaction;
                        } catch (err) {
                            console.warn(`Gagal polling transaksi ${transaction.id}`, err);
                            return transaction; // biarkan data lama
                        }
                    })
                );

                // gabungkan hasil update dengan list lama
                const mergedList = saved.map(oldItem => {
                    const newItem = updatedList.find(u => u.id === oldItem.id);
                    if (!newItem) return oldItem;

                    return {
                        ...oldItem,           // simpan local flags
                        ...newItem,           // update dari server
                        userInitiatedCancel: oldItem.userInitiatedCancel || false, // tetap pertahankan
                    };
                });


                // hanya lanjut update state/localStorage jika komponen masih aktif
                if (!isCancelled) {
                    setTransactionList(mergedList);
                    localStorage.setItem('transactionList', JSON.stringify(mergedList));
                }

            } catch (error) {
                console.error('❌ Error saat polling transaksi:', error);
            } finally {
                // lakukan polling ulang setiap 20 detik (bisa ubah sesuai kebutuhan)
                if (!isCancelled) {
                    pollTimeout = setTimeout(pollTransactions, 20000);
                }
            }
        };

        pollTransactions(); // langsung jalan pertama kali

        // cleanup
        return () => {
            isCancelled = true;
            if (pollTimeout) clearTimeout(pollTimeout);
        };
    }, []);


    // ==============================
    // Buat transaksi
    // ==============================
    const handleCreateTransaction = async () => {
        setIsCreatingTransaction(true); // 🔥 Mulai loading

        const transactionData = {
            deviceTime: formatDateTime(new Date()),
            paymentType: selectedPaymentMethod === 'QRIS' ? 'CASHLESS' : 'CASH',
            servingType: 'PICKUP',
            notes: orderNotes,
            customerName,
            customerPhone,
            items: Object.values(cart).map((item) => ({
                productId: item.id,
                qty: item.quantity,
                unitPrice: item.price,
            })),
        };

        try {
            const response = await createTransaction(transactionData);

            const savedList = JSON.parse(localStorage.getItem('transactionList') || '[]');
            const updatedList = [response, ...savedList];
            localStorage.setItem('transactionList', JSON.stringify(updatedList));

            setNewestTransactionId(response.id);
            setTransactionStatus('success');
            setIsPaid(false);
            setIsLoadingPayment(true);
            onResetCart();
            setTransactionList(updatedList);
            setExpandedTransactionId(response.id);
            setCartPage(1); // 🔥 Langsung ke halaman pembayaran
        } catch (error) {
            console.error('Gagal membuat transaksi:', error);
            setTransactionStatus('failure');
            setCartPage(4);
        } finally {
            setIsCreatingTransaction(false); // 🔥 Selesai loading
        }
    };



    // ==============================
    // FAB tampil/hidden
    // ==============================
    const shouldHideFab =
        totalItems === 0 &&
        !newestTransactionId &&
        !transactionList.length > 0;

    useEffect(() => {
        if (onVisibilityChange) {
            onVisibilityChange(!shouldHideFab);
        }
    }, [shouldHideFab, onVisibilityChange]);

    useEffect(() => {
        if (onExpandChange) {
            onExpandChange(isCartExpanded);
        }
    }, [isCartExpanded, onExpandChange]);

    // ==============================
    // Monitor tinggi FAB
    // ==============================
    useEffect(() => {
        if (!cartFabRef.current || !onHeightChange) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.target === cartFabRef.current) {
                    // Gunakan offsetHeight untuk tinggi total termasuk padding/border jika box-sizing border-box
                    // atau contentRect.height jika ingin content only.
                    // Karena kita ingin posisi widget di atas *seluruh* elemen, offsetHeight lebih aman.
                    // Namun ResizeObserver biasanya memberikan contentRect.
                    // Kita bisa ambil entry.target.offsetHeight.
                    onHeightChange(entry.target.offsetHeight);
                }
            }
        });

        resizeObserver.observe(cartFabRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [onHeightChange]);

    const ChevronRightIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
    );

    // Ikon placeholder jika produk tidak punya gambar
    const PlaceholderIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white/30">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c.621 0 1.174-.457 1.299-1.071l1.932-9.283c.145-.699-.513-1.348-1.229-1.348H4.89M15 11.25a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
    );

    const TrashIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.397 0a48.108 48.108 0 0 1-3.478-.397m15.875 0A48.11 48.11 0 0 1 12 5.69m0 0a48.11 48.11 0 0 0-2.654-.317m2.654.317a48.11 48.11 0 0 1-2.654-.317" />
        </svg>
    );
    const [expandedTransactionId, setExpandedTransactionId] = useState(null);

    // Fungsi format waktu (dari kode Anda)
    const formatTime = (dateString) => {
        try {
            return new Date(dateString).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) { return "Clock"; }
    };

    // Fungsi untuk handle klik pembatalan
    const handleCancelOrder = async (transactionId) => {
        try {
            console.log("Batalkan pesanan:", transactionId);

            await cancelTransactionById(transactionId); // API cancel

            setTransactionList((prevList) => {
                const updated = prevList.map((t) =>
                    t.id === transactionId
                        ? { ...t, canceled: true, userInitiatedCancel: true }
                        : t
                );

                // Simpan juga di localStorage
                localStorage.setItem('transactionList', JSON.stringify(updated));

                return updated;
            });

            setExpandedTransactionId(null);
            alert('Transaksi berhasil dibatalkan.');
        } catch (error) {
            console.error('Gagal membatalkan pesanan:', error);
            alert('Gagal membatalkan pesanan, coba lagi.');
        }
    };


    // ==============================
    // PAGE 1: KERANJANG
    // ==============================
    const renderPage1 = () => (
        <div className={`${styles.cartPage1} ${cartPage === 1 ? styles.active : ''}`}>
            {totalItems ? (
                <>

                    <div className={styles.cartSummary} onClick={() => totalItems > 0 && setIsCartExpanded(!isCartExpanded)}>
                        <span className={styles.cartItemsCount}>{totalItems} item</span>
                        <div className={styles.cartTotalDisplay}>
                            <span className={styles.cartTotalPrice}>Rp {totalPrice.toLocaleString('id-ID')}</span>
                            <svg viewBox="0 0 34 34" style={{ fill: 'white', height: '30px' }}>
                                <path d="M9.79175 24.75C8.09591 24.75 6.72383 26.1375 6.72383 27.8333C6.72383 29.5292 8.09591 30.9167 9.79175 30.9167C11.4876 30.9167 12.8751 29.5292 12.8751 27.8333C12.8751 26.1375 11.4876 24.75 9.79175 24.75ZM0.541748 0.0833435V3.16668H3.62508L9.17508 14.8679L7.09383 18.645C6.84717 19.0767 6.70842 19.5854 6.70842 20.125C6.70842 21.8208 8.09591 23.2083 9.79175 23.2083H28.2917V20.125H10.4392C10.2234 20.125 10.0538 19.9554 10.0538 19.7396L10.1001 19.5546L11.4876 17.0417H22.973C24.1292 17.0417 25.1467 16.4096 25.6709 15.4538L31.1901 5.44834C31.3134 5.23251 31.3751 4.97043 31.3751 4.70834C31.3751 3.86043 30.6813 3.16668 29.8334 3.16668H7.03217L5.583 0.0833435H0.541748ZM25.2084 24.75C23.5126 24.75 22.1405 26.1375 22.1405 27.8333C22.1405 29.5292 23.5126 30.9167 25.2084 30.9167C26.9042 30.9167 28.2917 29.5292 28.2917 27.8333C28.2917 26.1375 26.9042 24.75 25.2084 24.75Z"></path>
                            </svg>
                        </div>
                    </div>

                    <div className={styles.cartPageHeader}>
                        <h3 className={styles.cartPageTitle}>Detail Pesanan</h3>
                        {totalItems > 0 && (
                            <button className={styles.editAllBtn} onClick={() => setIsEditingCart(!isEditingCart)}>
                                {isEditingCart ? 'Selesai' : 'Edit'}
                            </button>
                        )}
                    </div>

                    <div className={`${styles.cartItemsList} ${isEditingCart ? styles.isEditing : ''}`}>
                        {Object.keys(cart).length > 0 ? (
                            Object.values(cart).map(item => (
                                <div className={styles.cartListItem} key={item.id}>
                                    <div className={styles.cartItemView}>
                                        <span>{item.quantity}x {item.name}</span>
                                        <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className={styles.cartItemEdit}>
                                        <span>{item.name}</span>
                                        <div className={styles.quantityControlCart}>
                                            <button onClick={() => onDecreaseQuantity(item.id)}>-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => onIncreaseQuantity(item.id)}>+</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', margin: '20px 0', color: 'white' }}>Keranjangmu masih kosong.</p>
                        )}
                    </div>

                    <div className={styles.checkoutSection}>
                        <div className={`${styles.checkoutOption} ${isCheckOut ? styles.transitionActive : ''}`}>
                            <span className={styles.label}>Metode Pembayaran</span>
                            <div className={`${styles.dropdown} ${isPaymentDropdownOpen ? styles.open : ''}`} ref={paymentDropdownRef}>
                                <button className={styles.dropdownToggle} onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}>
                                    <span className={styles.selectedPaymentMethod}>{selectedPaymentMethod}</span>
                                    <svg width="12" height="12" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
                                </button>
                                <ul className={styles.dropdownMenu}>
                                    <li onClick={() => { setSelectedPaymentMethod('QRIS'); setIsPaymentDropdownOpen(false); }}>
                                        <img src="https://iconlogovector.com/uploads/images/2024/03/lg-65ffda68a47ee-QRIS.webp" alt="QRIS" /><span>QRIS</span>
                                    </li>
                                    <li onClick={() => { setSelectedPaymentMethod('Tunai'); setIsPaymentDropdownOpen(false); }}>
                                        <img src="https://static.vecteezy.com/system/resources/previews/002/368/708/non_2x/cash-icon-free-vector.jpg" alt="Tunai" /><span>Tunai</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <button
                            className={styles.cartActionButton}
                            onClick={() => {
                                if (!isCheckOut) { setIsCheckout(true); return; }
                                if (selectedPaymentMethod === 'Pilih Metode') {
                                    // Ganti alert dengan UI yang lebih baik jika ada
                                    alert('Silakan pilih metode pembayaran terlebih dahulu.');
                                    return;
                                }
                                setCartPage(2);
                            }}
                        >
                            {isCheckOut ? 'Checkout' : 'Lanjutkan ke Pembayaran'}
                        </button>
                    </div>

                </>
            ) : (
                <>

                    <div className={styles.cartSummary} onClick={() => setIsCartExpanded(!isCartExpanded)}>
                        <span className={styles.cartItemsCount}>Transaksi saya</span>
                        {/* <div style={{ width: '60px' }}></div> */}
                        {/* {isCartExpanded && (
                            <div
                                style={{ lineHeight: '2.7', height: '35px', cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation(); // Mencegah cartSummary menutup
                                    setShowCancelConfirmation(true);
                                }}
                            >
                                Lihat transaksi lain
                            </div>
                        )} */}
                    </div>

                    {/* List Transaksi (Kode Anda yang sudah dimodifikasi) */}
                    <div className={`[&>*:not(:last-child)]:mb-4 ${styles.cartItemsList} ${isEditingCart ? styles.isEditing : ''}`} style={{ marginBottom: 0 }}>
                        {transactionList.length > 0 ? (
                            transactionList.map(transaction => {

                                const firstProduct = transaction.transactionDetails[0]?.product;

                                // Cek apakah card ini yang sedang di-expand
                                const isExpanded = expandedTransactionId === transaction.id;

                                // Fungsi untuk toggle expand/collapse
                                const handleToggleExpand = () => {
                                    setExpandedTransactionId(isExpanded ? null : transaction.id);
                                };

                                return (
                                    // --- KITA BUNGKUS CARD DAN DETAILNYA DALAM SATU DIV ---
                                    <div
                                        key={transaction.id}
                                        className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden transition-all hover:bg-white/20"
                                    >
                                        {/* 1. HEADER CARD (YANG BISA DIKLIK) */}
                                        <div
                                            className="p-4 flex gap-4 cursor-pointer"
                                            onClick={handleToggleExpand}
                                        >
                                            {/* Bagian Gambar */}
                                            <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-white/10">
                                                {firstProduct?.imageUrl ? (
                                                    <img src={firstProduct.imageUrl} alt={firstProduct.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"><PlaceholderIcon /></div>
                                                )}
                                            </div>

                                            {/* Bagian Detail Transaksi */}
                                            <div className="flex flex-col justify-between flex-grow text-white min-w-0">
                                                {/* (Bagian Atas: Status & Waktu) */}
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="min-w-0">
                                                        {transaction.paid ? (
                                                            <span className="flex-shrink-0 bg-green-500/30 text-green-300 text-xs font-semibold px-3 py-1 rounded-full">
                                                                Transaksi Berhasil
                                                            </span>
                                                        ) : transaction.canceled ? (
                                                            transaction.userInitiatedCancel ? (
                                                                <span className="flex-shrink-0 bg-red-500/30 text-red-300 text-xs font-semibold px-3 py-1 rounded-full">
                                                                    Dibatalkan oleh Anda
                                                                </span>
                                                            ) : (
                                                                <span className="flex-shrink-0 bg-gray-500/30 text-gray-300 text-xs font-semibold px-3 py-1 rounded-full">
                                                                    Dibatalkan oleh Kasir
                                                                </span>
                                                            )
                                                        ) : (
                                                            <span className="flex-shrink-0 bg-yellow-500/30 text-yellow-300 text-xs font-semibold px-3 py-1 rounded-full animate-pulse">
                                                                Menunggu Pembayaran
                                                            </span>
                                                        )}


                                                        <p className="text-xs md:text-sm text-white/70 mt-1">
                                                            {formatTime(transaction.createdOn)}
                                                            <span className="mx-1.5">•</span>
                                                            {transaction.servingType}
                                                            <span className="mx-1.5">•</span>
                                                            {transaction.paymentType}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* (Bagian Bawah: Harga & Tombol Aksi) */}
                                                <div className="flex justify-between items-end mt-2">
                                                    <div>
                                                        <p className="text-sm text-white/70 -mb-1">Total</p>
                                                        <p className="text-lg md:text-xl font-bold">
                                                            Rp {transaction.total.toLocaleString('id-ID')}
                                                        </p>
                                                    </div>

                                                    {/* Tombol Chevron dengan animasi rotasi */}
                                                    <div className="bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center">
                                                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                                                            <ChevronRightIcon />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* --- 2. BAGIAN DETAIL (MUNCUL SAAT isExpanded) --- */}
                                        {isExpanded && (
                                            <div className="bg-white/5 p-4 border-t border-white/10">
                                                <h5 className="font-semibold mb-3 text-white">Detail Pesanan</h5>

                                                {/* List SEMUA produk dalam transaksi */}
                                                <div className="space-y-2 mb-4">
                                                    {transaction.transactionDetails.map((detail, index) => (
                                                        <div key={index} className="flex justify-between items-center text-sm">
                                                            <span className="text-white/90">{detail.product.name} x {detail.qty}</span>
                                                            <span className="text-white/70">Rp {detail.amount.toLocaleString('id-ID')}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {((!transaction.paid && !transaction.canceled) || transaction.notes) &&
                                                    <>
                                                        <hr className="border-white/10 my-3" />

                                                        {/* Info Tambahan */}

                                                        <div className="text-base text-white/60 space-y-1 mb-4">

                                                            {!transaction.paid && !transaction.canceled &&
                                                                <p><span className="font-medium">Silakan lakukan pembayaran di kasir atas nama </span>{transaction.customerName}</p>
                                                            }
                                                            {transaction.notes && <p><span className="font-medium">Catatan:</span> {transaction.notes}</p>}
                                                        </div>
                                                    </>
                                                }
                                                {/* Tombol Batalkan Pesanan (hanya muncul jika belum bayar) */}
                                                {!transaction.paid && !transaction.canceled &&
                                                    <button
                                                        className={`w-full bg-red-500/80 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all`}
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Mencegah card tertutup lagi
                                                            handleCancelOrder(transaction.id);
                                                        }}
                                                    >
                                                        <TrashIcon />
                                                        <span>Batalkan Pesanan</span>
                                                    </button>
                                                }
                                            </div>
                                        )}

                                        <style jsx>{`
                                            @keyframes fadeout {
                                            0% { opacity: 1; }
                                            90% { opacity: 1; }
                                            100% { opacity: 0; }
                                            }

                                            .animate-fadeout {
                                            animation: fadeout 1s ease forwards;
                                            }`}
                                        </style>
                                        {transaction.paid &&
                                            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-white bg-[#87b18feb] animate-fadeout"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="60"
                                                    height="60"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="white"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="checkmark"
                                                >
                                                    <path className="circle" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                    <polyline className="check" points="22 4 12 14.01 9 11.01"></polyline>
                                                </svg>

                                                <h4
                                                    style={{
                                                        color: 'white',
                                                        marginTop: '15px',
                                                        marginBottom: '0',
                                                        fontSize: '1.4rem',
                                                    }}
                                                >
                                                    Pembayaran Berhasil!
                                                </h4>
                                                <p style={{ marginTop: '10px', fontSize: '1.1rem' }}>
                                                    Pesananmu akan segera diproses.
                                                </p>

                                                <style jsx>{`
                            .circle,
                            .check {
                            stroke-dasharray: 100;
                            stroke-dashoffset: 100;
                            animation-timing-function: ease-in-out;
                            }

                            .check {
                            stroke-dasharray: 30;
                            stroke-dashoffset: 30;
                            animation: drawCheck 3s infinite;
                            }

                            .circle {
                            animation: drawCircle 3s infinite;
                            animation-delay: 0.5s; /* circle mulai sedikit setelah check */
                            }

                            @keyframes drawCheck {
                            0% {
                                stroke-dashoffset: 30; /* belum terlihat */
                            }
                            15% {
                                stroke-dashoffset: 0; /* muncul cepat di awal */
                            }
                            70% {
                                stroke-dashoffset: 0; /* tetap terlihat */
                            }
                            100% {
                                stroke-dashoffset: 30; /* hilang belakangan setelah circle */
                            }
                            }

                            @keyframes drawCircle {
                            0%,
                            10% {
                                stroke-dashoffset: 100; /* belum terlihat */
                            }
                            40% {
                                stroke-dashoffset: 0; /* muncul */
                            }
                            80% {
                                stroke-dashoffset: 0; /* tetap terlihat */
                            }
                            95%,
                            100% {
                                stroke-dashoffset: 100; /* hilang duluan sebelum check hilang */
                            }
                            }
                        `}</style>
                                            </div>
                                        }
                                    </div>
                                )
                            })
                        ) : (
                            // State jika tidak ada transaksi
                            <div className="text-center p-10 bg-white/5 rounded-2xl">
                                <p className="text-white/70">Tidak ada transaksi.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );

    // ==============================
    // PAGE 2: FORM PEMESANAN
    // ==============================
    const renderPage2 = () => (
        <div className={`${styles.cartPage2} ${cartPage === 2 ? styles.active : ''}`}>
            <CartFormPage
                icon="/kedaimaster-assets/catat.png"
                title="Detail Pemesan"
                fields={[
                    { placeholder: 'Masukkan nama Anda', value: customerName, onChange: (e) => setCustomerName(e.target.value) },
                    { type: 'tel', placeholder: 'Masukkan nomor WA', value: customerPhone, onChange: (e) => setCustomerPhone(e.target.value) },
                    { type: 'text', placeholder: 'Catatan tambahan (opsional)', value: orderNotes, onChange: (e) => setOrderNotes(e.target.value), required: false },
                ]}
                buttonText="Pesan"
                onSubmit={handleCreateTransaction}
                onBack={() => setCartPage(1)}
                isLoading={isCreatingTransaction}

            />
        </div>
    );

    // ==============================
    // PAGE 4: STATUS TRANSAKSI (GAGAL)
    // ==============================
    const renderPageStatus = () => (
        <div className={`${styles.cartPage4} ${cartPage === 4 ? styles.active : ''}`}>
            <CartFormPage
                icon={transactionStatus === 'success' // Ini sepertinya tidak akan pernah 'success' di page 4
                    ? "/kedaimaster-assets/hubungi.png"
                    : "/kedaimaster-assets/maaf.png"}
                title={transactionStatus === 'success' ? "Transaksi Berhasil" : "Transaksi Gagal"}
                description={transactionStatus === 'success'
                    ? "Kita bakal hubungi kalo pesananmu dah siap"
                    : "Terjadi kesalahan, silakan coba lagi."}
                buttonText="OK"
                onSubmit={() => setCartPage(1)} // Kembali ke keranjang
            />
            {transactionStatus === 'success' && (
                <button
                    className={styles.cartActionButton}
                    onClick={() => {
                        setCartPage(3); // Arahkan ke halaman detail/pembayaran
                        setShowOrderDetails(true);
                    }}
                >
                    Lihat Detail Pesanan
                </button>
            )}
        </div>
    );

    // ==============================
    // PAGE 3: PEMBAYARAN & POLLING
    // ==============================
    const renderPage3 = () => (
        <div className={`${styles.cartPage3} ${cartPage === 3 ? styles.active : ''}`}>
            {showCancelConfirmation ? (
                <>
                    <div className={styles.cartPageHeader}>
                        <button
                            className={styles.cartBackBtn}
                            onClick={() => setShowCancelConfirmation(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                        <h3 className={styles.cartPageTitle}>Konfirmasi</h3>
                        <div style={{ width: '24px' }}></div>
                    </div>

                    <div className={styles.paymentDetails}>
                        <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                            Mau batalkan pesanan ini?
                        </p>
                    </div>

                    <button
                        className={styles.cartActionButton}
                        style={{ marginBottom: '15px', backgroundColor: '#e74c3c' }} // Warna merah untuk batalkan
                        onClick={() => {
                            setShowCancelConfirmation(false);
                            setCartPage(1); // Perbaikan: Kembali ke keranjang (page 1)
                            setIsLoadingPayment(false);
                            setIsPaid(false);
                            if (pollIntervalRef.current) { // Hentikan polling
                                clearInterval(pollIntervalRef.current);
                                pollIntervalRef.current = null;
                            }
                            onResetCart(); // Asumsi membatalkan = reset keranjang
                            setNewestTransactionId(null); // Hapus ID transaksi
                        }}
                    >
                        Ya, Batalkan Pesanan
                    </button>

                    <button
                        className={styles.cartActionButton}
                        onClick={() => setShowCancelConfirmation(false)}
                    >
                        Tidak
                    </button>
                </>
            ) : showOrderDetails ? (
                <OrderDetails
                    cart={cart}
                    customerName={customerName}
                    customerPhone={customerPhone}
                    orderNotes={orderNotes}
                    totalPrice={totalPrice}
                    onBack={() => setShowOrderDetails(false)} // Kembali ke page 3 (akan menampilkan status 'isPaid' lagi)
                />
            ) : (
                <>
                    {isPaid ? (
                        <div
                            style={{
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                padding: '20px 0',
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="60"
                                height="60"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="checkmark"
                            >
                                <path className="circle" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline className="check" points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>

                            <h4
                                style={{
                                    color: 'white',
                                    marginTop: '15px',
                                    marginBottom: '0',
                                    fontSize: '1.4rem',
                                }}
                            >
                                Pembayaran Berhasil!
                            </h4>
                            <p style={{ marginTop: '10px', fontSize: '1.1rem' }}>
                                Pesananmu akan segera diproses.
                            </p>

                            <style jsx>{`
                            .circle,
                            .check {
                            stroke-dasharray: 100;
                            stroke-dashoffset: 100;
                            animation-timing-function: ease-in-out;
                            }

                            .check {
                            stroke-dasharray: 30;
                            stroke-dashoffset: 30;
                            animation: drawCheck 3s infinite;
                            }

                            .circle {
                            animation: drawCircle 3s infinite;
                            animation-delay: 0.5s; /* circle mulai sedikit setelah check */
                            }

                            @keyframes drawCheck {
                            0% {
                                stroke-dashoffset: 30; /* belum terlihat */
                            }
                            15% {
                                stroke-dashoffset: 0; /* muncul cepat di awal */
                            }
                            70% {
                                stroke-dashoffset: 0; /* tetap terlihat */
                            }
                            100% {
                                stroke-dashoffset: 30; /* hilang belakangan setelah circle */
                            }
                            }

                            @keyframes drawCircle {
                            0%,
                            10% {
                                stroke-dashoffset: 100; /* belum terlihat */
                            }
                            40% {
                                stroke-dashoffset: 0; /* muncul */
                            }
                            80% {
                                stroke-dashoffset: 0; /* tetap terlihat */
                            }
                            95%,
                            100% {
                                stroke-dashoffset: 100; /* hilang duluan sebelum check hilang */
                            }
                            }
                        `}</style>
                        </div>

                    ) : (
                        <>
                            <div className={styles.cartPageHeader}>
                                <h3 className={styles.cartPageTitle}><style>{`
                                .spinner-fab {
                                    border: 4px solid rgba(255,255,255,0.3);
                                    border-radius: 50%;
                                    border-top: 4px solid #fff;
                                    width: 28px;
                                    height: 28px;
                                    animation: spin-fab 1s linear infinite;
                                    margin-right: 10px;
                                }
                                @keyframes spin-fab {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}</style>
                                    <div className="spinner-fab"></div>
                                    Menunggu Pembayaran
                                </h3>
                                {(isPaid || isLoadingPayment) && <div style={{ width: '60px' }}></div>}
                                {!isPaid && isLoadingPayment && (
                                    <div
                                        style={{ lineHeight: '2.7', height: '35px', cursor: 'pointer' }}
                                        onClick={() => setShowCancelConfirmation(true)}
                                    >
                                        Batalkan
                                    </div>
                                )}
                            </div>
                            <div className={styles.paymentDetails}>
                                {selectedPaymentMethod === 'QRIS' ? (
                                    <>
                                        <p>Silakan pindai kode QRIS di bawah ini</p>
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${newestTransactionId}`}
                                            alt="QR Code"
                                        />
                                        <p className={styles.totalAmount}>
                                            Total: Rp {totalPrice.toLocaleString('id-ID')}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p>Silakan lakukan pembayaran di kasir sebesar</p>
                                        <p className={styles.totalAmount}>
                                            Rp {totalPrice.toLocaleString('id-ID')}
                                        </p>
                                        <p>atas nama <span>{customerName}</span></p>
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    {/* Tombol di bawah */}
                    {isPaid ? (
                        <>
                            <button
                                className={styles.cartActionButton}
                                onClick={() => setShowOrderDetails(true)} // Tampilkan detail
                            >
                                Lihat Detail Pesanan
                            </button>
                            <button
                                className={styles.cartActionButton}
                                style={{ marginTop: '10px' }}
                                onClick={() => {
                                    setCartPage(1); // Balik ke keranjang
                                    setIsPaid(false); // Reset status
                                    onResetCart(); // Reset keranjang setelah lunas
                                    setNewestTransactionId(null); // Reset ID
                                }}
                            >
                                Tutup
                            </button>
                        </>
                    ) : (
                        <button
                            className={styles.cartActionButton}
                            onClick={() => setShowOrderDetails(true)}
                            disabled={isLoadingPayment} // Disable tombol saat loading
                        >
                            Lihat Detail Pesanan
                        </button>
                    )}
                </>
            )}
        </div>
    );


    return (
        <div
            ref={cartFabRef}
            className={`${styles.cartFab} ${shouldHideFab ? styles.hidden : ''} ${isCartExpanded ? styles.expanded : ''}`}
        >
            <div className={styles.cartExpandedContent}>
                <div className={styles.cartPageSlider} style={{ transform: `translateX(-${(cartPage - 1) * 100}%)` }}>
                    {renderPage1()}
                    {renderPage2()}
                    {renderPage3()}
                    {renderPageStatus()}
                </div>
            </div>
        </div>
    );
};

export default CartFAB;
