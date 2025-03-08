import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for Team document
export interface ITeam extends Document {
    name: string;
    captainId: mongoose.Types.ObjectId;
    logoImgUrl: string;
    universityId: mongoose.Types.ObjectId;
    points: number;
    budget: number;
    expenses: {
        description: string;
        amount: number;
        date: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

// Create the Team schema
const TeamSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Team name is required'],
            trim: true,
            unique: true
        },
        captainId: {
            type: Schema.Types.ObjectId,
            ref: 'Player',
            required: [true, 'Captain is required']
        },
        logoImgUrl: {
            type: String,
            default: ''
        },
        universityId: {
            type: Schema.Types.ObjectId,
            ref: 'University',
            required: [true, 'University is required']
        },
        points: {
            type: Number,
            default: 0
        },
        budget: {
            type: Number,
            required: [true, 'Initial team budget is required'],
            min: [0, 'Budget cannot be negative']
        },
        expenses: [
            {
                description: {
                    type: String,
                    required: true
                },
                amount: {
                    type: Number,
                    required: true
                },
                date: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Method to add expense (only captain can call this)
TeamSchema.methods.addExpense = async function(description: string, amount: number) {
    if (amount <= 0) {
        throw new Error('Expense amount must be positive');
    }

    if (amount > this.budget) {
        throw new Error('Insufficient budget for this expense');
    }

    this.expenses.push({
        description,
        amount,
        date: new Date()
    });

    this.budget -= amount;
    return this.save();
};

// Method to add funds to the budget
TeamSchema.methods.addFunds = async function(amount: number) {
    if (amount <= 0) {
        throw new Error('Amount must be positive');
    }

    this.budget += amount;
    return this.save();
};

// Virtual to get total expenses
TeamSchema.virtual('totalExpenses').get(function() {
    // @ts-ignore
    let reduce = this.expenses.reduce((total, expense) => total + expense.amount, 0);
    return reduce;
});

// Create and export the Team model
export default mongoose.model<ITeam>('Team', TeamSchema);