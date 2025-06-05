import mongoose from 'mongoose';

const taxSummarySchema = new mongoose.Schema({
  taxName: {
    type: String,
    required: true
  },
  taxRate: {
    type: Number,
    required: true
  },
  taxableAmount: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  }
});

const addressSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  }
});

const itemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  hsn: {
    type: String
  },
  quantity: {
    type: Number,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  taxRate: {
    type: Number,
  },
  amount: {
    type: Number,
    required: true
  }
},{_id : false});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  dueDate: {
    type: String,
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  address: {
    type: addressSchema,
    required: true
  },
  items: {
    type: [itemSchema],
    required: true,
    validate: v => Array.isArray(v) && v.length > 0
  },
  subTotal: {
    type: Number,
    required: true
  },
  taxTotal: {
    type: Number,
    required: true,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'],
    default: 'draft'
  },
  notes: {
    type: String
  },
  termsAndConditions: {
    type: String
  },
  taxSummary: {
    type: [taxSummarySchema],
    default: []
  },
  paymentMethod: {
    type: String
  },
  paymentDate: {
    type: Date
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  balanceDue: {
    type: Number,
    default: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isGstInvoice: {
    type: Boolean,
    default: false
  },
  isExported: {
    type: Boolean,
    default: false
  },
  currency: {
    type: String,
    default: 'INR'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ customerId: 1 });
invoiceSchema.index({ companyId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ createdAt: -1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
