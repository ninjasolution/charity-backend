const fs = require('fs');
const path = require('path')
const multer = require('multer');
const uuid = require('uuid');
const db = require("../models");
const User = db.user;

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, './files');
    },
    filename: (req, file, cb) => {

        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

exports.upload = upload.single('avatar');
exports.fileHandle = (req, res) => {
    User.findOne({_id: req.idUser})
    .populate('roles')
    .populate('transactions')
    .exec(async (err, user) => {

      if (err) {
        res.status(200).send({ message: err, status: "errors" });
        return;
      }

      if (!user) {
        res.status(200).send({ message: err, status: "errors" });
      }

      if (!req.file) {
        console.log("No file is available!");
        return res.send({
            success: false
        });

        } else {

            const words = req.file.originalname.split('.');
            const fileType = words[words.length - 1];
            const fileName = uuid.v1() + "." + fileType;

            user.avatar = fileName;
            await user.save();

            fs.rename('./files/' + req.file.originalname, './files/' + fileName, function (err) {
                if (err) {
                    return res.status(200).json({ status: "errors", message: err })
                }

                return res.send({
                    fileName: fileName
                });
            });

        }

    })
    
}

exports.getFile = (req, res) => {

    var url = path.join(__dirname, '../../files/')
    res.sendFile(`${url}/${req.params.fileName}`);
}

exports.delete = (req, res) => {
    fs.unlink(`./files/${req.params.fileName}`, (err) => {
        if (err) return res.status(200).send(err);
        return res.status(200).send('success');
    })
}


