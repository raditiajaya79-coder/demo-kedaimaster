// // src/App.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import styles from './page.module.css';
// import { getAllProducts } from '../kedaimaster-api/productsApi.js';

// import Header from './Header';
// import Categories from './Categories';
// import MenuList from './MenuList';
// import CartFAB from './CartFAB';
// import DeleteModal from './DeleteModal';
// import MusicPlayer from './MusicPlayer';
// import AiWelcomeModal from './AiWelcomeModal';
// import AiRecommendationPage from './AiRecommendationPage';

// import { getAllProductCategories } from '../kedaimaster-api/productCategoriesApi.js';

// const App = () => {
//   const [cart, setCart] = useState({});
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [itemToDelete, setItemToDelete] = useState(null);
//   const [menuItemsData, setMenuItemsData] = useState([]);
//   const [categoryItemsData, setCategoryItemsData] = useState([]);
//   const [activeCategory, setActiveCategory] = useState('semua');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isAiChatOpen, setIsAiChatOpen] = useState(false);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const products = await getAllProducts();
//         const categories = await getAllProductCategories();

//         // --- Kelompokkan produk berdasarkan category.id ---
//         const groupedProducts = products.reduce((acc, product) => {
//           const categoryId = product.category?.id || "uncategorized";
//           const categoryName = product.category?.name || "Uncategorized";

//           if (!acc[categoryId]) {
//             acc[categoryId] = {
//               categoryId,
//               categoryName,
//               items: [],
//             };
//           }

//           acc[categoryId].items.push({
//             id: product.id,
//             name: product.name,
//             price: product.price?.unitPrice || 0,
//             image: product.imageUrl,
//             description: product.description || '',
//             stock: product.stock || 0,
//             visible: product.visible,
//           });

//           return acc;
//         }, {});

//         // Ubah ke array agar mudah di-render
//         setMenuItemsData(Object.values(groupedProducts));
//         setCategoryItemsData(categories);
//       } catch (err) {
//         setError(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();

//     const savedCart = localStorage.getItem('cart');
//     if (savedCart) {
//       setCart(JSON.parse(savedCart));
//     }
//   }, []);

//   // Clear localStorage cart on app start
//   useEffect(() => {
//     localStorage.removeItem('cart'); // or localStorage.clear() to clear everything
//     console.log('Cart cleared on app start');
//   }, []);

//   useEffect(() => {
//     localStorage.setItem('cart', JSON.stringify(cart));
//   }, [cart]);

//   // Handler untuk memodifikasi state cart
//   const handleAddToCart = (item) => {
//     setCart(prevCart => ({
//       ...prevCart,
//       [item.id]: { ...item, quantity: 1 }
//     }));
//   };

//   const handleIncreaseQuantity = (itemId) => {
//     setCart(prevCart => ({
//       ...prevCart,
//       [itemId]: { ...prevCart[itemId], quantity: prevCart[itemId].quantity + 1 }
//     }));
//   };

//   const handleDecreaseQuantity = (itemId) => {
//     const currentItem = cart[itemId];
//     if (currentItem.quantity > 1) {
//       setCart(prevCart => ({
//         ...prevCart,
//         [itemId]: { ...prevCart[itemId], quantity: prevCart[itemId].quantity - 1 }
//       }));
//     } else {
//       setItemToDelete(currentItem);
//       setIsDeleteModalOpen(true);
//     }
//   };

//   const confirmDeleteItem = () => {
//     if (itemToDelete) {
//       const newCart = { ...cart };
//       delete newCart[itemToDelete.id];
//       setCart(newCart);
//     }
//     setIsDeleteModalOpen(false);
//     setItemToDelete(null);
//   };

//   const handleResetCart = () => {
//     setCart({});
//   };
//   ```javascript
// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import { getAllProducts } from '../kedaimaster-api/productsApi.js';

import Header from './Header';
import Categories from './Categories';
import MenuList from './MenuList';
import CartFAB from './CartFAB';
import DeleteModal from './DeleteModal';
import MusicPlayer from './MusicPlayer';
import AiWelcomeModal from './AiWelcomeModal';
import AiRecommendationPage from './AiRecommendationPage';

import { getAllProductCategories } from '../kedaimaster-api/productCategoriesApi.js';

const App = () => {
  const [cart, setCart] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [menuItemsData, setMenuItemsData] = useState([]);
  const [categoryItemsData, setCategoryItemsData] = useState([]);
  const [activeCategory, setActiveCategory] = useState('semua');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isFabVisible, setIsFabVisible] = useState(false);
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [cartHeight, setCartHeight] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkResponsive = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setIsMobile(window.innerWidth < 768);
    };
    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getAllProducts();
        const categories = await getAllProductCategories();

        // --- Kelompokkan produk berdasarkan category.id ---
        const groupedProducts = products.reduce((acc, product) => {
          const categoryId = product.category?.id || "uncategorized";
          const categoryName = product.category?.name || "Uncategorized";

          if (!acc[categoryId]) {
            acc[categoryId] = {
              categoryId,
              categoryName,
              items: [],
            };
          }

          acc[categoryId].items.push({
            id: product.id,
            name: product.name,
            price: product.price?.unitPrice || 0,
            image: product.imageUrl,
            description: product.description || '',
            stock: product.stock || 0,
            visible: product.visible,
          });

          return acc;
        }, {});

        // Ubah ke array agar mudah di-render
        setMenuItemsData(Object.values(groupedProducts));
        setCategoryItemsData(categories);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Clear localStorage cart on app start
  useEffect(() => {
    localStorage.removeItem('cart'); // or localStorage.clear() to clear everything
    console.log('Cart cleared on app start');
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Handler untuk memodifikasi state cart
  const handleAddToCart = (item) => {
    setCart(prevCart => ({
      ...prevCart,
      [item.id]: { ...item, quantity: 1 }
    }));
  };

  const handleIncreaseQuantity = (itemId) => {
    setCart(prevCart => ({
      ...prevCart,
      [itemId]: { ...prevCart[itemId], quantity: prevCart[itemId].quantity + 1 }
    }));
  };

  const handleDecreaseQuantity = (itemId) => {
    const currentItem = cart[itemId];
    if (currentItem.quantity > 1) {
      setCart(prevCart => ({
        ...prevCart,
        [itemId]: { ...prevCart[itemId], quantity: prevCart[itemId].quantity - 1 }
      }));
    } else {
      setItemToDelete(currentItem);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      const newCart = { ...cart };
      delete newCart[itemToDelete.id];
      setCart(newCart);
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleResetCart = () => {
    setCart({});
  };

  const handleTransactionComplete = () => {
    setCart({});
    // fetchProducts(); // Uncomment if you want to re-fetch products
  };

  if (loading) {
    return <div className={styles.mobileContainer}>Loading menu...</div>;
  }

  if (error) {
    return <div className={styles.mobileContainer}>Error: {error.message}</div>;
  }

  // Mobile: Full screen chat - REMOVED for bottom sheet
  // if (isAiChatOpen && isMobile) {
  //   return <AiRecommendationPage onBack={() => setIsAiChatOpen(false)} />;
  // }
  return (
    <div className={styles.appContainer}>
      <div
        className={styles.mobileContainer}
        style={{ position: 'relative' }}
      >
        <div className={`${styles.scrollableContent} ${isAiChatOpen ? styles.noScroll : ''}`}>
          <Header />
          <main className={styles.mainContent}>
            <Categories
              categories={categoryItemsData}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
            <MenuList
              menuItems={menuItemsData}
              cart={cart}
              onAddToCart={handleAddToCart}
              onIncreaseQuantity={handleIncreaseQuantity}
              onDecreaseQuantity={handleDecreaseQuantity}
              activeCategory={activeCategory}
            />

            <div className="
                  h-[46px]
                  text-center
              ">© KEDAIMASTER.COM</div>
          </main>
        </div>

        {/* Chat Bottom Sheet - Moved Inside Container */}
        <div
          className={`${styles.chatOverlay} ${isAiChatOpen ? styles.visible : ''}`}
          onClick={() => setIsAiChatOpen(false)}
        />
        <div className={`${styles.chatBottomSheet} ${isAiChatOpen ? styles.open : ''}`}>
          {isAiChatOpen && (
            <AiRecommendationPage
              onBack={() => setIsAiChatOpen(false)}
              isWidget={true}
            />
          )}
        </div>

        {!isAiChatOpen && (
          <AiWelcomeModal
            onStartAi={() => setIsAiChatOpen(true)}
            bottomOffset={isFabVisible ? (cartHeight + 60) : 24}
            style={{ position: isDesktop ? 'absolute' : 'fixed' }}
          />
        )}
      </div>

      {!isAiChatOpen && (
        <CartFAB
          cart={cart}
          onIncreaseQuantity={handleIncreaseQuantity}
          onDecreaseQuantity={handleDecreaseQuantity}
          onResetCart={handleResetCart}
          isDeleteModalOpen={isDeleteModalOpen}
          onTransactionComplete={handleTransactionComplete}
          onVisibilityChange={setIsFabVisible}
          onExpandChange={setIsCartExpanded}
          onHeightChange={setCartHeight}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        item={itemToDelete}
        onConfirm={confirmDeleteItem}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default App;
