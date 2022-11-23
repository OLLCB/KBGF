
const UsersRepository = require('./usersRepository'); 
const ImageFilesRepository = require('./imageFilesRepository.js');
const ImageModel = require('./image.js');
const utilities = require("../utilities");
const User = require('./user');
const HttpContext = require('../httpContext').get();

module.exports =
    class ImagesRepository extends require('./repository') {
        constructor() {
            super(new ImageModel(), true /* cached */);
            this.setBindExtraDataMethod(this.bindImageURL);
        }
        bindImageURL(image) {
            if (image) {
                let bindedImage = { ...image };
                if (image["GUID"] != "") {
                    bindedImage["OriginalURL"] = HttpContext.host + ImageFilesRepository.getImageFileURL(image["GUID"]);
                    bindedImage["ThumbnailURL"] = HttpContext.host + ImageFilesRepository.getThumbnailFileURL(image["GUID"]);
                } else {
                    bindedImage["OriginalURL"] = "";
                    bindedImage["ThumbnailURL"] = "";
                }
                if(image["UserId"]){
                    let usersRepository = new UsersRepository();
                    let user = usersRepository.get(image["UserId"])
                    bindedImage["AvatarURL"] = user.AvatarURL;
                    bindedImage["Username"] = user.Name;
                }
                else{
                    bindedImage["AvatarURL"] = "";
                    bindedImage["Usename"] = "";
                }
                return bindedImage;
            }
            return null;
        }
        getAll(params = null){
            let images = super.getAll(params);
            let retain = true;
            if(params.Keywords){
                let keywords = params.Keywords.toLowerCase().split(" ");
                let imagesToRetain = [];
                for(let image of images){
                    for(let keyword of keywords){
                        if(image.Hashtag.toLowerCase().indexOf(keyword) < 0){
                            retain = false;
                            break; // Car tous les mots clés doivent être présent pour afficher l'image.
                        }
                    }
                    if(retain){
                        imagesToRetain.push(image);
                    }
                    retain = true;
                }
                return imagesToRetain;
            }
            else{
                return images;
            }
        }
        add(image) {
            if (this.model.valid(image)) {
                image["GUID"] = ImageFilesRepository.storeImageData("", image["ImageData"]);
                delete image["ImageData"];
                return this.bindImageURL(super.add(image));
            }
            return null;
        }
        update(image) {
            if (this.model.valid(image)) {
                image["GUID"] = ImageFilesRepository.storeImageData(image["GUID"], image["ImageData"]);
                delete image["ImageData"];
                return super.update(image);
            }
            return false;
        }
        remove(id) {
            let foundImage = super.get(id);
            if (foundImage) {
                ImageFilesRepository.removeImageFile(foundImage["GUID"]);
                return super.remove(id);
            }
            return false;
        }
    }