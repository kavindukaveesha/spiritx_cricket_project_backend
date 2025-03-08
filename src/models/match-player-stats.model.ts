import mongoose, { Document, Schema } from 'mongoose';

// Define enum for player performance type
export enum PerformanceType {
    BATTING = 'batting',
    BOWLING = 'bowling',
    FIELDING = 'fielding'
}

// Interface for batting stats
export interface IBattingStats {
    runsScored: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    isOut: boolean;
    dismissalType?: string;
    dismissedBy?: mongoose.Types.ObjectId;
    caughtBy?: mongoose.Types.ObjectId;
}

// Interface for bowling stats
export interface IBowlingStats {
    oversBowled: number;
    runsConceded: number;
    wicketsTaken: number;
    maidens: number;
    noBalls: number;
    wides: number;
}

// Interface for fielding stats
export interface IFieldingStats {
    catches: number;
    runouts: number;
    stumpings: number;
}

// Define the interface for MatchPlayerStats document
export interface IMatchPlayerStats extends Document {
    matchId: mongoose.Types.ObjectId;
    playerId: mongoose.Types.ObjectId;
    teamId: mongoose.Types.ObjectId;
    performanceType: PerformanceType[];
    battingStats: IBattingStats;
    bowlingStats: IBowlingStats;
    fieldingStats: IFieldingStats;
    createdAt: Date;
    updatedAt: Date;
}

// Create the MatchPlayerStats schema
const MatchPlayerStatsSchema: Schema = new Schema(
    {
        matchId: {
            type: Schema.Types.ObjectId,
            ref: 'Match',
            required: [true, 'Match is required']
        },
        playerId: {
            type: Schema.Types.ObjectId,
            ref: 'Player',
            required: [true, 'Player is required']
        },
        teamId: {
            type: Schema.Types.ObjectId,
            ref: 'Team',
            required: [true, 'Team is required']
        },
        performanceType: {
            type: [String],
            enum: Object.values(PerformanceType),
            default: []
        },
        battingStats: {
            runsScored: {
                type: Number,
                default: 0
            },
            ballsFaced: {
                type: Number,
                default: 0
            },
            fours: {
                type: Number,
                default: 0
            },
            sixes: {
                type: Number,
                default: 0
            },
            isOut: {
                type: Boolean,
                default: false
            },
            dismissalType: {
                type: String,
                enum: ['bowled', 'caught', 'lbw', 'run out', 'stumped', 'hit wicket', 'obstructing the field', 'timed out', 'retired hurt', null],
                default: null
            },
            dismissedBy: {
                type: Schema.Types.ObjectId,
                ref: 'Player',
                default: null
            },
            caughtBy: {
                type: Schema.Types.ObjectId,
                ref: 'Player',
                default: null
            }
        },
        bowlingStats: {
            oversBowled: {
                type: Number,
                default: 0
            },
            runsConceded: {
                type: Number,
                default: 0
            },
            wicketsTaken: {
                type: Number,
                default: 0
            },
            maidens: {
                type: Number,
                default: 0
            },
            noBalls: {
                type: Number,
                default: 0
            },
            wides: {
                type: Number,
                default: 0
            }
        },
        fieldingStats: {
            catches: {
                type: Number,
                default: 0
            },
            runouts: {
                type: Number,
                default: 0
            },
            stumpings: {
                type: Number,
                default: 0
            }
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Ensure unique player per match
MatchPlayerStatsSchema.index({ matchId: 1, playerId: 1 }, { unique: true });

// Calculate bowling economy rate
MatchPlayerStatsSchema.virtual('bowlingStats.economyRate').get(function() {
    const overs = this.bowlingStats.oversBowled;
    const runs = this.bowlingStats.runsConceded;

    if (overs === 0) return 0;

    return parseFloat((runs / overs).toFixed(2));
});

// Calculate batting strike rate
MatchPlayerStatsSchema.virtual('battingStats.strikeRate').get(function() {
    const runs = this.battingStats.runsScored;
    const balls = this.battingStats.ballsFaced;

    if (balls === 0) return 0;

    return parseFloat(((runs / balls) * 100).toFixed(2));
});

// Create and export the MatchPlayerStats model
export default mongoose.model<IMatchPlayerStats>('MatchPlayerStats', MatchPlayerStatsSchema);