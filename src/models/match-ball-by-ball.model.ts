import mongoose, { Document, Schema } from 'mongoose';

// Define enum for ball outcome
export enum BallOutcome {
    DOT = 'dot',
    SINGLE = 'single',
    DOUBLE = 'double',
    TRIPLE = 'triple',
    BOUNDARY = 'four',
    SIX = 'six',
    WICKET = 'wicket',
    WIDE = 'wide',
    NO_BALL = 'no-ball',
    BYE = 'bye',
    LEG_BYE = 'leg-bye'
}

// Define the interface for MatchBallByBall document
export interface IMatchBallByBall extends Document {
    matchId: mongoose.Types.ObjectId;
    overNumber: number;
    ballNumber: number;
    batsmanId: mongoose.Types.ObjectId;
    bowlerId: mongoose.Types.ObjectId;
    teamBattingId: mongoose.Types.ObjectId;
    teamBowlingId: mongoose.Types.ObjectId;
    runsScored: number;
    extraRuns: number;
    extraType: string | null;
    isWicket: boolean;
    dismissalType: string | null;
    playerOutId: mongoose.Types.ObjectId | null;
    fielderIds: mongoose.Types.ObjectId[];
    ballOutcome: BallOutcome;
    commentary: string;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Create the MatchBallByBall schema
const MatchBallByBallSchema: Schema = new Schema(
    {
        matchId: {
            type: Schema.Types.ObjectId,
            ref: 'Match',
            required: [true, 'Match is required']
        },
        overNumber: {
            type: Number,
            required: [true, 'Over number is required'],
            min: 0
        },
        ballNumber: {
            type: Number,
            required: [true, 'Ball number is required'],
            min: 1,
            max: 6
        },
        batsmanId: {
            type: Schema.Types.ObjectId,
            ref: 'Player',
            required: [true, 'Batsman is required']
        },
        bowlerId: {
            type: Schema.Types.ObjectId,
            ref: 'Player',
            required: [true, 'Bowler is required']
        },
        teamBattingId: {
            type: Schema.Types.ObjectId,
            ref: 'Team',
            required: [true, 'Batting team is required']
        },
        teamBowlingId: {
            type: Schema.Types.ObjectId,
            ref: 'Team',
            required: [true, 'Bowling team is required']
        },
        runsScored: {
            type: Number,
            default: 0
        },
        extraRuns: {
            type: Number,
            default: 0
        },
        extraType: {
            type: String,
            enum: ['wide', 'no-ball', 'bye', 'leg-bye', null],
            default: null
        },
        isWicket: {
            type: Boolean,
            default: false
        },
        dismissalType: {
            type: String,
            enum: ['bowled', 'caught', 'lbw', 'run out', 'stumped', 'hit wicket', 'obstructing the field', 'timed out', 'retired hurt', null],
            default: null
        },
        playerOutId: {
            type: Schema.Types.ObjectId,
            ref: 'Player',
            default: null
        },
        fielderIds: [{
            type: Schema.Types.ObjectId,
            ref: 'Player'
        }],
        ballOutcome: {
            type: String,
            enum: Object.values(BallOutcome),
            required: [true, 'Ball outcome is required']
        },
        commentary: {
            type: String,
            default: ''
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Create composite index for unique ball in an over in a match
MatchBallByBallSchema.index({ matchId: 1, overNumber: 1, ballNumber: 1 }, { unique: true });

// Method to automatically update player stats
MatchBallByBallSchema.post('save', async function(doc) {
    // This would be implemented to update the corresponding MatchPlayerStats
    // This is just a placeholder - you would implement this in a service
    console.log('Updating player stats for ball', doc._id);
});

// Create and export the MatchBallByBall model
export default mongoose.model<IMatchBallByBall>('MatchBallByBall', MatchBallByBallSchema);