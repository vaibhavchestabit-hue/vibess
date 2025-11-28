import mongoose from "mongoose";

// Message Schema for listening sessions
const listeningMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    isSystemMessage: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Listening Session Schema
const listeningSessionSchema = new mongoose.Schema(
  {
    speaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listener: {
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
      enum: ["pending", "active", "completed", "cancelled", "declined"],
      default: "pending",
    },
    messages: [listeningMessageSchema],
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: 15 * 60 * 1000, // 15 minutes in milliseconds
    },
    // Speaker feedback
    speakerFeedback: {
      type: {
        type: String,
        enum: ["positive", "negative", "neutral"],
      },
      rating: {
        type: Number,
        min: 0,
        max: 10,
      },
      submittedAt: Date,
    },
    // Listener review
    listenerReview: {
      isGenuine: {
        type: Boolean,
      },
      submittedAt: Date,
    },
    // Continuity preferences
    speakerWantsReconnect: {
      type: Boolean,
      default: false,
    },
    listenerWantsReconnect: {
      type: Boolean,
      default: false,
    },
    // Safety features
    reportedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: String,
        reportedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Indexes for efficient queries
listeningSessionSchema.index({ speaker: 1, status: 1 });
listeningSessionSchema.index({ listener: 1, status: 1 });
listeningSessionSchema.index({ status: 1, createdAt: -1 });

// Method to check if session has expired
listeningSessionSchema.methods.checkExpiration = function () {
  if (this.status !== "active") return false;
  if (!this.startedAt) return false;

  const elapsed = Date.now() - this.startedAt.getTime();
  if (elapsed >= this.duration) {
    this.status = "completed";
    this.endedAt = new Date();
    return true;
  }
  return false;
};

// Method to get remaining time in milliseconds
listeningSessionSchema.methods.getRemainingTime = function () {
  if (this.status !== "active" || !this.startedAt) return 0;

  const elapsed = Date.now() - this.startedAt.getTime();
  const remaining = this.duration - elapsed;
  return Math.max(0, remaining);
};

const ListeningSession =
  mongoose.models.ListeningSession ||
  mongoose.model("ListeningSession", listeningSessionSchema);

export default ListeningSession;
