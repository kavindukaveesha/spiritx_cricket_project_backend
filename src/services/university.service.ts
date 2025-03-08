import {IUniversity} from "../models";
import UniversityRepository from "../repositories/university.repository";


class UniversityService {
    async createUniversity(universityData: Partial<IUniversity>): Promise<IUniversity> {
        const existingUniversity = await UniversityRepository.findByName(universityData.name!);
        if (existingUniversity) {
            throw new Error("University with this name already exists");
        }
        return await UniversityRepository.create(universityData);
    }

    async getUniversityById(id: string): Promise<IUniversity> {
        const university = await UniversityRepository.findById(id);
        if (!university) {
            throw new Error("University not found");
        }
        return university;
    }

    async getAllUniversities(): Promise<IUniversity[]> {
        return await UniversityRepository.findAll();
    }

    async updateUniversity(id: string, updateData: Partial<IUniversity>): Promise<IUniversity> {
        const university = await UniversityRepository.update(id, updateData);
        if (!university) {
            throw new Error("University not found");
        }
        return university;
    }

    async deleteUniversity(id: string): Promise<void> {
        const university = await UniversityRepository.delete(id);
        if (!university) {
            throw new Error("University not found");
        }
    }

}

export default new UniversityService();