export const routesConfig = {
  user: {
    root: '/users',
    findById: (id: string) => `/users/${id}`,
  },
};
