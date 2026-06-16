export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  postaleCode?: string;
  city?: string;
  country?: string;
  role?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  postaleCode?: string;
  city?: string;
  country?: string;
}
