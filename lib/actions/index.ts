"use server"

import { revalidatePath } from "next/cache";
import { scapeAmazonProduct } from "../scraper";
import { connectToDB } from "../mongoose";
import Product from "../models/product.model";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";
export async function scapeAndStroeProduct(productURL: string) {
    if(!productURL) return;

    try {
        connectToDB();
        
        const scapedProduct = await scapeAmazonProduct(productURL);


        if(!scapedProduct) return;
        
        let product = scapedProduct;
        
        const existingProduct = await Product.findOne({ url: scapedProduct.url });

        if(existingProduct){
              const updatedPriceHistory: any = [
                ...existingProduct.priceHistory,
                { price: scapedProduct.currentPrice }
            ]

            product = {
                ...scapedProduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice: getHighestPrice(updatedPriceHistory),
                averagePrice: getAveragePrice(updatedPriceHistory),
            }
        }
        const newProduct = await Product.findOneAndUpdate( 
            {  url: scapedProduct.url },
            product,
            { upsert: true, new: true }
        );

        revalidatePath(`/products/${newProduct._id}`);
    
    } catch (error:any) {
        throw new Error(`Tao/cap san pham nhat that bai: ${error.message}`)
    }
}
    
export async function getProductById(productId: string) {
    try {
        connectToDB();

        const product = await Product.findOne({_id: productId});

        if(!product) return null;

        return product;
    } catch (error) {
        console.log(error);
    }
}

export async function getAllProducts() {
    try {
        connectToDB();

        const product = await Product.find();

        return product;
    } catch (error) {
        console.log(error);
    }
}
export async function getSimilarProducts(productId: string) {
    try {
        connectToDB();

    const currentProduct = await Product.findById(productId);

    if(!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);

    return similarProducts;
  } catch (error) {
    console.log(error);
  }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
    try {
        const product = await Product.findById(productId);

    if(!product) return;

    const userExists = product.users.some((user: User) => user.email === userEmail);

    if(!userExists) {
      product.users.push({ email: userEmail });

      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
   }
  } catch (error) {
   console.log(error);
 }
}