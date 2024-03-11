import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/error.js';
import { Book } from '../models/bookSchema.js';
import cloudinary from 'cloudinary';

export const bookPost = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Book main image is manditory", 400));
    }
    const { mainImage, paraOneImage, paraTwoImage, paraThreeImage } = req.files;
    if (!mainImage) {
        return next(new ErrorHandler("Book main image is manditory", 400));
    }
    const allowedFormats = ['image/png', 'image/jpeg', 'image/webp'];
    if (
        !allowedFormats.includes(mainImage.mimetype) ||
        (paraOneImage && !allowedFormats.includes(paraOneImage.mimetype)) ||
        (paraTwoImage && !allowedFormats.includes(paraTwoImage.mimetype)) ||
        (paraThreeImage && !allowedFormats.includes(paraThreeImage.mimetype))
    ) {
        return next(
            new ErrorHandler(
                'Invalid file type. Only JPG, PNG, & WEBP Formats are allowed ', 400
            )
        );
    }
    const {
        title,
        intro,
        paraOneDescription,
        paraOneTitle,
        paraTwoDescription,
        paraTwoTitle,
        paraThreeDescription,
        paraThreeTitle,
        category,
        published
    } = req.body;

    const createdBy = req.user._id;
    const authorName = req.user.name;
    const authorAvatar = req.user.avatar.url;

    if (!title || !category || !intro) {
        return next(
            new ErrorHandler('Title, Intro & category are required fields', 400)
        );
    }

    const uploadPromises = [
        cloudinary.uploader.upload(mainImage.tempFilePath),
        paraOneImage
            ? cloudinary.uploader.upload(paraOneImage.tempFilePath)
            : Promise.resolve(null),
        paraTwoImage
            ? cloudinary.uploader.upload(paraTwoImage.tempFilePath)
            : Promise.resolve(null),
        paraThreeImage
            ? cloudinary.uploader.upload(paraThreeImage.tempFilePath)
            : Promise.resolve(null),
    ];

    const [mainImageRes, paraOneImageRes, paraTwoImageRes, paraThreeImageRes] =
        await Promise.all(uploadPromises);

    if (
        !mainImageRes ||
        mainImageRes.error ||
        (paraOneImage && (!paraOneImageRes || paraOneImageRes.error)) ||
        (paraTwoImage && (!paraTwoImageRes || paraTwoImageRes.error)) ||
        (paraThreeImage && (!paraThreeImageRes || paraThreeImageRes.error))
    ) {
        return next(
            new ErrorHandler('Error occured while uploading one or more images', 500)
        );
    }

    const bookData = {
        title,
        intro,
        paraOneDescription,
        paraOneTitle,
        paraTwoDescription,
        paraTwoTitle,
        paraThreeDescription,
        paraThreeTitle,
        category,
        createdBy,
        authorAvatar,
        authorName,
        published,
        mainImage: {
            public_id: mainImageRes.public_id,
            url: mainImageRes.secure_url,
        },
    };

    if (paraOneImageRes) {
        bookData.paraOneImage = {
            public_id: paraOneImageRes.public_id,
            url: paraOneImageRes.secure_url
        }
    }
    if (paraTwoImageRes) {
        bookData.paraTwoImage = {
            public_id: paraTwoImageRes.public_id,
            url: paraTwoImageRes.secure_url
        }
    }
    if (paraThreeImageRes) {
        bookData.paraThreeImage = {
            public_id: paraThreeImageRes.public_id,
            url: paraThreeImageRes.secure_url
        }
    }

    const book = await Book.create(bookData);
    res.status(200).json({
        success: true,
        message: 'Book Uploaded',
        book,
    });

});

// function to delete book

export const deleteBook = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
        return next(new ErrorHandler('Book not found', 404));
    }
    await book.deleteOne();
    res.status(200).json({
        success: true,
        message: "Book deleted"
    });
});

// functionality to get published books 
export const getAllBooks = catchAsyncErrors(async (req, res, next) => {
    const allBooks = await Book.find({ published: true });
    res.status(200).json({
        success: true,
        allBooks
    })
})

// get single book

export const getSingleBook = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
        return next(new ErrorHandler('Book not found', 404));
    }
    res.status(200).json({
        success: true,
        book
    })
})

// get author created books
export const getMyBooks = catchAsyncErrors(async (req, res, next) => {
    const createdBy = req.user._id;
    const books = await Book.find({ createdBy });
    res.status(200).json({
        success: true,
        books,

    })
})

// update book 
export const updateBook = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    let book = await Book.findById(id);
    if (!book) {
        return next(new ErrorHandler('Book not found', 404));
    }
    const newBookData = {
        title: req.body.title,
        intro: req.body.intro,
        category: req.body.category,
        paraOneTitle: req.body.paraOneTitle,
        paraOneDescription: req.body.paraOneDescription,
        paraTwoTitle: req.body.paraTwoTitle,
        paraTwoDescription: req.body.paraTwoDescription,
        paraThreeTitle: req.body.paraThreeTitle,
        paraThreeDescription: req.body.paraThreeDescription,
        published: req.body.published
    };
    if (req.files) {
        const { mainImage, paraOneImage, paraTwoImage, paraThreeImage } = req.files;
        const allowedFormats = ['image/png', 'image/jpeg', 'image/webp'];
        if (
            (mainImage && !allowedFormats.includes(mainImage.mimetype)) ||
            (paraOneImage && !allowedFormats.includes(paraOneImage.mimetype)) ||
            (paraTwoImage && !allowedFormats.includes(paraTwoImage.mimetype)) ||
            (paraThreeImage && !allowedFormats.includes(paraThreeImage.mimetype))
        ) {
            return next(
                new ErrorHandler(
                    'Invalid file format.Only PNG, JPG and WEBP formats are allowed',
                    400
                )
            );
        }
        if (req.files && mainImage) {
            const bookMainImageId = book.mainImage.public_id;
            await cloudinary.uploader.destroy(bookMainImageId);
            const newBookMainImage = await cloudinary.uploader.upload(
                mainImage.tempFilePath
            );
            newBookData.mainImage = {
                public_id: newBookMainImage.public_id,
                url: newBookMainImage.secure_url,
            };
        }
        if (req.files && paraOneImage) {
            if (book.paraOneImage) {
                const bookParaOneImageId = book.paraOneImage.public_id;
                await cloudinary.uploader.destroy(bookParaOneImageId)
            }
            const newBookParaOneImage = await cloudinary.uploader.upload(
                paraOneImage.tempFilePath
            );
            newBookData.paraOneImage = {
                public_id: newBookParaOneImage.public_id,
                url: newBookParaOneImage.secure_url,
            };
        }
        if (req.files && paraTwoImage) {
            if (book.paraTwoImage) {
                const bookParaTwoImageId = book.paraTwoImage.public_id;
                await cloudinary.uploader.destroy(bookParaTwoImageId)
            }
            const newBookParaTwoImage = await cloudinary.uploader.upload(
                paraTwoImage.tempFilePath
            );
            newBookData.paraTwoImage = {
                public_id: newBookParaTwoImage.public_id,
                url: newBookParaTwoImage.secure_url,
            };
        }
        if (req.files && paraThreeImage) {
            if (book.paraThreeImage) {
                const bookParaThreeImageId = book.paraThreeImage.public_id;
                await cloudinary.uploader.destroy(bookParaThreeImageId)
            }
            const newBookParaThreeImage = await cloudinary.uploader.upload(
                paraThreeImage.tempFilePath
            );
            newBookData.paraThreeImage = {
                public_id: newBookParaThreeImage.public_id,
                url: newBookParaThreeImage.secure_url,
            };
        }
    }
    book = await Book.findByIdAndUpdate(id, newBookData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        message: 'Book Updated',
        book,
    });

})