const express = require('express')
const knex = require('knex')

const dbConnection = knex({
    client: 'sqlite3',
    connection: {
        filename: './data/budget.db3'
    },
    useNullAsDefault: true
})

const router = express.Router();

//GET all accounts
/*router.get('/', (req, res) => {
    dbConnection('accounts')
        .then(accounts => {
            if (accounts.length > 0) {
                res.status(200).json(accounts)
            } else {
                res.status(400).json({
                    message: "There are no accounts to retrieve."
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "There was an error retrieving the accounts."
            })
        })
})*/

router.get('/', async (req, res) => {
    try {
        const accounts = await dbConnection('accounts')
        if (accounts.length > 0) {
            res.status(200).json(accounts)
        } else {
            res.status(400).json({
                message: "There are no accounts to retrieve."
            })
        }
    } catch (err) {
        res.status(500).json({
            message: "There was an error retrieving the accounts."
        })
    }
})

//GET account by id
/*router.get('/:id', (req, res) => {
    dbConnection('accounts')
        .where({ id: req.params.id })
        .then(account => {
            console.log(account)
            if (account.length > 0) {
                res.status(200).json(account)
            } else {
                res.status(400).json({
                    message: "The account with that ID could not be found."
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "There was an error retrieving the account."
            })
        })
})*/

router.get('/:id', async (req, res) => {
    try {
        const account = await dbConnection('accounts').where({ id: req.params.id })
        if (account.length > 0) {
            res.status(200).json(account)
        } else {
            res.status(400).json({
                message: "The account with that ID could not be found."
            })
        }
    } catch (err) {
        res.status(500).json({
            message: "There was an error retrieving the account."
        })
    }
})

//GET accounts by name
router.get('/name/:id', (req, res) => {
    dbConnection('accounts')
        .where({ name: req.params.id })
        .then(account => {
            if (account.length > 0) {
                res.status(200).json(account)
            } else {
                res.status(400).json({
                    message: "The account with that ID could not be found."
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "There was an error retrieving the account."
            })
        })
})

//POST new account
router.post('/', validateUniqueName, (req, res) => {

    const newAccount = req.body
    if (newAccount.name && newAccount.budget) {
        dbConnection('accounts')
            .insert(newAccount, 'id')
            .then(arrayOfIds => {
                const idOfLastInsert = arrayOfIds[0];
                res.status(201).json(idOfLastInsert)
            })
            .catch(err => res.status(500).json({
                message: "There was an error creating the account."
            }))
    } else {
        res.status(400).json({
            message: "Your request is missing a name and/or a budget."
        })
    }
})

//UPDATE account
router.put('/:id', (req, res) => {

    const updatedAccount = req.body

    dbConnection('accounts')
        .where({ id: req.params.id })
        .update(updatedAccount)
        .then(count => {
            if (count > 0) {
                res.status(200).json({ message: `${count} record(s) updated` })
            } else {
                res.status(404).json({
                    message: "The account with this ID was not found."
                })
            }
        })
        .catch(err => res.status(500).json({
            message: "There was an error updating the account."
        }))
});

//DELETE account
router.delete('/:id', (req, res) => {
    dbConnection('accounts')
        .where({ id: req.params.id })
        .del()
        .then(count => {
            if (count > 0) {
                res.status(200).json({
                    message: `${count} record(s) deleted.`
                })
            } else {
                res.status(404).json({
                    message: "The account with this ID was not found."
                })
            }
        })
        .catch(err => res.status(500).json(err))
})

//Verfies that the username is unique
function validateUniqueName(req, res, next) {
    dbConnection('accounts')
        .where({ name: req.body.name })
        .then(account => {
            if (account.length > 0) {
                res.status(400).json({
                    message: "An account with that name already exists."
                })
            } else {
                next();
            }
        })
}

module.exports = router