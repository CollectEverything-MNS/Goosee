const userBasePath = '/user';

export const routesConfig = {
  user: {
    root: userBasePath,
    byId: `${userBasePath}/:id`,
  },
};
