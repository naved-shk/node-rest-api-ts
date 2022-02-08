import { Request, Response, NextFunction } from 'express';
import { Product } from '../models';
import multer from 'multer';
import path from 'path';
import CustomErrorHandler from '../services/CustomErrorHandler';
import fs from 'fs';
import productSchema from '../validators/productValidators';
import { ObjectId } from 'mongoose';

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const storage = multer.diskStorage({
  destination: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: DestinationCallback
  ) => cb(null, './src/uploads/'),

  filename: (req: Request, file: Express.Multer.File, cb: FileNameCallback) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    // 3746674586-836534453.png
    cb(null, uniqueName);
  },
});

const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 5 },
}).single("image"); // 5mb

async function store(req: Request, res: Response, next: NextFunction) {
  // Multipart form data

  handleMultipartData(req, res, async (err) => {
    if (err) {
      return next(CustomErrorHandler.serverError(err.message));
    }

    const filePath: string | undefined = req.file?.path;
    

    // Validation

    const { error } = productSchema.validate(req.body);

    if (error) {
      // Delete the upload file
      fs.unlink(`${appRoot}/${filePath}`, (err) => {
        if (err) {
          return next(CustomErrorHandler.serverError(err.message));
        }
      });

      return next(error);
    }

    const { name, price, size } = req.body;

    let document;

    try {
      document = await Product.create({
        name,
        price,
        size,
        image: filePath,
      });
    } catch (error) {
      return next(error);
    }

    res.status(201).json(document);
  });
}

function update(req: Request, res: Response, next: NextFunction) {
  // Multipart form data

  handleMultipartData(req, res, async (err) => {
    if (err) {
      return next(CustomErrorHandler.serverError(err.message));
    }

    let filePath;

    if (req.file) {
      filePath = req.file.path;
    }

    // Validation
    const { error } = productSchema.validate(req.body);

    if (error) {
      // Delete the upload file
      if (req.file) {
        fs.unlink(`${appRoot}/${filePath}`, (err) => {
          if (err) {
            return next(CustomErrorHandler.serverError(error.message));
          }
        });
      }

      return next(error);
    }

    const { name, price, size } = req.body;

    let document;

    try {
      document = await Product.findOneAndUpdate(
        { _id: req.params.id },
        {
          name,
          price,
          size,
          ...(req.file && { image: filePath }),
        },
        { new: true }
      );
    } catch (error) {
      return next(error);
    }

    res.status(200).json(document);
  });
}


async function destroy(req: Request, res: Response, next: NextFunction) {

  const document = await Product.findOneAndRemove({ _id:  req.params.id});
  if (!document) {
    return next(new Error("Nothing to delete"));
  }

  // Image delete
  const imagePath = document.image;
  fs.unlink(`${appRoot}/${imagePath}`, (err) => {
    if (err) {
      return next(CustomErrorHandler.serverError());
    }
  });

  res.json(document);
}

async function index(req: Request, res: Response, next: NextFunction) {
  try {
    let { page, size } = req.query;

    if (!page) {
      page = "1";
    }
    if (!size) {
      size = "5";
    }

    const limit = parseInt(size as string);
    const skip = (Number(page) - 1) * Number(size);

    const documents = await Product.find()
      .limit(limit)
      .skip(skip)
      .select("-updatedAt -__v")
      .sort({ _id: -1 });

    return res.json({
      page,
      size,
      data: documents,
    });
  } catch (error) {
    return next(CustomErrorHandler.serverError());
  }
}

async function show(req: Request, res: Response, next: NextFunction) {
  let document;

  try {
    document = await Product.findOne({ _id: req.params.id }).select(
      "-updatedAt -__v"
    );
  } catch (error) {
    return next(CustomErrorHandler.serverError());
  }

  return res.json(document);
}

export default {
  store,
  update,
  destroy,
  index,
  show,
};
