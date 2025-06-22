const User = require('../models/user');

exports.requestUpgrade = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.upgradeRequest)
      return res.status(400).json({ message: 'Upgrade request already sent' });

    user.upgradeRequest = true;
    user.isApproved = false;

    await user.save();

    res.json({ message: 'Upgrade request sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.getUpgradeRequests = async (req, res) => {
  try {
    const requests = await User.find({ upgradeRequest: true, isApproved: false });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.approveUpgrade = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.upgradeRequest)
      return res.status(400).json({ message: 'No upgrade request found for this user' });

    user.role = 'owner';
    user.isApproved = true;
    user.upgradeRequest = false;

    await user.save();

    res.json({ message: 'User upgraded to owner successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
