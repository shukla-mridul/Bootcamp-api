const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please enter a valid title "],
  },

  description: {
    type: String,
    required: [true, "Please add a description"],
  },

  weeks: {
    type: String,
    required: [true, "Please add number of weeks"],
  },

  tuition: {
    type: Number,
    required: [true, "please add the amount"],
  },

  minimumSkill: {
    type: String,
    required: [true, "Please enter your current skill level"],
    enum: ["beginner", "intermediate", "Professional"],
  },

  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  /*   Now since courses will be connected to bootcamps therefore we must add them 
as a special field and for type we need special mongoose type
*/

  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
});

// Static method to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);

  console.log(obj);

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: Math.floor(obj[0].averageCost),
    });
  } catch (err) {
    console.error(err);
  }
};

// Get average cost after saves

CourseSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});
// Call average cost before remove

CourseSchema.pre("remove", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model("Course", CourseSchema);
