const router = require('express').Router();
const Product = require('./../models/product');
const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const faker = require('faker')
//fill in the line below with your own accessKeyId and secretAccessKey and uncomment it
// const s3 = new aws.S3({
//     accessKeyId: your access key id,
//     secretAccessKey: your secret key
// });

const checkJWT = require('./../middlewares/check-jwt');

const upload = multer({
    storage: multer({
        s3: s3,
        //replace below bucket with your own
        bucket: 'amazonowebapp13',
        metadata: function (req, file, cb) {
            cb(null, {
                fieldName: file.fieldName
            })
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
});

router.route('/products')
    .get(checkJWT, (req, res, next) => {
        Product.find({
                owner: req.decoded.user._id
            })
            .populate('owner')
            .populate('category')
            .exec((err, products) => {
                if (products) {
                    res.json({
                        success: true,
                        message: "Products",
                        products: products
                    });
                }
            });
    })
    .post([checkJWT, upload.single('product_picture')], (req, res, next) => {
        console.log(upload);
        console.log(req.file);
        let product = new Product();
        product.owner = req.decoded.user._id;
        product.category = req.body.categoryId;
        product.title = req.body.title;
        product.price = req.body.price;
        product.description = req.body.description;
        product.image = req.file.location;
        product.save();
        res.json({
            success: true,
            message: 'Successfully Added Your Product'
        });
    });

//just for testing. This code will generate fake data feel free to remove
router.get('/faker/test', (req, res, next) => {
    for (i = 0; i < 20; i++) {
        let product = new Product();
        product.category = "5a686728080eae201861616a";
        product.owner = "5acbbf8b81ac8c298c71116d";
        product.image = faker.image.food();
        product.title = faker.commerce.productName();
        product.description = faker.lorem.words();
        product.price = faker.commerce.price();
        product.save();
    }

    res.json({
        message: "Successfully added 20 pictures"
    });

});


module.exports = router;