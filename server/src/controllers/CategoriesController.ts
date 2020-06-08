import { Request, Response } from 'express'
import knex from '../database/connection'

class CategoriesController {
  async index(req: Request, res: Response) {
    const categories = await knex('categories').select('*')

    const serializedCategories = categories.map(item => {
      return {
        ...item,
        image_url: `http://localhost:3333/uploads/${item.image}`
      }
    })
    return res.json(serializedCategories)
  }
}

export default CategoriesController