import { PlayerModel, IPlayer } from '../models';
import mongoose from 'mongoose';

class PlayerRepository {
    /**
     * Create a new player
     */
    async create(playerData: Partial<IPlayer>): Promise<IPlayer> {
        try {
            const player = new PlayerModel(playerData);
            return await player.save();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Find player by ID
     */
    async findById(id: string): Promise<IPlayer | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid player ID');
            }
            return await PlayerModel.findById(id);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Find player by playerId (custom ID)
     */
    async findByPlayerId(playerId: string): Promise<IPlayer | null> {
        try {
            return await PlayerModel.findOne({ playerId });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Find player by email
     */
    async findByEmail(email: string): Promise<IPlayer | null> {
        try {
            return await PlayerModel.findOne({ email });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Find player by email with password
     */
    async findByEmailWithPassword(email: string): Promise<IPlayer | null> {
        try {
            return await PlayerModel.findOne({ email }).select('+password');
        } catch (error) {
            throw error;
        }
    }
    /**
     * Find player by ID with password
     */
    async findByIdWithPassword(id: string): Promise<IPlayer | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid player ID');
            }
            return await PlayerModel.findById(id).select('+password');
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all players
     */
    async findAll(query: any = {}): Promise<IPlayer[]> {
        try {
            return await PlayerModel.find(query)
                .populate('universityId', 'name location')
                .sort({ firstName: 1, lastName: 1 });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update player
     */
    async update(id: string, playerData: Partial<IPlayer>): Promise<IPlayer | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid player ID');
            }

            return await PlayerModel.findByIdAndUpdate(
                id,
                { $set: playerData },
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update player by email
     */
    async updateByEmail(email: string, playerData: Partial<IPlayer>): Promise<IPlayer | null> {
        try {
            return await PlayerModel.findOneAndUpdate(
                { email },
                { $set: playerData },
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw error;
        }
    }

    /**
     * Set verification status
     */
    /**
     * Set verification status
     */
    async setVerificationStatus(id: string, isVerified: boolean): Promise<IPlayer | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid player ID');
            }

            return await PlayerModel.findByIdAndUpdate(
                id,
                { $set: { isVerified } },
                { new: true }
            );
        } catch (error) {
            throw error;
        }
    }

    /**
     * Activate/Deactivate player
     */
    async setActiveStatus(id: string, isActive: boolean): Promise<IPlayer | null> {
        try {
            return await PlayerModel.findByIdAndUpdate(
                id,
                { $set: { isActive } },
                { new: true }
            );
        } catch (error) {
            throw error;
        }
    }


    /**
     * Update password
     */
    async updatePassword(id: string, password: string): Promise<IPlayer | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid player ID');
            }

            const player = await PlayerModel.findById(id);
            if (!player) {
                throw new Error('Player not found');
            }

            player.password = password;
            return await player.save();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete player
     */
    async delete(id: string): Promise<IPlayer | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid player ID');
            }
            return await PlayerModel.findByIdAndDelete(id);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Check if player is captain of a team
     */
    async isTeamCaptain(playerId: string, teamId: string): Promise<boolean> {
        try {
            if (!mongoose.Types.ObjectId.isValid(playerId) || !mongoose.Types.ObjectId.isValid(teamId)) {
                throw new Error('Invalid ID');
            }

            const count = await mongoose.model('Team').countDocuments({
                _id: teamId,
                captainId: playerId
            });

            return count > 0;
        } catch (error) {
            throw error;
        }
    }

    async findByUniversityAndJerseyNumber(universityId: string, jerseyNumber: number): Promise<IPlayer | null> {
        return await PlayerModel.findOne({ universityId, jerseyNumber }).exec();
    }
}

export default new PlayerRepository();