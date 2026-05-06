import { Request, Response, NextFunction } from 'express';
import { AnimalsService } from './animals.service';
import { CreateAnimalDTO, UpdateAnimalDTO } from './animals.types';

const animalsService = new AnimalsService();

export class AnimalsController {
  /**
   * POST /api/animals - Create a new animal
   */
  async createAnimal(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id; // Assumes auth middleware sets req.user
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const animalData: CreateAnimalDTO = req.body;
      const animal = await animalsService.createAnimal(animalData, userId);

      res.status(201).json({
        success: true,
        data: animal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/animals - Get all animals with pagination
   */
  async getAllAnimals(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await animalsService.getAllAnimals(page, limit);

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/animals/:id - Get animal by ID
   */
  async getAnimalById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const animal = await animalsService.getAnimalById(id);

      res.json({
        success: true,
        data: animal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/animals/status/:status - Get animals by status
   */
  async getAnimalsByStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const animals = await animalsService.getAnimalsByStatus(status, page, limit);

      res.json({
        success: true,
        data: animals,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/animals/:id - Update animal
   */
  async updateAnimal(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData: UpdateAnimalDTO = req.body;

      const animal = await animalsService.updateAnimal(id, updateData);

      res.json({
        success: true,
        data: animal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/animals/:id - Delete animal (soft delete)
   */
  async deleteAnimal(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await animalsService.deleteAnimal(id);

      res.json({
        success: true,
        message: 'Animal deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/animals/search?q=query - Search animals
   */
  async searchAnimals(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Search query required',
        });
      }

      const animals = await animalsService.searchAnimals(q);

      res.json({
        success: true,
        data: animals,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/animals/for-adoption - Get animals available for adoption
   */
  async getAnimalsForAdoption(req: Request, res: Response, next: NextFunction) {
    try {
      const animals = await animalsService.getAnimalsForAdoption();

      res.json({
        success: true,
        data: animals,
      });
    } catch (error) {
      next(error);
    }
  }
}
