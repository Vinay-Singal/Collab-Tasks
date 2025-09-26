import mongoose, { Schema, Model, Document, models } from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;
  user: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

const Task: Model<ITask> = models.Task || mongoose.model<ITask>("Task", taskSchema);

export default Task;
