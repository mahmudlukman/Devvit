require('dotenv').config();
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IInteraction extends Document {
  user: Schema.Types.ObjectId; // refence to user
  action: string;
  question: Schema.Types.ObjectId; // reference to question
  answer: Schema.Types.ObjectId; // reference to answer
  tags: Schema.Types.ObjectId[]; // reference to tag
  createdAt: Date;
}

const InteractionSchema: Schema<IInteraction> = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  question: { type: Schema.Types.ObjectId, ref: 'Question' },
  answer: { type: Schema.Types.ObjectId, ref: 'Answer' },
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  createdAt: { type: Date, default: Date.now },
});

const Interaction: Model<IInteraction> = mongoose.model('Interaction', InteractionSchema);
export default Interaction;
