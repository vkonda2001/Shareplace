const Place = require('../models/place');
const User = require('../models/user');

module.exports = function (router) {
    
    var placesRoute = router.route('/places');
    var placeIdRoute = router.route('/places/:id');
    
placesRoute.get(async function (req, res) {
   try {
      var places = await Place.find()
      .where(req.query.where ? JSON.parse(req.query.where) : {})
      .limit(req.query.limit ? parseInt(req.query.limit) : Number.MAX_SAFE_INTEGER)
      .sort(req.query.sort ? JSON.parse(req.query.sort) : {});

      res.status(200).json({message: 'OK', data: places})
   } catch(error) {
      res.status(500).json({message: 'Get All places Failed', data: {}});
   }
});

placesRoute.post(async function (req, res) {
   if (req.body.firebaseId == null || req.body.userId == null || req.body.name == null || req.body.placePicturePath == null ||
         req.body.coordinates == null) {
      return res.status(400).json({message: 'Missing Required Info', data: {}});
   }
   var place = new Place(req.body);
   place.dateCreated = Date.now();

  try {
      await User.findByIdAndUpdate(place.userId, {$push: {places: place._id}, $inc: {placesCount: 1}});
      await place.save();
      res.status(201).json({message: 'OK', data: place});
  } catch(error) {
      res.status(500).json({message: 'Add place Failed', data: {}});
  }
});

placeIdRoute.get(async function (req, res) {
   var place;
   try {
      place = await Place.findById(req.params.id);
   } catch(error) {
      return res.status(404).json({message: 'Place Not Found', data: {}});
   }
   try {
      res.status(200).json({message: 'OK', data: place});
   } catch(error) {
      res.status(500).json({message: 'Get Place Failed', data: {}});
   }
});

placeIdRoute.patch(async function (req, res) {
  var oldPlace;
  try {
      oldPlace = await Place.findById(req.params.id);
  } catch (error) {
      return res.status(404).json({message: 'Place Not Found', data: {}});
  }
  try {
      const place = await Place.findOneAndUpdate({_id: req.params.id}, req.body, {new: true});
      place.dateCreated = oldPlace.dateCreated;
      
      // Check if request params for places are passed in
      if (req.body.likeToAdd || req.body.likeToRemove) {
         if (place.likes.includes(req.body.likeToAdd)) {
            return res.status(400).json({ msg: 'User already liked place' });
         }
         // Add place to list of places
         if (req.body.likeToAdd) {
            place.likes.push(req.body.likeToAdd);
            place.likesCount++;
         }
         // Remove place from list of places
         if (req.body.likeToRemove) {
            place.likes = place.likes.filter(like => like != req.body.likeToRemove);
            place.likesCount--;
         }
      }

      await place.save();

      res.status(200).json({message: 'OK', data: place});
  } catch(error) {
      res.status(500).json({message: 'Update Place Failed', data: {}});
  }
});

placeIdRoute.delete(async function (req, res) {
   var place;
   try {
      place = await Place.findByIdAndDelete(req.params.id);
   } catch(error) {
      return res.status(404).json({message: 'Place Not Found', data: {}});
   }
   try {
      await User.findByIdAndUpdate(place.userId, {$pull: {places: req.params.id}, $inc: {placesCount: -1}});
      res.status(200).json({message: 'OK', data: {id: req.params.id}});
   } catch(error) {
      res.status(500).json({message: 'Delete Place Failed', data: {}});
   }
});


   return router;
}
