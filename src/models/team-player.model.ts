import mongoose, { Document, Schema } from 'mongoose';

// Define enum for player roles
export enum PlayerRole {
    BATSMAN = 'batsman',
    BOWLER = 'bowler',
    ALL_ROUNDER = 'all-rounder',
    WICKET_KEEPER = 'wicket-keeper',
    CAPTAIN = 'captain'
}

// Define the interface for TeamPlayer document
export interface ITeamPlayer extends Document {
    teamId: mongoose.Types.ObjectId;
    playerId: mongoose.Types.ObjectId;
    role: PlayerRole;
    fullScore: number;
    fullWickets: number;
    fullCatches: number;
    allrounderPoints: number;
    createdAt: Date;
    updatedAt: Date;
}

// Create the TeamPlayer schema
const TeamPlayerSchema: Schema = new Schema(
    {
        teamId: {
            type: Schema.Types.ObjectId,
            ref: 'Team',
            required: [true, 'Team is required']
        },
        playerId: {
            type: Schema.Types.ObjectId,
            ref: 'Player',
            required: [true, 'Player is required']
        },
        role: {
            type: String,
            enum: Object.values(PlayerRole),
            required: [true, 'Player role is required']
        },
        fullScore: {
            type: Number,
            default: 0
        },
        fullWickets: {
            type: Number,
            default: 0
        },
        fullCatches: {
            type: Number,
            default: 0
        },
        allrounderPoints: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Create index for unique player per team
TeamPlayerSchema.index({ teamId: 1, playerId: 1 }, { unique: true });

// Create and export the TeamPlayer model
export default mongoose.model<ITeamPlayer>('TeamPlayer', TeamPlayerSchema);