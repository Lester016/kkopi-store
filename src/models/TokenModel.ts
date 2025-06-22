import { model, Schema } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
interface IToken {
  userId: typeof Schema.Types.ObjectId;
  token: string;
}

// 2. Create a Schema corresponding to the document interface.
const tokenSchema = new Schema<IToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// 3. Create a Model.
const Token = model<IToken>("Token", tokenSchema);

export default Token;
