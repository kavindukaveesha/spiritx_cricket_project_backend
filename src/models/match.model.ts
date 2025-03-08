import mongoose, { Document, Schema } from 'mongoose';

// Define enum for match status
export enum MatchStatus {
    UPCOMING = 'upcoming',
    ONGOING = 'ongoing',
    FINISHED = 'finished',
    CANCELLED = 'cancelled',
    POSTPONED = 'postponed'
}

// Define enum for innings
export enum InningsStatus {
    NOT_STARTED = 'not_started',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed'
}

// Interface for innings
export interface IInnings {
    inningNumber: number;
    battingTeamId: mongoose.Types.ObjectId;
    bowlingTeamId: mongoose.Types.ObjectId;
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
    currentBatsmen: mongoose.Types.ObjectId[];
    currentBowler: mongoose.Types.ObjectId | null;
    status: InningsStatus;
}

// Define the interface for Match document
export interface IMatch extends Document {
    matchTitle: string;
    team1Id: mongoose.Types.ObjectId;
    team2Id: mongoose.Types.ObjectId;
    matchFormat: {
        totalOvers: number;
        inningsPerTeam: number;
    };
    time: string;
    date: Date;
    location: string;
    team1Playing11: mongoose.Types.ObjectId[];
    team2Playing11: mongoose.Types.ObjectId[];
    tossWonBy: mongoose.Types.ObjectId | null;
    tossDecision: 'bat' | 'bowl' | null;
    currentInningsNumber: number;
    innings: IInnings[];
    winnerTeamId: mongoose.Types.ObjectId | null;
    manOfTheMatch: mongoose.Types.ObjectId | null;
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
}

// Create the Match schema
const MatchSchema: Schema = new Schema(
    {
        matchTitle: {
            type: String,
            required: [true, 'Match title is required'],
            trim: true
        },
        team1Id: {
            type: Schema.Types.ObjectId,
            ref: 'Team',
            required: [true, 'Team 1 is required']
        },
        team2Id: {
            type: Schema.Types.ObjectId,
            ref: 'Team',
            required: [true, 'Team 2 is required']
        },
        matchFormat: {
            totalOvers: {
                type: Number,
                default: 20, // T20 format by default
                min: 1
            },
            inningsPerTeam: {
                type: Number,
                default: 1,
                min: 1,
                max: 2
            }
        },
        time: {
            type: String,
            required: [true, 'Match time is required']
        },
        date: {
            type: Date,
            required: [true, 'Match date is required']
        },
        location: {
            type: String,
            required: [true, 'Match location is required']
        },
        team1Playing11: [{
            type: Schema.Types.ObjectId,
            ref: 'Player'
        }],
        team2Playing11: [{
            type: Schema.Types.ObjectId,
            ref: 'Player'
        }],
        tossWonBy: {
            type: Schema.Types.ObjectId,
            ref: 'Team',
            default: null
        },
        tossDecision: {
            type: String,
            enum: ['bat', 'bowl', null],
            default: null
        },
        currentInningsNumber: {
            type: Number,
            default: 1,
            min: 1
        },
        innings: [{
            inningNumber: {
                type: Number,
                required: true
            },
            battingTeamId: {
                type: Schema.Types.ObjectId,
                ref: 'Team',
                required: true
            },
            bowlingTeamId: {
                type: Schema.Types.ObjectId,
                ref: 'Team',
                required: true
            },
            runs: {
                type: Number,
                default: 0
            },
            wickets: {
                type: Number,
                default: 0,
                max: 10
            },
            overs: {
                type: Number,
                default: 0
            },
            ballsInCurrentOver: {
                type: Number,
                default: 0,
                min: 0,
                max: 5 // 0-5 because 6 balls completes an over
            },
            extras: {
                wides: {
                    type: Number,
                    default: 0
                },
                noBalls: {
                    type: Number,
                    default: 0
                },
                byes: {
                    type: Number,
                    default: 0
                },
                legByes: {
                    type: Number,
                    default: 0
                },
                penalties: {
                    type: Number,
                    default: 0
                }
            },
            currentBatsmen: [{
                type: Schema.Types.ObjectId,
                ref: 'Player'
            }],
            currentBowler: {
                type: Schema.Types.ObjectId,
                ref: 'Player',
                default: null
            },
            status: {
                type: String,
                enum: Object.values(InningsStatus),
                default: InningsStatus.NOT_STARTED
            }
        }],
        winnerTeamId: {
            type: Schema.Types.ObjectId,
            ref: 'Team',
            default: null
        },
        manOfTheMatch: {
            type: Schema.Types.ObjectId,
            ref: 'Player',
            default: null
        },
        status: {
            type: String,
            enum: Object.values(MatchStatus),
            default: MatchStatus.UPCOMING
        },
        currentMatchState: {
            isTimeout: {
                type: Boolean,
                default: false
            },
            isDrinkBreak: {
                type: Boolean,
                default: false
            },
            isLunchBreak: {
                type: Boolean,
                default: false
            },
            isPowerPlay: {
                type: Boolean,
                default: false
            },
            currentMessage: {
                type: String,
                default: ''
            }
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Validation to ensure teams are different
MatchSchema.pre('validate', function(next) {
    const match = this as IMatch;
    if (String(match.team1Id) === String(match.team2Id)) {
        next(new Error('Teams in a match must be different'));
    } else {
        next();
    }
});

// Convenience method to get the current innings
MatchSchema.methods.getCurrentInnings = function() {
    const match = this as IMatch;
    return match.innings.find(inning => inning.inningNumber === match.currentInningsNumber);
};

// Helper method for recording a ball
MatchSchema.methods.recordBall = async function(ballData) {
    const match = this as IMatch;
    const currentInnings = match.getCurrentInnings();

    if (!currentInnings) {
        throw new Error('Current innings not found');
    }

    if (currentInnings.status !== InningsStatus.IN_PROGRESS) {
        throw new Error('Innings is not in progress');
    }

    // Logic would be implemented to record the ball and update the innings
    // This would typically be implemented in a service
};

// Helper to calculate total extras for an innings
MatchSchema.methods.getTotalExtras = function(inningsNumber: number) {
    const match = this as IMatch;
    const innings = match.innings.find(inn => inn.inningNumber === inningsNumber);

    if (!innings) return 0;

    const { wides, noBalls, byes, legByes, penalties } = innings.extras;
    return wides + noBalls + byes + legByes + penalties;
};

// Create and export the Match model
export default mongoose.model<IMatch>('Match', MatchSchema);