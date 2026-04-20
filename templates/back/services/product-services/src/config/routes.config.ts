export const ROUTES = {
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: '/categories/:id',

  PRODUCTS: '/products',
  PRODUCT_BY_ID: '/products/:id',
  PRODUCT_STOCK: '/products/:id/stock',
  PRODUCTS_BY_CATEGORY: '/categories/:id/products',

  PRODUCT_IMAGES: '/products/:id/images',
  PRODUCT_IMAGE_BY_ID: '/products/:id/images/:imageId',
  PRODUCT_IMAGE_MAIN: '/products/:id/images/:imageId/main',

  TAGS: '/tags',
  TAG_BY_ID: '/tags/:id',
  PRODUCT_TAGS: '/products/:id/tags',
  PRODUCT_TAG_BY_ID: '/products/:id/tags/:tagId',

  PRODUCT_ATTRIBUTES: '/products/:id/attributes',
  PRODUCT_ATTRIBUTE_BY_ID: '/products/:id/attributes/:attributeId',
};