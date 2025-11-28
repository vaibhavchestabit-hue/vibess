import mongoose from "mongoose";

const listeningRequestSchema = new mongoose.Schema(
  {
    speaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    intent: {
      type: String,
      required: true,
      enum: [
        "A thought",
        "Something heavy",
        "Just random talk",
        "I don't know",
        "Feeling overwhelmed",
      ],
    },
    context: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "matched", "cancelled", "expired"],
      default: "active",
    },
    interestedListeners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 15 * 60 * 1000), // Expires in 15 minutes
    },
  },
  { timestamps: true }
);

// Indexes
listeningRequestSchema.index({ status: 1, createdAt: -1 });
listeningRequestSchema.index({ speaker: 1, status: 1 });

const ListeningRequest =
  mongoose.models.ListeningRequest ||
  mongoose.model("ListeningRequest", listeningRequestSchema);

export default ListeningRequest;
