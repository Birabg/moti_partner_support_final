import multer from "multer";


const storage = multer.diskStorage({

destination:(req,file,cb)=>{

    cb(null,"uploads/");

},


filename:(req,file,cb)=>{

    cb(
        null,
        Date.now()+"-"+file.originalname
    );

}

});


const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const MAX_FILES_PER_CASE = 5;

export const upload = multer({
 storage,
 limits: {
   fileSize: MAX_FILE_SIZE_BYTES,
   files: MAX_FILES_PER_CASE,
 },
});

export { MAX_FILE_SIZE_BYTES, MAX_FILES_PER_CASE };