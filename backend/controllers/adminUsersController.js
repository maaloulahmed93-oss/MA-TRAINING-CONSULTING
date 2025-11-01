import AdminUser from '../models/AdminUser.js';

/**
 * Admin Users Controller
 * Handles CRUD operations for admin panel users
 */

// @desc    Get all admin users
// @route   GET /api/admin-users
// @access  Admin only
export const getAllAdminUsers = async (req, res) => {
  try {
    const { role } = req.query;
    
    let users;
    if (role && role !== 'all') {
      users = await AdminUser.getUsersByRole(role);
    } else {
      users = await AdminUser.getActiveUsers();
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// @desc    Get single admin user by ID
// @route   GET /api/admin-users/:id
// @access  Admin only
export const getAdminUserById = async (req, res) => {
  try {
    const user = await AdminUser.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
};

// @desc    Create new admin user
// @route   POST /api/admin-users
// @access  Admin only
export const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, role, avatar } = req.body;

    // Check if user already exists
    const existingUser = await AdminUser.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Create new user
    const user = await AdminUser.create({
      name,
      email,
      password, // Note: In production, hash this password!
      role: role || 'moderator',
      avatar,
      lastLogin: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: user
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error.message
    });
  }
};

// @desc    Update admin user
// @route   PUT /api/admin-users/:id
// @access  Admin only
export const updateAdminUser = async (req, res) => {
  try {
    const { name, email, password, role, avatar } = req.body;

    const user = await AdminUser.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await AdminUser.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // Note: Hash in production!
    if (role) user.role = role;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: user
    });
  } catch (error) {
    console.error('Error updating admin user:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: error.message
    });
  }
};

// @desc    Delete admin user
// @route   DELETE /api/admin-users/:id
// @access  Admin only
export const deleteAdminUser = async (req, res) => {
  try {
    const user = await AdminUser.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Soft delete - just mark as inactive
    user.isActive = false;
    await user.save();

    // Or hard delete:
    // await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error.message
    });
  }
};

// @desc    Update user's last login
// @route   PATCH /api/admin-users/:id/last-login
// @access  Public (for login tracking)
export const updateLastLogin = async (req, res) => {
  try {
    const user = await AdminUser.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    await user.updateLastLogin();

    res.status(200).json({
      success: true,
      message: 'Dernière connexion mise à jour'
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Search admin users
// @route   GET /api/admin-users/search
// @access  Admin only
export const searchAdminUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Paramètre de recherche requis'
      });
    }

    const users = await AdminUser.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error searching admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche',
      error: error.message
    });
  }
};
