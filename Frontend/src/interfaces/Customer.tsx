interface Customer {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  fullName: string;
  email?: string;
  phone: string;
  gstin?: string;
  pan?: string;
  address: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  notes?: string;
  isActive?: boolean;
  tags?: string[];
  companyId: string;
  totalBilled?: number;
  outstandingAmount?: number;
  lastBilledDate?: string;
}

export type { Customer };
