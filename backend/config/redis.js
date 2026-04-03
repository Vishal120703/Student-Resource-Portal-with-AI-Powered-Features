import { createClient } from "redis";

const client = createClient({
    url: 'redis://localhost:6379'
});

client.on('error',(err)=>{
    console.log("error"+ err);
})
const connectRedis = async() =>{
    try{
        await client.connect();
        console.log("redis is connected");
    }
    catch(err){
        console.log(err);
    }

}
export {client, connectRedis};



