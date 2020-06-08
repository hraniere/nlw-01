import { Request, Response, response } from 'express'

import knex from '../database/connection'

class FacilitiesController {
  async create(req: Request, res: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      categories,
    } = req.body

    const facility = {
      image: req.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    }

    const trx = await knex.transaction();
    try {
      const insertedIds = await trx('facilities').insert(facility)
      const facility_id = insertedIds[0]
      const facilityCategories = categories
        .split(',')
        .map((category: string) => Number(category.trim()))
        .map((category_id: number) => ({
          facility_id,
          category_id
        }))

      await trx('facility_categories').insert(facilityCategories)
      await trx.commit()
      return res.json({
        id: facility_id,
        ...facility
      })
    } catch {
      trx.rollback()
      return res.status(400).json({ message: 'Could not create Facility' })
    }


  }

  async show(req: Request, res: Response) {
    const { id } = req.params
    const facility = await knex('Facilities').where('id', id).first()
    if (!facility) {
      return res.status(404).json({
        message: 'Facility not found'
      })
    }

    facility.categories = await knex('categories')
      .join('facility_categories', 'categories.id', '=', 'facility_categories.category_id')
      .where('facility_categories.facility_id', id).select('categories.title')

    const serializedFacility = {
      ...facility,
      image_url: `http://localhost:3333/uploads/${facility.image}`
    }

    res.json(serializedFacility)
  }

  async index(req: Request, res: Response) {
    const { city, uf, categories } = req.query

    const parsedCategories = String(categories).split(',').map(item => Number(item.trim()))

    const facilities = await knex('facilities')
      .join('facility_categories', 'facilities.id', '=', 'facility_categories.facility_id')
      .whereIn('facility_categories.category_id', parsedCategories)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('facilities.*')

    const serializedFacilities = facilities.map(facility => {
      return {
        ...facility,
        image_url: `http://localhost:3333/uploads/${facility.image}`
      }
    })
    return res.json(serializedFacilities)
  }
}

export default FacilitiesController