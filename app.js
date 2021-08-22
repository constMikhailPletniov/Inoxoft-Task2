const path = require('path');
const fs = require('fs');
const util = require('util');
const hbs = require('express-handlebars');
const express = require('express');

const app = express();
const { PORT, NOT_FOUND, CREATE } = require('./config/conf');
const staticPath = path.join(__dirname, 'static');
const userDataPath = path.join(__dirname, 'database', 'usersdata.json');

const readPromise = util.promisify(fs.readFile);
const appendPromise = util.promisify(fs.writeFile);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(staticPath));
app.set('view engine', '.hbs');
app.engine('.hbs', hbs({ defaultLayout: false }));
app.set('views', staticPath);

const getUsers = async () => {
    const getUser = await readPromise(userDataPath);
    return JSON.parse(getUser);
}
const getUserData = async (email) => {
    const user = await getUsers();
    const findUser = await user.find(user => user.email === email);
    return findUser;
}
const getID = async () => {
    const getId = await getUsers();
    const getKey = [];
    for (const key in getId) {
        getKey.push(key);
    }
    return getKey;
}
getID();
const addUsers = async (data) => {
    const users = await getUsers();
    users.push(data);
    await appendPromise(userDataPath, JSON.stringify(users));
}

//Logining
app.post('/auth', async (req, res) => {
    const { email } = req.body;
    const user = await getUserData(email);
    if (!user) {
        return res.status(NOT_FOUND).redirect('/registration');
    } else {
        return res.redirect('/users');
    }
});

//Registration form
app.post('/authReg', async (req, res) => {
    const { name, email, pass, age } = req.body;
    const user = await getUserData(email);
    const lastId = await getID();
    const addId = lastId.length;
    if (!user) {
        await addUsers({ name, email, pass, age, id: addId });
        return res.status(CREATE).redirect('/login');
    }
    return res.redirect('/login');
});




//Render EndPoints
app.get('/login', (req, res) => {
    return res.render('login');
});
app.get('/registration', (req, res) => {
    return res.render('registration');
});
app.get('/users', async (req, res) => {

    const users = await getUsers();
    return res.render('users', { users });
});
app.get('/users/:users_id', async (req, res) => {
    const { users_id } = req.params;
    const user = await getUsers();
    return res.json(user[users_id]);
});

app.listen(PORT, () => {
    console.log(`Port ${PORT} working...`)
});




