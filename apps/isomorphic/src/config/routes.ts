export const routes = {
  dashboard: {
    main: '/dashboard',
    store: '/store',

    products: '/products',
    createProduct: '/products/create',
    productDetails: (slug: string) => `/products/${slug}`,
    editProduct: (slug: string) => `/products/${slug}/edit`,
    
    // AI Features
    nameRecommendation: '/products/name-recommendation',
    imageGeneration: '/products/image-generation',
    postInstagram: '/products/post-instagram',
    
    material: '/materials',
    createMaterial: '/materials/create',
    materialDetails: (slug: string) => `/materials/${slug}`,
    editMaterial: (slug: string) => `/materials/${slug}/edit`,

    
    categories: '/categories',
    createCategories: '/categories/create',
    categoryDetails: (slug: string) => `/categories/${slug}`,
    editCategories: (slug: string) => `/categories/${slug}/edit`,

    productCategories: '/product-categories',
    createProductCategories: '/product-categories/create',
    productCategoryDetails: (slug: string) => `/product-categories/${slug}`,
    editProductCategories: (slug: string) => `/product-categories/${slug}/edit`,

    
    uoms: '/uoms',
    createUom: '/uoms/create',
    uomDetails: (slug: string) => `/uoms/${slug}`,
    editUom: (slug: string) => `/uoms/${slug}/edit`,

    
    users: '/users',
    createUser: '/users/create',
    userDetails: (slug: string) => `/users/${slug}`,
    editUser: (slug: string) => `/users/${slug}/edit`,
  },
  forms: {
    profileSettings: '/forms/profile-settings',
    notificationPreference: '/forms/profile-settings/notification',
    personalInformation: '/forms/profile-settings/profile',
    newsletter: '/forms/newsletter',
  },
  profile: '/profile',
  searchAndFilter: {
    realEstate: '/search/real-estate',
    nft: '/search/nft',
    flight: '/search/flight',
  },
  support: {
    dashboard: '/support',
    inbox: '/support/inbox',
    supportCategory: (category: string) => `/support/inbox/${category}`,
    messageDetails: (id: string) => `/support/inbox/${id}`,
    snippets: '/support/snippets',
    createSnippet: '/support/snippets/create',
    viewSnippet: (id: string) => `/support/snippets/${id}`,
    editSnippet: (id: string) => `/support/snippets/${id}/edit`,
    templates: '/support/templates',
    createTemplate: '/support/templates/create',
    viewTemplate: (id: string) => `/support/templates/${id}`,
    editTemplate: (id: string) => `/support/templates/${id}/edit`,
  },
  //   eCommerce: {
  //   dashboard: '/ecommerce',
  //   products: '/ecommerce/products',
  //   createProduct: '/ecommerce/products/create',
  //   productDetails: (slug: string) => `/ecommerce/products/${slug}`,
  //   ediProduct: (slug: string) => `/ecommerce/products/${slug}/edit`,
  //   categories: '/ecommerce/categories',
  //   createCategory: '/ecommerce/categories/create',
  //   editCategory: (id: string) => `/ecommerce/categories/${id}/edit`,
  //   orders: '/ecommerce/orders',
  //   createOrder: '/ecommerce/orders/create',
  //   orderDetails: (id: string) => `/ecommerce/orders/${id}`,
  //   editOrder: (id: string) => `/ecommerce/orders/${id}/edit`,
  //   reviews: '/ecommerce/reviews',
  //   shop: '/ecommerce/shop',
  //   cart: '/ecommerce/cart',
  //   checkout: '/ecommerce/checkout',
  //   trackingId: (id: string) => `/ecommerce/tracking/${id}`,
  // },
};
