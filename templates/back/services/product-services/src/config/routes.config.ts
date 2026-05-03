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

export const tagsRoutes = {
  root: '/tags',
  tag: {
    create: '/',
    delete: '/:id',
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

export const productTagsRoutes = {
  root: '/products',
  productTag: {
    add: '/:id/tags',
    remove: '/:id/tags/:tagId',
  },
};

export const productAttributesRoutes = {
  root: '/products',
  attribute: {
    add: '/:id/attributes',
    remove: '/:id/attributes/:attributeId',
  },
};
