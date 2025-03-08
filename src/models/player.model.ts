import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define enums for batting and bowling styles
export enum BattingStyle {
    LEFT_HANDED = 'Left Handed',
    RIGHT_HANDED = 'Right Handed'
}

export enum BowlingStyle {
    FAST = 'Fast',
    MEDIUM = 'Medium',
    SPIN = 'Spin',
    NONE = 'None'
}

// Define the interface for Player document
export interface IPlayer extends Document {
    playerId: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    imageUrl: string;
    age: number;
    universityId: mongoose.Types.ObjectId;
    jerseyNumber: number;
    battingStyle: BattingStyle;
    bowlingStyle: BowlingStyle;
    phone: string;
    isActive: boolean;
    comparePassword(candidatePassword: string): Promise<boolean>;
    createdAt: Date;
    updatedAt: Date;
}

// Create the Player schema
const PlayerSchema: Schema = new Schema(
    {
        playerId: {
            type: String,
            required: [true, 'Player ID is required'],
            unique: true,
            trim: true
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address'
            ]
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters long'],
            select: false // Don't return password by default in queries
        },
        imageUrl: {
            type: String,
            default: ''
        },
        age: {
            type: Number,
            required: [true, 'Age is required']
        },
        universityId: {
            type: Schema.Types.ObjectId,
            ref: 'University',
            required: [true, 'University is required']
        },
        jerseyNumber: {
            type: Number,
            required: [true, 'Jersey number is required']
        },
        battingStyle: {
            type: String,
            enum: Object.values(BattingStyle),
            default: BattingStyle.RIGHT_HANDED
        },
        bowlingStyle: {
            type: String,
            enum: Object.values(BowlingStyle),
            default: BowlingStyle.NONE
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required']
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.password;
                return ret;
            }
        }
    }
);

// Full name virtual getter
PlayerSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Password hashing middleware
PlayerSchema.pre('save', async function(next) {
    const player = this as unknown as IPlayer;

    if (!player.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        player.password = await bcrypt.hash(player.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Compare password method
PlayerSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the Player model
export default mongoose.model<IPlayer>('Player', PlayerSchema);