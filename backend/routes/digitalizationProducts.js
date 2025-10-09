import express from 'express';
import DigitalizationProduct from '../models/DigitalizationProduct.js';

const router = express.Router();

// GET /api/digitalization-products - Get all products (for main website)
router.get('/', async (req, res) => {
  try {
    console.log('📡 GET /api/digitalization-products - Fetching products...');
    
    let products = await DigitalizationProduct.findOne({ isActive: true }).sort({ updatedAt: -1 });
    
    // Create default if none exist
    if (!products) {
      console.log('🔄 No products found, creating default...');
      products = await DigitalizationProduct.createDefault();
    }
    
    console.log(`✅ Products found: ${products.title} with ${products.products.length} products`);
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('❌ Error fetching digitalization products:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits',
      error: error.message
    });
  }
});

// GET /api/digitalization-products/admin - Get products for admin panel
router.get('/admin', async (req, res) => {
  try {
    console.log('📡 GET /api/digitalization-products/admin - Fetching for admin...');
    
    let products = await DigitalizationProduct.findOne({ isActive: true }).sort({ updatedAt: -1 });
    
    if (!products) {
      products = await DigitalizationProduct.createDefault();
    }
    
    // Transform for admin panel format
    const adminData = {
      title: products.title,
      intro: products.intro,
      products: products.products.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        imageUrl: product.imageUrl,
        details: product.details,
        mailtoSubject: product.mailtoSubject,
        demoLink: product.demoLink,
        category: product.category,
        isActive: product.isActive
      }))
    };
    
    console.log(`✅ Admin data prepared: ${adminData.products.length} products`);
    
    res.json({
      success: true,
      data: adminData
    });
  } catch (error) {
    console.error('❌ Error fetching products for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits pour admin',
      error: error.message
    });
  }
});

// POST /api/digitalization-products - Create or update products (from admin panel)
router.post('/', async (req, res) => {
  try {
    console.log('📡 POST /api/digitalization-products - Updating products...');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    
    const { title, intro, products } = req.body;
    
    // Validation
    if (!title || !intro || !products || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: 'Données manquantes: title, intro et products sont requis'
      });
    }
    
    // Transform products to include default values
    const transformedProducts = products.map((product, index) => {
      const defaultCategories = ['web', 'marketing', 'ecommerce', 'automation'];
      
      return {
        id: product.id || `product-${index + 1}`,
        title: product.title,
        description: product.description,
        imageUrl: product.imageUrl || 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Product',
        details: Array.isArray(product.details) ? product.details.filter(detail => detail.trim() !== '') : [],
        mailtoSubject: product.mailtoSubject || `Plus d'infos - ${product.title}`,
        demoLink: product.demoLink || '#demo',
        category: product.category || defaultCategories[index % defaultCategories.length],
        isActive: product.isActive !== undefined ? product.isActive : true
      };
    });
    
    // Find existing or create new
    let existingProducts = await DigitalizationProduct.findOne({ isActive: true });
    
    if (existingProducts) {
      // Update existing
      existingProducts.title = title;
      existingProducts.intro = intro;
      existingProducts.products = transformedProducts;
      existingProducts.updatedAt = new Date();
      
      await existingProducts.save();
      console.log('✅ Products updated successfully');
    } else {
      // Create new
      existingProducts = new DigitalizationProduct({
        title,
        intro,
        products: transformedProducts,
        isActive: true
      });
      
      await existingProducts.save();
      console.log('✅ New products created successfully');
    }
    
    res.json({
      success: true,
      message: 'Produits mis à jour avec succès',
      data: existingProducts
    });
  } catch (error) {
    console.error('❌ Error updating digitalization products:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des produits',
      error: error.message
    });
  }
});

// PUT /api/digitalization-products/:id - Update specific product
router.put('/:id', async (req, res) => {
  try {
    console.log(`📡 PUT /api/digitalization-products/${req.params.id} - Updating specific product...`);
    
    const productId = req.params.id;
    const updateData = req.body;
    
    const products = await DigitalizationProduct.findOne({ isActive: true });
    if (!products) {
      return res.status(404).json({
        success: false,
        message: 'Produits non trouvés'
      });
    }
    
    const productIndex = products.products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Produit spécifique non trouvé'
      });
    }
    
    // Update the specific product
    products.products[productIndex] = { ...products.products[productIndex], ...updateData };
    products.updatedAt = new Date();
    
    await products.save();
    
    console.log(`✅ Product ${productId} updated successfully`);
    
    res.json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: products.products[productIndex]
    });
  } catch (error) {
    console.error('❌ Error updating specific product:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du produit',
      error: error.message
    });
  }
});

// DELETE /api/digitalization-products/reset - Reset to default (admin only)
router.delete('/reset', async (req, res) => {
  try {
    console.log('📡 DELETE /api/digitalization-products/reset - Resetting to default...');
    
    // Remove all existing
    await DigitalizationProduct.deleteMany({});
    
    // Create default
    const defaultProducts = await DigitalizationProduct.createDefault();
    
    console.log('✅ Products reset to default successfully');
    
    res.json({
      success: true,
      message: 'Produits remis à zéro avec succès',
      data: defaultProducts
    });
  } catch (error) {
    console.error('❌ Error resetting products:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la remise à zéro des produits',
      error: error.message
    });
  }
});

// GET /api/digitalization-products/stats - Get statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('📡 GET /api/digitalization-products/stats - Getting statistics...');
    
    const products = await DigitalizationProduct.findOne({ isActive: true });
    
    if (!products) {
      return res.json({
        success: true,
        data: {
          totalProducts: 0,
          totalDetails: 0,
          lastUpdated: null,
          categories: {}
        }
      });
    }
    
    const totalDetails = products.products.reduce((sum, product) => sum + product.details.length, 0);
    const categories = products.products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});
    
    const stats = {
      totalProducts: products.products.length,
      totalDetails: totalDetails,
      lastUpdated: products.updatedAt,
      title: products.title,
      intro: products.intro,
      categories: categories,
      activeProducts: products.products.filter(p => p.isActive).length
    };
    
    console.log('✅ Statistics calculated:', stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

export default router;
