const User = require('../models/user')
const Place = require('../models/place');

module.exports = function (router) {

    var usersRoute = router.route('/users');
    var userIdRoute = router.route('/users/:id');

    usersRoute.get(async function (req, res) {
        try {
            var users = await User.find()
            .where(req.query.where ? JSON.parse(req.query.where) : {})
            .limit(req.query.limit ? parseInt(req.query.limit) : Number.MAX_SAFE_INTEGER)
            .sort(req.query.sort ? JSON.parse(req.query.sort) : {});
            
            res.status(200).json({message: 'OK', data: users})
        } catch(error) {
            res.status(500).json({message: 'Get All Users Failed', data: {}});
        }
    });

    usersRoute.post(async function (req, res) {
        //Check if all the required parameters are passed in the request
        if (!req.body.firebaseId || !req.body.email || !req.body.password || !req.body.username || !req.body.name || !req.body.profilePicturePath) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request'
            });
        }

        //Check if username or email already exists in the database
        User.findOne({$or: [{username: req.body.username}, {email: req.body.email}]}, (err, user) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
            if (user) {
                return res.status(400).json({
                    success: false,
                    message: 'Username or email already in use'
                });
            }

            //Create a new user
            const newUser = new User({
                firebaseId: req.body.firebaseId,
                email: req.body.email,
                password: req.body.password,
                username: req.body.username,
                name: req.body.name,
                profilePicturePath: req.body.profilePicturePath,
                places: [],
                placesCount: 0,
                friends: []
            });

            //Save the new user to the database
            newUser.save((err, user) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Internal server error'
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: 'User added successfully'
                });
            });
        });
    });

    userIdRoute.get(async function (req, res) {
        try {
            let user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const userInfo = {
                firebaseId: user.firebaseId,
                username: user.username,
                name: user.name,
                email: user.email,
                placeCount: user.placeCount,
                profilePicturePath: user.profilePicturePath,
                places: user.places,
                friends: user.friends
            };
            res.status(200).json(userInfo);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

    userIdRoute.patch(async function (req, res) {
        try {
            // Check if user exists
            let user = await User.findById(req.params.id);
            if (!user) {
                return res.status(400).json({ msg: 'User does not exist' });
            }
    
            // Check if request params are passed in
            if (req.body.username || req.body.password || req.body.name || req.body.profilePicturePath) {
                // Update userSchema variables
                user.username = req.body.username ? req.body.username : user.username;
                user.password = req.body.password ? req.body.password : user.password;
                user.email = req.body.email ? req.body.email : user.email;
                user.name = req.body.name ? req.body.name : user.name;
                user.profilePicturePath = req.body.profilePicturePath ? req.body.profilePicturePath : user.profilePicturePath;
            }
    
            // Check if request params for places are passed in
            if (req.body.placeToAdd || req.body.placeToRemove) {
                // Add place to list of places
                if (req.body.placeToAdd) {
                    user.places.push(req.body.placeToAdd);
                    user.placeCount++;
                }
                // Remove place from list of places
                if (req.body.placeToRemove) {
                    user.places = user.places.filter(place => place != req.body.placeToRemove);
                    user.placeCount--;
                }
            }
    
            // Check if request params for friends are passed in
            if (req.body.friendToAdd || req.body.friendToRemove) {
                // Check if friend is already in the list
                if (user.friends.includes(req.body.friendToAdd)) {
                    return res.status(400).json({ msg: 'User is already friends with this person' });
                }
                if (req.body.friendToAdd) {
                    // Add friend to list of friends
                    user.friends.push(req.body.friendToAdd);
                }
                // Remove friend from list of friends
                if (req.body.friendToRemove) {
                    user.friends = user.friends.filter(friend => friend != req.body.friendToRemove);
                }
            }
    
            // Save user
            await user.save();
            res.json(user);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    userIdRoute.delete(async function (req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({
                    message: 'User not found.'
                });
            }
            // Delete all places associated with the user
            if (user.places.length > 0) {
                await Place.deleteMany({
                    _id: {
                        $in: user.places
                    }
                });
            }
            // Delete user
            await user.remove();
            res.status(200).json({
                message: 'User deleted successfully.'
            });
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    });
 
    return router;
}  
