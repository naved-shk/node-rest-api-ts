
import { Schema, model, Model, Document  } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
  }


  export interface ICurrenUser {
    _id: string;
    role: string;
  } 

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
    name: {type: String, required: true},
    email: {type: String, required: true, unquie: true},
    password: {type: String, required: true},
    role: {type: String, default: 'customber'}
},{timestamps: true});

// 3. Create a Model.
const User: Model<IUser> = model('User', userSchema, 'users');

export default User ;