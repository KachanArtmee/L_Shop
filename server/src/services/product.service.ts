import fs from 'fs';
import {DB_PATH} from "../constants/general";
import {Product} from "../models/product.model";

export class ProductService {

    static getAllProducts():Product[] {
        try {
            if(!fs.existsSync(DB_PATH.products)){
                console.error("There is nothing");
                return [];
            }

            const fileData = fs.readFileSync(DB_PATH.products, {encoding: "utf8"});
            return JSON.parse(fileData || '[]');
        }catch {
            console.log("unluck");
            return [];
        }
    }
}