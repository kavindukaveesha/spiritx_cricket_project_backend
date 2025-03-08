import { Request, Response } from "express";
import UniversityService from "../../services/university.service";

class ClientUniversityController {
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
}

export default new ClientUniversityController();