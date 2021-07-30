import express, { Request, Response } from 'express'
import * as SongModel from './Song'
import Logger from './logger'

const router = express.Router()

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const obj = await SongModel.getById(req.params.id)
    if (!obj) {
      return res.status(404).send({error: 'Not found'})
    }
    res.status(200).send(obj)

  } catch (err) {
    Logger.error(err)
    res.status(500).send({error: 'ooops !'})
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  const obj: SongModel.Song = req.body
  try {
    await SongModel.save([obj])
    res.status(200).send(obj)
  } catch (err) {
    Logger.error(err)
    res.status(500).send({error: 'ooops !'})
  }
})

export default router
