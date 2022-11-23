const recordingSchema = new Schema(
  {
    title: {
      type: String,
    },
    url: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      unique: 1,
    },
  },
  { timestamps: true }
);
export const Recording = mongoose.model("Recording", recordingSchema);
