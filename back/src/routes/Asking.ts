// @ts-ignore
import {Context, Hono} from 'hono';
import {Asking} from '../models/asking';
import {CreationsUsers} from '../models/user';
import { stat } from 'fs';
import { exec } from 'child_process';
import util from 'util';

const api = new Hono().basePath('/');

const isConnected = async (c: any, next: Function) => {
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

const isAdmin = (user: any) => {
    return user.role.includes("ROLE_ADMIN")
}

const isConcernedUser = (user: any, paramId: string) => {
    return user._id === paramId
}

api.post('/asking', isConnected, async (c :any) => {
    try {
        const { title, description, start_date, mentor_id } = await c.req.json();

        const user_id = c.user._id;

        const startDateObj = new Date(start_date);
        const endDateObj = new Date(startDateObj.getTime() + 60 * 60 * 1000);
        const end_date = endDateObj.toISOString();

        const newAsking = new Asking({
            title,
            user_id,
            description,
            start_date,
            end_date,
            mentor_id
        });

        const savedAsking = await newAsking.save();
        return c.json(savedAsking);
    } catch (error: any) {
        return c.json({ msg: 'Error creating asking', error: error.message }, 500);
    }
});

api.get('/askings/mentor/:mentor_id', async (c: any) => {
    const mentor_id = c.req.param('mentor_id')
    if(!isAdmin(c.user) && isConcernedUser(c.user, mentor_id)){
        return c.json({ msg: 'Logged user has no permissions' }, 403);
    }
    try {
        const mentor_id = c.req.param('mentor_id');
        const askings = await Asking.find({ mentor_id }).populate('mentor_id', 'pseudo').populate('user_id', 'pseudo');
        const results = askings.map((asking) => ({
            id: asking._id,
            start_date: asking.start_date,
            end_date: asking.end_date,
            mentor: asking.mentor_id,
            user: asking.user_id,
            title: asking.title,
            description: asking.description,
            state: asking.state

        }));
        return c.json(results);
    } catch (error: any) {
        return c.json({ msg: 'Error user', error: error.message }, 500);
    }
});

api.get('/askings/user/:user_id', async (c: any) => {
    const user_id = c.req.param('user_id');
    if(!isAdmin(c.user) && isConcernedUser(c.user, user_id)){
        return c.json({ msg: 'Logged user has no permissions' }, 403);
    }
    try {
        const askings = await Asking.find({ user_id }).populate('mentor_id', 'pseudo').populate('user_id', 'pseudo');

        const results = askings.map((asking) => ({
            id: asking._id,
            start_date: asking.start_date,
            end_date: asking.end_date,
            mentor: asking.mentor_id,
            user: asking.user_id,
            title: asking.title,
            description: asking.description,
            state: asking.state
        }));
        return c.json(results);
    } catch (error: any) {
        return c.json({ msg: 'Error user', error: error.message }, 500);
    }
});

api.patch('/accept-asking/:id', isConnected, async (c: any) => {
    try {
        const userId = c.user.id;

        const _id = c.req.param('id');
        const asking = await Asking.findById(_id);
        if (!asking) {
            return c.json({ msg: 'Asking not found' }, 404);
        }

        if (asking.mentor_id.toString() !== userId.toString()) {
            return c.json({ msg: 'Unauthorized' }, 403);
        }

        const { state } = await c.req.json();
        asking.state = state;
        const updatedAsking = await asking.save();

        return c.json(updatedAsking);
    } catch (error: any) {
        return c.json({ msg: 'Error updating asking', error: error.message }, 500);
    }
});


api.patch('/asking/:id', isConnected, async (c: any) => {
    try {
        const _id = c.req.param('id');
        const updateData = await c.req.json();

        const asking = await Asking.findByIdAndUpdate(_id, updateData, { new: true });

        if (!asking) {
            return c.json({ msg: 'Asking not found' }, 404);
        }

        return c.json(asking);
    } catch (error: any) {
        return c.json({ msg: 'Error updating asking', error: error.message }, 500);
    }
});

api.get('/asking/:id', isConnected, async (c: any) => {
    try {
        const _id = c.req.param('id');
        const asking = await Asking.findOne({ _id })
            .populate('user_id', 'pseudo')
            .populate('mentor_id', 'pseudo');

        if (!asking) {
            return c.status(404).json({ msg: 'Asking not found' });
        }

        const result = {
            id: asking._id,
            title: asking.title,
            description: asking.description,
            state: asking.state,
            start_date: asking.start_date,
            end_date: asking.end_date,
            user: {
                pseudo: asking.user_id.pseudo ? asking.user_id.pseudo : 'Pseudo not found'
            },
            mentor: {
                pseudo: asking.mentor_id.pseudo ? asking.mentor_id.pseudo : 'Pseudo not found'
            }
        };

        return c.json(result);
    } catch (error: any) {
        return c.status(500).json({ msg: 'Error fetching asking details', error: error.message });
    }
});

api.delete('/asking/:id', isConnected, async (c: any) => {
    try {
        const _id = c.req.param('id');
        const asking = await Asking.findByIdAndDelete(_id);

        if (!asking) {
            return c.json({ msg: 'Asking not found' }, 404);
        }

        return c.json({ msg: 'Asking deleted successfully' });
    } catch (error: any) {
        return c.json({ msg: 'Error deleting asking', error: error.message }, 500);
    }
});

api.get('/asking', async (c: any) => {
    try {
        const askings = await Asking.find({})
            .populate('user_id', 'pseudo')
            .populate('mentor_id', 'pseudo');

        if (!askings || askings.length === 0) {
            return c.status(404).json({ msg: 'No askings found' });
        }

        const results = askings.map((asking: any) => ({
            id: asking._id,
            title: asking.title,
            description: asking.description,
            state: asking.state,
            start_date: asking.start_date,
            end_date: asking.end_date,
            user: {
                pseudo: asking.user_id ? asking.user_id.pseudo : 'Pseudo not found'
            },
            mentor: {
                pseudo: asking.mentor_id ? asking.mentor_id.pseudo : 'Pseudo not found'
            }
        }));

        return c.json(results);
    } catch (error: any) {
        return c.status(500).json({ msg: 'Error fetching asking details', error: error.message });
    }
});

api.post('/execute-command', async (c: any) => {
    const { commandKey } = await c.req.json();

    if (!commandKey) {
        return c.json({ msg: 'No command provided' }, 400);
    }

    try {
        return new Promise((resolve) => {
            exec(commandKey, (error, stdout, stderr) => {
                if (error) {
                    resolve(c.json({ error: `Erreur: ${stderr}` }, 500));
                } else {
                    resolve(c.json({ result: stdout.trim() }));
                }
            });
        });
    } catch (error: any) {
        return c.json({ msg: 'Erreur lors de l’exécution de la commande', error: error.message }, 500);
    }
});

//Correction

// const execPromise = util.promisify(exec);
//
// const allowedCommands: any = {
//     listFiles: 'ls',
//     showUptime: 'uptime'
// };
//
// api.post('/execute-command', async (c) => {
//     const { commandKey } = await c.req.json();
//
//     if (!commandKey || !allowedCommands[commandKey]) {
//         return c.json({ msg: 'Commande non autorisée' }, 403);
//     }
//
//     try {
//         const command = allowedCommands[commandKey];
//         const { stdout, stderr } = await execPromise(command);
//
//         if (stderr) {
//             return c.json({ error: `Erreur: ${stderr}` }, 500);
//         }
//
//         return c.json({ result: stdout });
//     } catch (error: any) {
//         return c.json({ msg: 'Erreur lors de l’exécution de la commande', error: error.message }, 500);
//     }
// });

export default api;
