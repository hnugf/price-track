import Product from "@/lib/models/product.model";
import { connectToDB } from "@/lib/mongoose"
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scapeAmazonProduct } from "@/lib/scraper";
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/utils";
import { NextResponse } from "next/server";

export const maxDuration = 60; //5minutes
export const dynamic = 'force-dynamic'
export const revalidate = 0;


export async function GET() {
    try {
        connectToDB();

        const products = await Product.find({});

        if(!products) throw new Error("No products found");
        //1. SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
        const updatedProcuts = await Promise.all(
            products.map(async (currentProduct) => {
                const scapedProduct = await scapeAmazonProduct(currentProduct.url);

                if(!scapedProduct) throw new Error("No products found");


                const updatedPriceHistory = [
                    ...currentProduct.priceHistory,
                    { price: scapedProduct.currentPrice }
                ]
    
                const product = {
                    ...scapedProduct,
                    priceHistory: updatedPriceHistory,
                    lowestPrice: getLowestPrice(updatedPriceHistory),
                    highestPrice: getHighestPrice(updatedPriceHistory),
                    averagePrice: getAveragePrice(updatedPriceHistory),
                }
            
            const updatedProcut = await Product.findOneAndUpdate( 
                {  url: product.url },
                product,
            );

            
                //2. CHECK EACH PRODCUT'S STATUS & SEND EMAIL ACCORDINGLY
                const emailNotifType = getEmailNotifType(scapedProduct, currentProduct)
                 

                if(emailNotifType && updatedProcut.users.lenght > 0) {
                    const productInfo = {
                        title: updatedProcut.title,
                        url: updatedProcut.url,
                        image: product.image,
                    }

                    const emailContent = await generateEmailBody(productInfo, emailNotifType);
                    
                    const usersEmails = updatedProcut.users.map((user: any) => user.email)


                    await sendEmail(emailContent, usersEmails);
                }

                return updatedProcut
            })
        )

        return NextResponse.json({
            message: 'OK', data: updatedProcuts
        })
    } catch (error) {
        throw new Error(`Eroor in Get: ${error}`)
    }
}