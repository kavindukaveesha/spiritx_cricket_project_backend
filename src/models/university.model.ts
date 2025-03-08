import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for University document
export interface IUniversity extends Document {
    name: string;
    location: string;
    logoUrl: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
}

// Create the University schema
const UniversitySchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'University name is required'],
            trim: true,
            unique: true
        },
        location: {
            type: String,
            required: [true, 'Location is required']
        },
        logoUrl: {
            type: String,
            default: ''
        },
        contactEmail: {
            type: String,
            required: [true, 'Contact email is required'],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address'
            ]
        },
        contactPhone: {
            type: String,
            required: [true, 'Contact phone is required']
        },
        address: {
            type: String,
            required: [true, 'Address is required']
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Create and export the University model
export default mongoose.model<IUniversity>('University', UniversitySchema);