import { Address } from "./Invoice";

interface Company {
  userId: string;
  _id?: string;
  createdAt?: string;
  fullName: string;
  password?: string;
  email?: string;
  phone?: string;
  image?: string;
  isActive?: boolean;
  isVerified?: boolean;
  gstin?: string;
  pan?: string;
  address: Address;
  website?: string;
  digiImage?: string;
}

export type { Company };
