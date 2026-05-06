import { pool } from '../../main';
import { Animal, CreateAnimalDTO, UpdateAnimalDTO } from './animals.types';
import { CustomError } from '../../shared/middleware/errorHandler';

export class AnimalsService {
  /**
   * Create a new animal record
   */
  async createAnimal(data: CreateAnimalDTO, userId: string): Promise<Animal> {
    const query = `
      INSERT INTO animals (
        name, species, breed, estimated_age_years, estimated_age_months,
        gender, size, color_description, distinctive_marks, medical_notes,
        behavioral_notes, entry_date, entry_reason, status, microchip_id, created_by
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'rescate', $14, $15
      )
      RETURNING *
    `;

    const values = [
      data.name,
      data.species,
      data.breed || null,
      data.estimatedAgeYears || null,
      data.estimatedAgeMonths || null,
      data.gender,
      data.size,
      data.colorDescription || null,
      data.distinctiveMarks || null,
      data.medicalNotes || null,
      data.behavioralNotes || null,
      data.entryDate,
      data.entryReason || null,
      data.microchipId || null,
      userId,
    ];

    const result = await pool.query(query, values);
    return this.formatAnimal(result.rows[0]);
  }

  /**
   * Get all animals with pagination
   */
  async getAllAnimals(page: number = 1, limit: number = 20): Promise<{
    data: Animal[];
    total: number;
    page: number;
    limit: number;
  }> {
    const offset = (page - 1) * limit;

    const countQuery = 'SELECT COUNT(*) FROM animals';
    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].count, 10);

    const query = `
      SELECT * FROM animals
      ORDER BY entry_date DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    return {
      data: result.rows.map(row => this.formatAnimal(row)),
      total,
      page,
      limit,
    };
  }

  /**
   * Get animal by ID
   */
  async getAnimalById(id: string): Promise<Animal> {
    const query = 'SELECT * FROM animals WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new CustomError(404, 'Animal not found');
    }

    return this.formatAnimal(result.rows[0]);
  }

  /**
   * Get animals by status
   */
  async getAnimalsByStatus(status: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT * FROM animals
      WHERE status = $1
      ORDER BY entry_date DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [status, limit, offset]);
    return result.rows.map(row => this.formatAnimal(row));
  }

  /**
   * Update animal
   */
  async updateAnimal(id: string, data: UpdateAnimalDTO): Promise<Animal> {
    const animal = await this.getAnimalById(id);

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const fields: Record<string, string> = {
      name: 'name',
      breed: 'breed',
      estimatedAgeYears: 'estimated_age_years',
      estimatedAgeMonths: 'estimated_age_months',
      gender: 'gender',
      size: 'size',
      colorDescription: 'color_description',
      distinctiveMarks: 'distinctive_marks',
      medicalNotes: 'medical_notes',
      behavioralNotes: 'behavioral_notes',
      status: 'status',
      microchipId: 'microchip_id',
    };

    for (const [key, column] of Object.entries(fields)) {
      if (key in data && data[key as keyof UpdateAnimalDTO] !== undefined) {
        updates.push(`${column} = $${paramCount}`);
        values.push(data[key as keyof UpdateAnimalDTO]);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return animal;
    }

    values.push(id);
    const query = `
      UPDATE animals
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return this.formatAnimal(result.rows[0]);
  }

  /**
   * Delete animal (soft delete by updating status)
   */
  async deleteAnimal(id: string): Promise<void> {
    const query = `
      UPDATE animals
      SET status = 'fallecido', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      throw new CustomError(404, 'Animal not found');
    }
  }

  /**
   * Search animals by name or breed
   */
  async searchAnimals(query: string): Promise<Animal[]> {
    const searchQuery = `
      SELECT * FROM animals
      WHERE name ILIKE $1 OR breed ILIKE $1
      ORDER BY name ASC
      LIMIT 50
    `;

    const result = await pool.query(searchQuery, [`%${query}%`]);
    return result.rows.map(row => this.formatAnimal(row));
  }

  /**
   * Get animals awaiting adoption
   */
  async getAnimalsForAdoption(): Promise<Animal[]> {
    const query = `
      SELECT * FROM animals
      WHERE status = 'cuidado'
      ORDER BY entry_date ASC
    `;

    const result = await pool.query(query);
    return result.rows.map(row => this.formatAnimal(row));
  }

  /**
   * Format database row to Animal object
   */
  private formatAnimal(row: any): Animal {
    return {
      id: row.id,
      name: row.name,
      species: row.species,
      breed: row.breed,
      estimatedAgeYears: row.estimated_age_years,
      estimatedAgeMonths: row.estimated_age_months,
      gender: row.gender,
      size: row.size,
      colorDescription: row.color_description,
      distinctiveMarks: row.distinctive_marks,
      medicalNotes: row.medical_notes,
      behavioralNotes: row.behavioral_notes,
      entryDate: row.entry_date,
      entryReason: row.entry_reason,
      status: row.status,
      photoUrl: row.photo_url,
      additionalPhotos: row.additional_photos,
      microchipId: row.microchip_id,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
