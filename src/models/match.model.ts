import mongoose, { Document, Schema, Types } from "mongoose";

// Define enum for match status
export enum MatchStatus {
    UPCOMING = "upcoming",
    ONGOING = "ongoing",
    FINISHED = "finished",
    CANCELLED = "cancelled",
    POSTPONED = "postponed",
}

// Define enum for innings status
export enum InningsStatus {
    NOT_STARTED = "not_started",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
}

// Interface for innings
export interface IInnings {
    inningNumber: number;
    battingTeamId: Types.ObjectId;
    bowlingTeamId: Types.ObjectId;
    runs: number;
    wickets: number;
    overs: number;
    ballsInCurrentOver: number;
    extras: {
        wides: number;
        noBalls: number;
        byes: number;
        legByes: number;
        penalties: number;
    };
    currentBatsmen: Types.ObjectId[];
    currentBowler: Types.ObjectId | null;
    status: InningsStatus;
}

// Define the interface for Match document
export interface IMatch extends Document {
    matchTitle: string;
    team1Id: Types.ObjectId;
    team2Id: Types.ObjectId;
    matchFormat: {
        totalOvers: number;
        inningsPerTeam: number;
    };
    time: string;
    date: Date;
    location: string;
    team1Playing11: Types.ObjectId[];
    team2Playing11: Types.ObjectId[];
    tossWonBy: Types.ObjectId | null;
    tossDecision: "bat" | "bowl" | null;
    currentInningsNumber: number;
    innings: IInnings[];
    winnerTeamId: Types.ObjectId | null;
    manOfTheMatch: Types.ObjectId | null;
    status: MatchStatus;
    currentMatchState: {
        isTimeout: boolean;
        isDrinkBreak: boolean;
        isLunchBreak: boolean;
        isPowerPlay: boolean;
        currentMessage: string;
    };
    createdAt: Date;
    updatedAt: Date;

    // Schema methods
    getCurrentInnings(): IInnings | null;
    recordBall(ballData: any): Promise<void>; // Placeholder for ball data type
    getTotalExtras(inningsNumber: number): number;
}

// Create the Match schema
const MatchSchema: Schema = new Schema(
    {
        matchTitle: {
            type: String,
            required: [true, "Match title is required"],
            trim: true,
        },
        team1Id: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: [true, "Team 1 is required"],
        },
        team2Id: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: [true, "Team 2 is required"],
        },
        matchFormat: {
            totalOvers: {
                type: Number,
                default: 20, // T20 format by default
                min: 1,
            },
            inningsPerTeam: {
                type: Number,
                default: 1,
                min: 1,
                max: 2,
            },
        },
        time: {
            type: String,
            required: [true, "Match time is required"],
        },
        date: {
            type: Date,
            required: [true, "Match date is required"],
        },
        location: {
            type: String,
            required: [true, "Match location is required"],
        },
        team1Playing11: [
            {
                type: Schema.Types.ObjectId,
                ref: "Player",
            },
        ],
        team2Playing11: [
            {
                type: Schema.Types.ObjectId,
                ref: "Player",
            },
        ],
        tossWonBy: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            default: null,
        },
        tossDecision: {
            type: String,
            enum: ["bat", "bowl", null],
            default: null,
        },
        currentInningsNumber: {
            type: Number,
            default: 1,
            min: 1,
        },
        innings: [
            {
                inningNumber: {
                    type: Number,
                    required: true,
                },
                battingTeamId: {
                    type: Schema.Types.ObjectId,
                    ref: "Team",
                    required: true,
                },
                bowlingTeamId: {
                    type: Schema.Types.ObjectId,
                    ref: "Team",
                    required: true,
                },
                runs: {
                    type: Number,
                    default: 0,
                },
                wickets: {
                    type: Number,
                    default: 0,
                    max: 10,
                },
                overs: {
                    type: Number,
                    default: 0,
                },
                ballsInCurrentOver: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 5, // 0-5 because 6 balls completes an over
                },
                extras: {
                    wides: {
                        type: Number,
                        default: 0,
                    },
                    noBalls: {
                        type: Number,
                        default: 0,
                    },
                    byes: {
                        type: Number,
                        default: 0,
                    },
                    legByes: {
                        type: Number,
                        default: 0,
                    },
                    penalties: {
                        type: Number,
                        default: 0,
                    },
                },
                currentBatsmen: [
                    {
                        type: Schema.Types.ObjectId,
                        ref: "Player",
                    },
                ],
                currentBowler: {
                    type: Schema.Types.ObjectId,
                    ref: "Player",
                    default: null,
                },
                status: {
                    type: String,
                    enum: Object.values(InningsStatus),
                    default: InningsStatus.NOT_STARTED,
                },
            },
        ],
        winnerTeamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            default: null,
        },
        manOfTheMatch: {
            type: Schema.Types.ObjectId,
            ref: "Player",
            default: null,
        },
        status: {
            type: String,
            enum: Object.values(MatchStatus),
            default: MatchStatus.UPCOMING,
        },
        currentMatchState: {
            isTimeout: {
                type: Boolean,
                default: false,
            },
            isDrinkBreak: {
                type: Boolean,
                default: false,
            },
            isLunchBreak: {
                type: Boolean,
                default: false,
            },
            isPowerPlay: {
                type: Boolean,
                default: false,
            },
            currentMessage: {
                type: String,
                default: "",
            },
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Validation to ensure teams are different
MatchSchema.pre("validate", function (next) {
    // @ts-ignore
    const match = this as IMatch;
    if (match.team1Id.equals(match.team2Id)) {
        next(new Error("Teams in a match must be different"));
    } else {
        next();
    }
});

// Convenience method to get the current innings
MatchSchema.methods.getCurrentInnings = function (this: IMatch): IInnings | null {
    return this.innings.find((inning) => inning.inningNumber === this.currentInningsNumber) || null;
};

// Helper method for recording a ball
MatchSchema.methods.recordBall = async function (this: IMatch, ballData: any): Promise<void> {
    const match = this;
    const currentInnings = match.getCurrentInnings();

    if (!currentInnings) {
        throw new Error("Current innings not found");
    }

    if (currentInnings.status !== InningsStatus.IN_PROGRESS) {
        throw new Error("Innings is not in progress");
    }

    try {
        // Increment balls in current over
        currentInnings.ballsInCurrentOver += 1;

        // Handle ball outcome (example logic)
        if (ballData.runs) {
            currentInnings.runs += ballData.runs;
        }
        if (ballData.isWicket) {
            currentInnings.wickets += 1;
            if (currentInnings.wickets >= 10) {
                currentInnings.status = InningsStatus.COMPLETED;
            }
        }
        if (ballData.isWide) {
            currentInnings.extras.wides += 1;
            currentInnings.runs += 1; // Wide adds 1 run
            currentInnings.ballsInCurrentOver -= 1; // Wide doesn't count as a ball
        }
        if (ballData.isNoBall) {
            currentInnings.extras.noBalls += 1;
            currentInnings.runs += 1; // No ball adds 1 run
            currentInnings.ballsInCurrentOver -= 1; // No ball doesn't count as a ball
        }

        // Update overs when 6 balls are completed
        if (currentInnings.ballsInCurrentOver >= 6) {
            currentInnings.overs += 1;
            currentInnings.ballsInCurrentOver = 0;
        }

        // Check if innings is complete (e.g., all wickets or overs finished)
        if (
            currentInnings.wickets >= 10 ||
            currentInnings.overs >= match.matchFormat.totalOvers
        ) {
            currentInnings.status = InningsStatus.COMPLETED;
        }

        // Save the updated match
        await match.save();
    } catch (error) {
        // @ts-ignore
        throw new Error(`Failed to record ball: ${error.message}`);
    }
};

// Helper to calculate total extras for an innings
MatchSchema.methods.getTotalExtras = function (this: IMatch, inningsNumber: number): number {
    const match = this;
    const innings = match.innings.find((inn) => inn.inningNumber === inningsNumber);

    if (!innings) return 0;

    const { wides, noBalls, byes, legByes, penalties } = innings.extras;
    return wides + noBalls + byes + legByes + penalties;
};

// Create and export the Match model
export default mongoose.model<IMatch>("Match", MatchSchema);