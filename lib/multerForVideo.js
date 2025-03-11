import multer from "multer";
const sto = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("file: ", file)
        if (file.mimetype.startsWith("video")) {
            console.log("Startswith video")
            cb(null, "./uploads/");
        }
        else {
            cb(new Error(`Unsupported file type`, false));
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.random() + "-" + file.originalname;
        cb(null, uniqueName);
    }
})

const up = multer({
    storage: sto,
    limits: {
        fileSize: 25 * 1024 * 1024
    }
})

export const upForPost = multer({
    storage: sto,
    limits: {
        fileSize: 100 * 1024 * 1024
    }
})

export default up;
export const uploadSingleVideo = up.single("video"); 
