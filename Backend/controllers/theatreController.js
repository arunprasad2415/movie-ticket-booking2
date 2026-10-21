const Theatre = require('../models/Theatre');
const Movie = require('../models/Movie');

exports.getAllTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find();

    res.status(200).json(theatres);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);

    if (!theatre) {
      return res.status(404).json({
        status: 'error',
        message: 'Theatre not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        theatre
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.createTheatre = async (req, res) => {
  try {
    const { name, location, totalScreens } = req.body;

    const newTheatre = await Theatre.create({
      name,
      location,
      totalScreens: totalScreens || 1
    });

    res.status(201).json({
      status: 'success',
      message: 'Theatre created successfully',
      data: {
        theatre: newTheatre
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.updateTheatre = async (req, res) => {
  try {
    const before = await Theatre.findById(req.params.id);
    const updatedTheatre = await Theatre.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, location: req.body.location, totalScreens: req.body.totalScreens },
      { new: true, runValidators: true }
    );

    if (!updatedTheatre) {
      return res.status(404).json({
        status: 'error',
        message: 'Theatre not found'
      });
    }

    if (before && before.name !== updatedTheatre.name)
      await Movie.updateMany({ theatreName: before.name }, { theatreName: updatedTheatre.name });

    res.status(200).json({
      status: 'success',
      message: 'Theatre updated successfully',
      data: {
        theatre: updatedTheatre
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.deleteTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    const scheduled = theatre ? await Movie.countDocuments({ theatreName: theatre.name }) : 0;
    if (scheduled > 0) {
      return res.status(409).json({
        status: 'error',
        message: `${scheduled} movie${scheduled > 1 ? 's are' : ' is'} scheduled at ${theatre.name}. Move or delete ${scheduled > 1 ? 'them' : 'it'} first.`
      });
    }
    if (theatre) await theatre.deleteOne();

    if (!theatre) {
      return res.status(404).json({
        status: 'error',
        message: 'Theatre not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Theatre deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
