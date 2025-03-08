import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Define enums for batting and bowling styles
export enum BattingStyle {
    LEFT_HANDED = "Left Handed",
    RIGHT_HANDED = "Right Handed",
}

export enum BowlingStyle {
    FAST = "Fast",
    MEDIUM = "Medium",
    SPIN = "Spin",
    NONE = "None",
}

// Define enum for registration status
export enum RegistrationStatus {
    PENDING = "pending", // Only basic details provided
    COMPLETED = "completed", // All required details provided
}
export enum Role{
    PLAYER = "player",
    CAPTAIN = "captain"
}

// Define the interface for Player document
export interface IPlayer extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    imageUrl: string;
    age?: number; // Optional
    universityId?: mongoose.Types.ObjectId; // Optional
    jerseyNumber?: number; // Optional
    battingStyle: BattingStyle;
    bowlingStyle: BowlingStyle;
    phone?: string; // Optional
    isActive: boolean;
    isVerified: boolean;
    registrationStatus: RegistrationStatus; // Track registration progress
    comparePassword(candidatePassword: string): Promise<boolean>;
    createdAt: Date;
    updatedAt: Date;
    role: Role;
}

// Create the Player schema
const PlayerSchema: Schema = new Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email address",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long"],
            select: false, // Don't return password by default in queries
        },
        imageUrl: {
            type: String,
            default: "",
        },
        age: {
            type: Number,
            min: 0, // Optional but must be non-negative if provided
        },
        universityId: {
            type: Schema.Types.ObjectId,
            ref: "University",
        },
        jerseyNumber: {
            type: Number,
            min: 0, // Optional but must be non-negative if provided
        },
        battingStyle: {
            type: String,
            enum: Object.values(BattingStyle),
            default: BattingStyle.RIGHT_HANDED,
        },
        bowlingStyle: {
            type: String,
            enum: Object.values(BowlingStyle),
            default: BowlingStyle.NONE,
        },
        phone: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        registrationStatus: {
            type: String,
            enum: Object.values(RegistrationStatus),
            default: RegistrationStatus.PENDING,
        },
        role:{
            type:String,
            required: [true, "Role is required"],
            enum: Object.values(Role),
            default: Role.PLAYER,
        }
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id; // Map _id to id in the response
                delete ret._id;
                delete ret.password;
                return ret;
            },
        },
    }
);

// Full name virtual getter
PlayerSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Password hashing middleware
PlayerSchema.pre("save", async function (next) {
    const player = this as unknown as IPlayer;

    if (!player.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        player.password = await bcrypt.hash(player.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Compare password method
PlayerSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the Player model
export default mongoose.model<IPlayer>("Player", PlayerSchema);