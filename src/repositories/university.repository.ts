import{UniversityModel,IUniversity} from "../models";


class UniversityRepository {
    async create(universityData: Partial<IUniversity>): Promise<IUniversity> {
        return await UniversityModel.create(universityData);
    }

    async findById(id: string): Promise<IUniversity | null> {
        return await UniversityModel.findById(id).exec();
    }

    async findAll(): Promise<IUniversity[]> {
        return await UniversityModel.find().exec();
    }

    async findByName(name: string): Promise<IUniversity | null> {
        return await UniversityModel.findOne({ name }).exec();
    }

    async update(id: string, updateData: Partial<IUniversity>): Promise<IUniversity | null> {
        return await UniversityModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }

    async delete(id: string): Promise<IUniversity | null> {
        return await UniversityModel.findByIdAndDelete(id).exec();
    }
}

export default new UniversityRepository();