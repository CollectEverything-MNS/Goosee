export const categoriesRoutes = {
  root: '/categories',
  category: {
    create: '/',
    getOne: '/:id',
    update: '/:id',
    delete: '/:id',
    products: '/:id/products',
  },
};

export const productsRoutes = {
  root: '/products',
  product: {
    create: '/',
    getOne: '/:id',
    update: '/:id',
    delete: '/:id',
    updateStock: '/:id/stock',
  },
};

export const productImagesRoutes = {
  root: '/products',
  image: {
    list: '/:id/images',
    add: '/:id/images',
    delete: '/:id/images/:imageId',
    setMain: '/:id/images/:imageId/main',
  },
};

export const tagsRoutes = {
  root: '/tags',
  tag: {
    create: '/',
    getOne: '/:id',
    delete: '/:id',
  },
};

export const productTagsRoutes = {
  root: '/products',
  productTag: {
    list: '/:id/tags',
    add: '/:id/tags',
    delete: '/:id/tags/:tagId',
  },
};

export const productAttributesRoutes = {
  root: '/products',
  attribute: {
    list: '/:id/attributes',
    add: '/:id/attributes',
    getOne: '/:id/attributes/:attributeId',
    delete: '/:id/attributes/:attributeId',
  },
};