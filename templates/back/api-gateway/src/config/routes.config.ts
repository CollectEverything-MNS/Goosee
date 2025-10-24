const userBasePath = '/user';

export const routesConfig = {
  user: {
    root: userBasePath,
    byId: {
      path: `${userBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${userBasePath}/${id}`,
    },
  },
};
