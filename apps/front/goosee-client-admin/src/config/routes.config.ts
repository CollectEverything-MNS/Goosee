export const routes = {
  public: {
    home: {
      getHref: () => '/'
    }
  },
  private: {
    profile: {
      getHref: () => '/profil'
    }
  }
} as const;
