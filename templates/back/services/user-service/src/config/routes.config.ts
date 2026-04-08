export const usersRoutes = {
  root: `/users`,
  user: {
    create: `/create-user`,
    getOne: `/:id`,
    update: `/:id`,
    delete: `/:id`,
  },
};

export const rolesRoutes = {
  root: `/roles`,
  role: {
    create: `/`,
    getOne: `/:id`,
    update: `/:id`,
    delete: `/:id`,
  },
};
