import { Schema, model, Model, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  price: Number;
  size: string;
  image: string;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

const Product: Model<IProduct> = model("Product", productSchema, "products");

export default Product;
