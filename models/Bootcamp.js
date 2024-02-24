const mongoose = require("mongoose");
const slugify = require("slugify");
const geodcoder = require("../utils/geocoder");
const { Geocoder } = require("../utils/geocoder");
const dotenv = require("dotenv");
const geocoder = require("../utils/geocoder");

const EmailExpression =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const URLexpression =
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

dotenv.config({ path: "../config/config.env" });
const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name "],
      unique: true,
      trim: true,
      maxlength: [50, `Name cannot be more than be ${50} characters`],
    },

    slug: String,

    description: {
      type: String,
      required: [true, "Please add a description "],
      maxlength: [500, `Description cannot be more than be ${500} characters`],
    },
    website: {
      type: String,
      match: [URLexpression, "Please use a valid url"],
    },
    phone: {
      type: String,
      maxlength: [20, `Phone Number cannot be more than ${20} characters`],
    },
    email: {
      type: String,
      match: [EmailExpression, "Please use a valid a valid email"],
    },

    address: {
      type: String,
      required: [true, "Please Enter an valid Address"],
    },

    // GeoJson format
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
      },
      coordinates: {
        type: [Number],

        index: "2dsphere",
      },
      // Stuff from the mapQuest API
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      type: [String],
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "other",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must at least be 1 0"],
      max: [5, "Maximum Rating can be 5"],
    },

    averageCost: {
      type: Number,
    },
    photo: {
      type: String,
      default: "no-image.jpg",
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssitance: {
      type: Boolean,
      default: false,
    },
    jobGaurantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// We done the last part to add virtuals inside the bootcamps
// Create Bootcamp slug
// Now here we dont want to create  a arrow function coz they handle "this" scope differently
BootcampSchema.pre("save", function (next) {
  console.log("Slugifyy ran ", this.name);
  this.slug = slugify(this.name, { lower: true });
  console.log(process.env.GEOCODER_PROVIDER);
  next();
});

// Geocoder & Create coordiantes field

BootcampSchema.pre("save", async function (next) {
  const loc = await geodcoder.geocode(this.address);
  console.log(loc[0].stateCode);
  console.log(loc[0].state);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].state,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  // Do not save address in DB
  this.address = undefined;
  next();
  // Now we have this much data so need  to save address in db
});

// Delete courses  when its bootcamp gets deleted
BootcampSchema.pre("remove", async function (next) {
  console.log(`Courses being removed of bootccamp ${this._id}`);
  await this.model("Course").deleteMany({
    bootcamp: this._id,
  }); /*Only delete courses  that are part of the bootcamp*/
});
// Reverse populate with virtuals
BootcampSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "bootcamp",
  justOne: false,
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
