import { Router } from 'express';
import { AnimalsController } from './animals.controller';

const router = Router();
const controller = new AnimalsController();

/**
 * Animals Routes
 */

// Search must come before :id routes to avoid conflicts
router.get('/search', (req, res, next) => controller.searchAnimals(req, res, next));
router.get('/for-adoption', (req, res, next) => controller.getAnimalsForAdoption(req, res, next));

// CRUD operations
router.post('/', (req, res, next) => controller.createAnimal(req, res, next));
router.get('/', (req, res, next) => controller.getAllAnimals(req, res, next));
router.get('/:id', (req, res, next) => controller.getAnimalById(req, res, next));
router.put('/:id', (req, res, next) => controller.updateAnimal(req, res, next));
router.delete('/:id', (req, res, next) => controller.deleteAnimal(req, res, next));

// Status filter
router.get('/status/:status', (req, res, next) => controller.getAnimalsByStatus(req, res, next));

export default router;
