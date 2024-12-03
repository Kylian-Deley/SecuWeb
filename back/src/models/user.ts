import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

interface Speciality {
    title: string;
    level: 'beginner' | 'intermediate' | 'expert';
}

interface Note {
    comment: string;
    value: number;
}

interface Users {
    name: string;
    firstname: string;
    credit: number;
    mail: string;
    pseudo: string;
    password: string;
    role: string;
    token: string;
    speciality: Speciality[];
    notes: Note[];
    img_url: string;
}

const specialitySchema = new Schema<Speciality>({
    title: { type: String, required: true },
    level: {
        type: String,
        required: true,
        enum: ['beginner', 'intermediate', 'expert']
    }
});

const noteSchema = new Schema<Note>({
    comment: { type: String, required: false },
    value: { type: Number, String, required: true }
});

const creationUsers = new Schema<Users>({
    name: { type: String, required: true },
    firstname: { type: String, required: true },
    credit: { type: Number, required: false },
    mail: { type: String, required: true },
    pseudo: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: false, default: 'ROLE_USER' },
    token: { type: String, required: false },
    img_url: { type: String, required: false, default: "https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp" },
    speciality: { type: [specialitySchema], required: false },
    notes: { type: [noteSchema], required: false }
});

// creationUsers.pre('save', async function (next) {
//     const user = this as any;
//     if (!user.isModified('password')) return next();
//
//     try {
//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(user.password, salt);
//         next();
//     } catch (error: any) {
//         next(error);
//     }
// });

const CreationsUsers = model<Users>('User', creationUsers);

export { CreationsUsers }
