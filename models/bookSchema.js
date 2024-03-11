import mongoose from "mongoose";
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minLength: [10, "Book title must contain at least 10 characters!"],
        maxLength: [40, "Book title cannot exceed 40 characters!"]
    },
    mainImage: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    intro: {
        type: String,
        required: true,
        minLength: [250, "Book intro must contain at least 250 characters!"],
    },
    paraOneImage: {
        public_id: {
            type: String,

        },
        url: {
            type: String,

        }
    },
    paraOneDescription: {
        type: String,
        minLength: [50, "Book intro must contain at least 50 characters!"],
    },
    paraOneTitle: {
        type: String,
        minLength: [50, "Book title must contain at least 50 characters!"],

    },
    paraTwoImage: {
        public_id: {
            type: String,

        },
        url: {
            type: String,

        }
    },
    paraTwoDescription: {
        type: String,
        minLength: [50, "Book intro must contain at least 50 characters!"],
    },
    paraTwoTitle: {
        type: String,
        minLength: [50, "Book title must contain at least 50 characters!"],

    },
    paraThreeImage: {
        public_id: {
            type: String,

        },
        url: {
            type: String,

        }
    },
    paraThreeDescription: {
        type: String,
        minLength: [50, "Book intro must contain at least 50 characters!"],
    },
    paraThreeTitle: {
        type: String,
        minLength: [50, "Book title must contain at least 50 characters!"],

    },
    category: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    authorName: {
        type: String,
        required: true
    },
    authorAvatar: {
        type: String,
        required: true
    },
    published: {
        type: Boolean,
        default: false,
    }

});

export const Book = mongoose.model("Book", bookSchema);