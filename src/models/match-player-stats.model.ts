import mongoose, { Document, Schema, Types } from "mongoose";

// Define enum for player performance type
export enum PerformanceType {
    BATTING = "batting",
    BOWLING = "bowling",
    FIELDING = "fielding",
}

// Interface for batting stats
export interface IBattingStats {
    runsScored: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    isOut: boolean;
    dismissalType?: "bowled" | "caught" | "lbw" | "run out" | "stumped" | "hit wicket" | "obstructing the field" | "timed out" | "retired hurt" | null;
    dismissedBy?: Types.ObjectId;
    caughtBy?: Types.ObjectId;
    strikeRate?: number; // Virtual field
}

// Interface for bowling stats
export interface IBowlingStats {
    oversBowled: number;
    runsConceded: number;
    wicketsTaken: number;
    maidens: number;
    noBalls: number;
    wides: number;
    economyRate?: number; // Virtual field
}

// Interface for fielding stats
export interface IFieldingStats {
    catches: number;
    runouts: number;
    stumpings: number;
}

// Define the interface for MatchPlayerStats document
export interface IMatchPlayerStats extends Document {
    matchId: Types.ObjectId;
    playerId: Types.ObjectId;
    teamId: Types.ObjectId;
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
            ref: "Match",
            required: [true, "Match is required"],
        },
        playerId: {
            type: Schema.Types.ObjectId,
            ref: "Player",
            required: [true, "Player is required"],
        },
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: [true, "Team is required"],
        },
        performanceType: {
            type: [String],
            enum: Object.values(PerformanceType),
            default: [],
        },
        battingStats: {
            runsScored: {
                type: Number,
                default: 0,
                min: 0, // Non-negative runs
            },
            ballsFaced: {
                type: Number,
                default: 0,
                min: 0, // Non-negative balls
            },
            fours: {
                type: Number,
                default: 0,
                min: 0, // Non-negative fours
            },
            sixes: {
                type: Number,
                default: 0,
                min: 0, // Non-negative sixes
            },
            isOut: {
                type: Boolean,
                default: false,
            },
            dismissalType: {
                type: String,
                enum: [
                    "bowled",
                    "caught",
                    "lbw",
                    "run out",
                    "stumped",
                    "hit wicket",
                    "obstructing the field",
                    "timed out",
                    "retired hurt",
                    null,
                ],
                default: null,
            },
            dismissedBy: {
                type: Schema.Types.ObjectId,
                ref: "Player",
                default: null,
            },
            caughtBy: {
                type: Schema.Types.ObjectId,
                ref: "Player",
                default: null,
            },
        },
        bowlingStats: {
            oversBowled: {
                type: Number,
                default: 0,
                min: 0, // Non-negative overs
                validate: {
                    validator: function (v: number) {
                        return Number.isInteger(v) || v.toString().split(".").length === 2; // Allow 0.1, 0.2, etc., but not negative
                    },
                    message: "Overs must be a non-negative number or decimal (e.g., 5.1)",
                },
            },
            runsConceded: {
                type: Number,
                default: 0,
                min: 0, // Non-negative runs
            },
            wicketsTaken: {
                type: Number,
                default: 0,
                min: 0, // Non-negative wickets
            },
            maidens: {
                type: Number,
                default: 0,
                min: 0, // Non-negative maidens
            },
            noBalls: {
                type: Number,
                default: 0,
                min: 0, // Non-negative no balls
            },
            wides: {
                type: Number,
                default: 0,
                min: 0, // Non-negative wides
            },
        },
        fieldingStats: {
            catches: {
                type: Number,
                default: 0,
                min: 0, // Non-negative catches
            },
            runouts: {
                type: Number,
                default: 0,
                min: 0, // Non-negative runouts
            },
            stumpings: {
                type: Number,
                default: 0,
                min: 0, // Non-negative stumpings
            },
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in toJSON
        toObject: { virtuals: true }, // Include virtuals in toObject
    }
);

// Ensure unique player per match
MatchPlayerStatsSchema.index({ matchId: 1, playerId: 1 }, { unique: true });

// Calculate bowling economy rate
MatchPlayerStatsSchema.virtual("bowlingStats.economyRate").get(function (this: IMatchPlayerStats) {
    const overs = this.bowlingStats?.oversBowled || 0;
    const runs = this.bowlingStats?.runsConceded || 0;

    if (overs === 0) return 0;

    // Handle partial overs (e.g., 5.2 overs)
    const totalBalls = Math.floor(overs) * 6 + (overs % 1) * 10; // Convert to total balls (e.g., 5.2 = 32 balls)
    if (totalBalls === 0) return 0;

    const economy = (runs / (totalBalls / 6)).toFixed(2); // Economy per over
    return parseFloat(economy);
});

// Calculate batting strike rate
MatchPlayerStatsSchema.virtual("battingStats.strikeRate").get(function (this: IMatchPlayerStats) {
    const runs = this.battingStats?.runsScored || 0;
    const balls = this.battingStats?.ballsFaced || 0;

    if (balls === 0) return 0;

    const strikeRate = ((runs / balls) * 100).toFixed(2);
    return parseFloat(strikeRate);
});

// Create and export the MatchPlayerStats model
export default mongoose.model<IMatchPlayerStats>("MatchPlayerStats", MatchPlayerStatsSchema);