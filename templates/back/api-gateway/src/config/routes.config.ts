const userBasePath = '/user';
const authBasePath = '/auth';

export const routesConfig = {
  user: {
    root: userBasePath,
    byId: {
      path: `${userBasePath}/:id`,
      link: (serviceUrl: string, id: string) => `${serviceUrl}${userBasePath}/${id}`,
    },
  },
  auth: {
    root: authBasePath,
    login: {
      path: `${authBasePath}/login`,
      link: (serviceUrl: string) => `${serviceUrl}${authBasePath}/login`,
    },
    register: {
      path: `${authBasePath}/register`,
      link: (serviceUrl: string) => `${serviceUrl}${authBasePath}/register`,
    },
    token: {
      revoke: {
        path: `${authBasePath}/token/revoke`,
        link: (serviceUrl: string) => `${serviceUrl}${authBasePath}/token/revoke`,
      },
      refresh: {
        path: `${authBasePath}/token/refresh`,
        link: (serviceUrl: string) => `${serviceUrl}${authBasePath}/token/refresh`,
      },
    },
  },
};
