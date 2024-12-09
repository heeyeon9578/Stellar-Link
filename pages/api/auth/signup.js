import { connectDB } from "@/util/database";


export default async function handler(req, res){
    if(req.method==="POST"){
        
        try{
            const bcrypt = require('bcryptjs');
            let hash = await bcrypt.hash(req.body.password, 10);
            console.log(hash);
            let db = (await connectDB).db("StellarLink");
            req.body.password = hash;
            let result = await db.collection("user_cred").insertOne(req.body);
            
            console.log(`비번`,req.body.password);
            return res.status(200).json({ message: "회원가입했습니다!" });
        }catch{
            return res.status(404).json({ message: "회원가입 실패했습니다!" });
        }
    }
}