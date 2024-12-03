import {Context, Hono} from 'hono';
import {CreationsUsers} from '../models/user';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const api = new Hono().basePath('/');

const verifyToken = async (c: any, next: Function) => {
    const token = c.req.header('authorization');

    if (!token) {
        return c.json({ msg: 'No token provided' }, 401);
    }

    try {
        const user = await CreationsUsers.findOne({ token });

        if (!user) {
            return c.json({ msg: 'Invalid token' }, 401);
        }

        c.user = user;
        await next();
    } catch (error: any) {
        return c.json({ msg: 'Error verifying token', error: error.message }, 500);
    }
};

api.post('/register', async (c) => {
    try {
        const body = await c.req.json();
        const newUser = new CreationsUsers(body);
        const savedUser = await newUser.save();
        return c.json(savedUser);
    } catch (error: any) {
        return c.json({ msg: 'Error creating user', error: error.message }, 500);
    }
});

api.post('/login', async (c) => {
    try {
        const { mail, password } = await c.req.json();

        const user = await CreationsUsers.findOne({ mail });
        if (!user) {
            return c.json({ msg: 'Invalid email or password' }, 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return c.json({ msg: 'Invalid email or password' }, 401);
        }

        if (!user.token) {
            user.token = crypto.randomBytes(16).toString('hex');
            await user.save();
        }

        return c.json({ user });
    } catch (error: any) {
        return c.json({ msg: 'Error logging in', error: error.message }, 500);
    }
});

api.patch('/user', verifyToken, async (c: any) => {
    try {
        const body = await c.req.json();
        const user = c.user;

        Object.keys(body).forEach((key) => {
            user[key] = body[key];
        });

        const updatedUser = await user.save();
        return c.json(updatedUser);
    } catch (error: any) {
        return c.json({ msg: 'Error updating user', error: error.message }, 500);
    }
});

api.patch('/user/:id', async (c: any) => {
    try {
        const userId = c.req.param('id');
        const body = await c.req.json();

        const user = await CreationsUsers.findById(userId);

        if (!user) {
            return c.json({ msg: 'User not found' }, 404);
        }

        Object.keys(body).forEach((key) => {
            (user as any)[key] = body[key];
        });

        const updatedUser = await user.save();
        return c.json(updatedUser);
    } catch (error: any) {
        return c.json({ msg: 'Error updating user', error: error.message }, 500);
    }
});

api.delete('/user/:id', async (c: any) => {
    try {
        const userId = c.req.param('id');

        const user = await CreationsUsers.findById(userId);

        if (!user) {
            return c.json({ msg: 'User not found' }, 404);
        }

        await CreationsUsers.findByIdAndDelete(userId);
        return c.json({ msg: 'User deleted successfully' });
    } catch (error: any) {
        return c.json({ msg: 'Error deleting user', error: error.message }, 500);
    }
});

api.post('/user/:id/note', verifyToken, async (c: any) => {
    try {
        const _id = c.req.param('id');
        const { comment, value } = await c.req.json();

        const user = await CreationsUsers.findById(_id);

        if (!user) {
            return c.json({ msg: 'User not found' }, 404);
        }

        user.notes.push({ comment, value });

        const updatedUser = await user.save();
        return c.json(updatedUser);
    } catch (error: any) {
        return c.json({ msg: 'Error adding note', error: error.message }, 500);
    }
});


api.get('/user/:id', verifyToken, async (c: any) => {
    try {
        const _id = c.req.param('id');

        const user = await CreationsUsers.findOne({ _id });

        if (!user) {
            return c.json({ msg: 'User not found' }, 404);
        }

        const notes = user.notes;
        const allSpeciality = user.speciality;
        const totalNotes = notes.length;
        const totalValue = notes.reduce((acc: any, note: { value: any; }) => acc + note.value, 0);
        const averageNote = totalNotes > 0 ? (totalValue / totalNotes).toFixed(1) : 'Pas de note';

        const comments = notes.map((note) => note);
        const speciality = allSpeciality.map((speciality) => speciality);

        return c.json({
            name: user.name,
            firstname: user.firstname,
            mail: user.mail,
            pseudo: user.pseudo,
            img_url: user.img_url,
            averageNote,
            comments,
            speciality
        });
    } catch (error: any) {
        return c.json({ msg: 'Error fetching user', error: error.message }, 500);
    }
});

api.get('/users', async (c: any) => {
    try {
        const users = await CreationsUsers.find();

        const usersWithAverageNote = users.map(user => {
            const notes = user.notes;
            const totalNotes = notes.length;
            const totalValue = notes.reduce((acc: any, note: { value: any }) => acc + note.value, 0);
            const averageNote = totalNotes > 0 ? (totalValue / totalNotes).toFixed(1) : 'Pas de note';

            return {
                _id: user._id,
                name: user.name,
                firstname: user.firstname,
                mail: user.mail,
                pseudo: user.pseudo,
                averageNote,
                speciality: user.speciality,
                comments: user.notes,
                img_url: user.img_url
            };
        });

        return c.json(usersWithAverageNote);
    } catch (error: any) {
        return c.json({ msg: 'Error getting all Users', error: error.message }, 500);
    }
});


api.get('/user/public/:id', async (c: any) => {
    try {
        const _id = c.req.param('id');

        const user = await CreationsUsers.findOne({ _id });

        if (!user) {
            return c.json({ msg: 'User not found' }, 404);
        }

        const userPublic = {
            _id: user._id,
            name: user.name,
            firstname: user.firstname,
            mail: user.mail,
            pseudo: user.pseudo,
            speciality: user.speciality,
            comments: user.notes,
            img_url: user.img_url,
        }

        return c.json(userPublic);
    } catch (error: any) {
        return c.json({ msg: 'Error getting all Users', error: error.message }, 500);
    }
});

const normalizeString = (str: any): string => {
    if (str === null || str === undefined) {
        throw new Error('Input cannot be null or undefined');
    }
    return str.toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[\s-]/g, '') // Remove spaces and hyphens
        .toLowerCase();
};

api.get('/user/title/:title', async (c: any) => {
    try {
        const title = normalizeString(c.req.param('title'));
        const users = await CreationsUsers.find();
        const filteredUsers = users.filter(user => user.speciality.some(speciality => normalizeString(speciality).includes(title)));

        const usersWithAverageNote = filteredUsers.map(user => {
            const notes = user.notes;
            const totalNotes = notes.length;
            const totalValue = notes.reduce((acc: any, note: { value: any }) => acc + note.value, 0);
            const averageNote = totalNotes > 0 ? (totalValue / totalNotes).toFixed(1) : 'Pas de note';

            return {
                _id: user._id,
                name: user.name,
                firstname: user.firstname,
                mail: user.mail,
                pseudo: user.pseudo,
                speciality: user.speciality,
                comments: user.notes,
                img_url: user.img_url,
                averageNote
            };
        });

        return c.json(usersWithAverageNote);
    } catch (error: any) {
        return c.json({ msg: 'Error fetching user', error: error.message }, 500);
    }
});

api.get('/top-users', async (c: any) => {
    try {
        const users = await CreationsUsers.find();

        const usersWithAverageNote = users.map(user => {
            const notes = user.notes;
            const totalNotes = notes.length;
            const totalValue = notes.reduce((acc: any, note: { value: any }) => acc + note.value, 0);
            const averageNote = totalNotes > 0 ? (totalValue / totalNotes) : 0; // Average as a number

            return {
                _id: user._id,
                name: user.name,
                firstname: user.firstname,
                averageNote,
                img_url: user.img_url
            };
        });

        // Sort users by averageNote in descending order and get the top 3
        const topUsers = usersWithAverageNote
            .sort((a, b) => b.averageNote - a.averageNote)
            .slice(0, 3);

        return c.json(topUsers);
    } catch (error: any) {
        return c.json({ msg: 'Error fetching top users', error: error.message }, 500);
    }
});

export default api;
