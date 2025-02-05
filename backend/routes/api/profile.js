const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const authMiddelware = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/Users');

//@route       GET api/profiel/me
//@desc        Get Current User Profile
//@access      Private
router.get('/me', authMiddelware, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('DevConnectoruser', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (error) {
    console.log(`Error While getting profiel ${error.message}`);
    res.status(500).send('Server Error');
  }
});

//@route       POST api/profile
//@desc        Create or update user profile
//@access      Private
router.post(
  '/',
  [
    authMiddelware,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    //Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    //Build scocial object

    profileFields.social = {};

    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      //Create Profile
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (error) {
      console.log(
        `Error while addeing or updating profile :- ${error.message}`
      );
      res.status(500).send('Server Error');
    }
  }
);

//@route       POST api/profile
//@desc        Get all profiles
//@access      Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('DevConnectoruser', [
      'name',
      'avatar',
    ]);

    res.json(profiles);
  } catch (error) {
    console.log(`Error while getting all profile ${error.message}`);
    res.status(500).send('Server Error');
  }
});

//@route       POST api/profile/user/:user_id
//@desc        Get all profiles
//@access      Public

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('DevConnectoruser', ['name', 'avatar']);

    if (!profile) return res.status(400).json({ msg: 'Profile not found' });

    res.json(profile);
  } catch (error) {
    console.log(`Error while perticular user profile :- ${error.message}`);
    if (error.name === 'CastError') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
});

//@route       DELETE api/profile
//@desc        Delete profile,user & posts
//@access      Private
router.delete('/', authMiddelware, async (req, res) => {
  try {
    //@todo -remove users posts

    //Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });

    //Rmove User
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User Deleted' });
  } catch (error) {
    console.log(`Error while deleting user :- ${error.message}`);
    res.status(500).send('Server Error');
  }
});

//@route       PUT api/profile/experience
//@desc        Add profile experience
//@access      Private

router.put(
  '/experience',
  [
    authMiddelware,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'Form date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();
      res.json(profile);
    } catch (error) {
      console.log(`Error while adding experience: - ${error.message}`);
      res.status(500).send('Server Error');
    }
  }
);

//@route       DELETE api/profile/experience/:exp_id
//@desc        Delete experience from  profile
//@access      Private
router.delete('/experience/:exp_id', authMiddelware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get Remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    //Remove from exeperience array
    profile.experience.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.log(`Error while deleting experience: - ${error.message}`);
    res.status(500).send('Server Error');
  }
});

//@route       PUT api/profile/education
//@desc        Add profile education
//@access      Private

router.put(
  '/education',
  [
    authMiddelware,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('fieldofstudy', 'Field of study is required').not().isEmpty(),
      check('from', 'Form date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();
      res.json(profile);
    } catch (error) {
      console.log(`Error while adding education: - ${error.message}`);
      res.status(500).send('Server Error');
    }
  }
);

//@route       DELETE api/profile/education/:edu_id
//@desc        Delete education from  profile
//@access      Private
router.delete('/education/:exp_id', authMiddelware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get Remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    //Remove from exeperience array
    profile.education.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.log(`Error while deleting education: - ${error.message}`);
    res.status(500).send('Server Error');
  }
});

//@route       GET api/profile/github/:username
//@desc        Get user repose from Github
//@access      Public

router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}/client_secret=${config.get('githubClientSecret')}/`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };

    request(options, (error, response, body) => {
      if (error) console.log(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No Github profile found' });
      }

      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.log(
      `Error while getting user repos from git hub: - ${error.message}`
    );
    res.status(500).send('Server Error');
  }
});

module.exports = router;
