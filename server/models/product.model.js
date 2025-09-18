import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    image: {
      type: String,
      default: 'https://th.bing.com/th/id/OIP.B48GIfsNVKZyQrnMorCipwHaFj?w=220&h=180&c=7&r=0&o=7&dpr=1.5',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    qunty: {
      type: Number,
      default: 1,
      min: [0, 'Quantity cannot be negative']
    },
    farm: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;