interface User {
  _id: string;
  createdAt?: string;
  fullName: string;
  username: string;
  password?: string;
  role: string;
  email?: string;
  phone?: string;
  image?: string;
  isActive?: boolean;
  isVerified?: boolean;
  companyId?: string;
}

export type { User };
