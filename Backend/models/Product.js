import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({ 
   name: {
    type: String,
    required: true,
   },
   sku: {
    type: String,
    required: false,
   },
   description: {
    type: String,
    required: false,
   },
   hsn: {
    type: String,
    required: false,
   },
   category: {
    type: String,
    required: false,
   },
   basePrice:{
    type: String,
    required: false,
   },
   sellingPrice: {
    type: String,
    required: false,
   },
  PurchasePrice: {
    type: String,
    required: false,
   },
   stockQty: {
    type: String,
    required: false,
   },
   unit: {
    type: String,
    required: false,
   },
   taxGroup: {
    type: String,
    required: false,
   },
   images: {
    type: [String],
    required: false,
   },   
   isActive: {
    type: Boolean,
    default: true,
   },
   lowStockAlert: {
    type: String,
    required: false,
   },
   barcode: {
    type: String,
    required: false,
   },
   companyId: {
    type: String,
    required: false,
   },
   tags: {
    type: [String],
    required: false,
   },
   attributes: {
    type: Map,
    of: String,
    required: false,
   },
}, {timestamps: true});
export default mongoose.model('Product', ProductSchema);


/* _id?: string;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  sku?: string;
  description?: string;
  hsn?: string;
  category?: string;
  basePrice?:string;
  sellingPrice: string;
  purchasePrice?: string;
  stockQty?: string;
  unit?: string;
  taxGroup?: string;
  images?: string[];
  isActive?: boolean;
  lowStockAlert?: string;
  barcode?: string;
  companyId?: string;
  tags?: string[];
  attributes?: {
    [key: string]: string;
  };*/
