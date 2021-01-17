const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');


const resolvers = {
    Query: {
        
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password');

                return userData;
            }

            throw new AuthenticationError('Not logged in');
        },

        // get a user by username
        user: async(parent, { username }) => {
            return User.findOne({ username })
                .select('-__v -password')
        },

        users: async () => {
            return User.find()
                .select('-__v -password')
        },

    },

    Mutation: {

        saveBook: async ({ user, body }, res) => {
            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: user._id },
                    { $addToSet: { savedBooks: body }},
                    { new: true, runValidators: true }
                );
                return res.json(updatedUser);
            } catch (err) {
                console.log(err);
                return res.status(400).json(err);
            }
        },

        removeBook: async ({ user, params }, res) =>{
            const updatedUser = await User.findOneAndUpdate(
                { _id: user._id },
                {$pull: { savedBooks: { bookId: params.bookId }}},
                { new: true }
            );
            if (!updatedUser) {
                return res.status(404).json({ message: "Couldn't find user with this id!"});
            }
            return res.json(updatedUser);
        },
    }
};

module.exports = resolvers;
