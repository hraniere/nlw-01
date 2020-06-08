import express from 'express'
import FacilitesController from './controllers/FacilitiesController'
import CategoriesController from './controllers/CategoriesController'
import multer from 'multer'
import multerConfig from './config/multer'
import { celebrate, Joi } from "celebrate";

const routes = express.Router()
const upload = multer(multerConfig)

const facilitiesController = new FacilitesController()
const categoriesController = new CategoriesController()

routes.get('/', (req, res) => {
  return res.json({
    message: 'Hello World'
  })
})

routes.get('/categories', categoriesController.index)

routes.get('/facilities/:id', facilitiesController.show)
routes.get('/facilities', facilitiesController.index)

routes.post(
  '/facilities',
  upload.single('image'),
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      whatsapp: Joi.number().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().required().max(2),
      categories: Joi.string().required()
    })
  }, {
    abortEarly: false
  }),
  facilitiesController.create
)

export default routes