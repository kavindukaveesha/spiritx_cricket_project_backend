import { Request, Response } from "express";
import UniversityService from "../../services/university.service";

class UniversityController {
    async createUniversity(req: Request, res: Response) {
        try {
            const universityData = req.body;
            const university = await UniversityService.createUniversity(universityData);
            res.status(201).json({ message: "University created successfully", university });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getUniversityById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const university = await UniversityService.getUniversityById(id);
            res.status(200).json(university);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async getAllUniversities(req: Request, res: Response) {
        try {
            const universities = await UniversityService.getAllUniversities();
            res.status(200).json(universities);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateUniversity(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const university = await UniversityService.updateUniversity(id, updateData);
            res.status(200).json({ message: "University updated successfully", university });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteUniversity(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await UniversityService.deleteUniversity(id);
            res.status(200).json({ message: "University deleted successfully" });
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }
}

export default new UniversityController();