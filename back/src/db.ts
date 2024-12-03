import { connect } from "mongoose"
import {myEnv} from '../conf'

const CONNECTION_STRING = `mongodb+srv://bastien:1xACGH4FxQ1a9zRj@cluster0.87ozbqt.mongodb.net/Test`


// if(myEnv.MONGOOSE_DEBUG==='true') mongoose.set('debug', false);

export async function DbConnect(){
    try {    
        // _declareMongoEvents()
        const _db =  await connect(CONNECTION_STRING)
        console.log(`🟢 connected to Atlas Cluster: ${myEnv.MONGODB_CLUSTER}`);
        return _db
    } catch (e: any) {
        console.warn(e.errorResponse)
        return e;
    }
}

