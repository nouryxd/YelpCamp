const mongoose = require("mongoose");
const Campground = require("../models/campground");

const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection refused:"));
db.once("open", () => {
    console.log("Connected to database");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 999) + 1;
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: "61034da632f78699ea75db22",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt enim accusamus mollitia tenetur doloremque adipisci voluptatibus officia placeat, esse ab deleniti assumenda nobis, non, eos provident illum amet illo nostrum.",
            price: price,
            images: [
                {
                    url: "https://res.cloudinary.com/dhw5ap8io/image/upload/v1628035603/YelpCamp/vyufcmjeog1aolaocpoo.jpg",
                    filename: "YelpCamp/vyufcmjeog1aolaocpoo",
                },
                {
                    url: "https://res.cloudinary.com/dhw5ap8io/image/upload/v1628035603/YelpCamp/toan7zioe2cyjn9kofht.jpg",
                    filename: "YelpCamp/toan7zioe2cyjn9kofht",
                },
                {
                    url: "https://res.cloudinary.com/dhw5ap8io/image/upload/v1628035604/YelpCamp/sagensszfzecn3l23o6t.jpg",
                    filename: "YelpCamp/sagensszfzecn3l23o6t",
                },
                {
                    url: "https://res.cloudinary.com/dhw5ap8io/image/upload/v1628035603/YelpCamp/uffh9wvxooomzyks7ur7.jpg",
                    filename: "YelpCamp/uffh9wvxooomzyks7ur7",
                },
            ],
        });
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
