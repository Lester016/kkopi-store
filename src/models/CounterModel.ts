import mongoose, { model } from 'mongoose';

interface Counter {
  _id: string;
  sequence_value: number;
}

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 100000 }, // Start at 100000
});

const CounterModel = model<Counter>('Counter', CounterSchema);

export default CounterModel;
