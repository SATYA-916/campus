import { dbAdapter } from '../config/dbAdapter.js';

// @desc    Get all product listings
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, condition, college, status, search } = req.query;
    const products = await dbAdapter.listProducts({
      category,
      condition,
      college,
      status: status || 'available', // Default to available products unless specified
      search
    });
    res.json(products);
  } catch (error) {
    console.error('[ProductController] Get Products Error:', error.message);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// @desc    Get a single product listing
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await dbAdapter.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product listing not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('[ProductController] Get Product By ID Error:', error.message);
    res.status(500).json({ message: 'Server error fetching product details' });
  }
};

// @desc    Create a product listing
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, condition, image, college } = req.body;

    if (!title || !description || price === undefined || !category || !condition) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Default to seller's college if not specified
    let productCollege = college;
    if (!productCollege) {
      const user = await dbAdapter.getUserById(req.user.id);
      productCollege = user ? user.college : 'Unknown College';
    }

    const product = await dbAdapter.createProduct({
      title,
      description,
      price: parseFloat(price),
      category,
      condition,
      image: image || '',
      college: productCollege,
      seller: req.user.id,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('[ProductController] Create Product Error:', error.message);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// @desc    Update a product listing
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    const { title, description, price, category, condition, image, status } = req.body;
    const product = await dbAdapter.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product listing not found' });
    }

    // Check ownership: seller._id could be string (localdb) or Mongoose ObjectId
    const sellerId = product.seller._id ? product.seller._id.toString() : product.seller.toString();
    if (sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = parseFloat(price);
    if (category !== undefined) updates.category = category;
    if (condition !== undefined) updates.condition = condition;
    if (image !== undefined) updates.image = image;
    if (status !== undefined) updates.status = status;

    const updatedProduct = await dbAdapter.updateProduct(req.params.id, updates);
    res.json(updatedProduct);
  } catch (error) {
    console.error('[ProductController] Update Product Error:', error.message);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// @desc    Delete a product listing
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await dbAdapter.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product listing not found' });
    }

    // Check ownership
    const sellerId = product.seller._id ? product.seller._id.toString() : product.seller.toString();
    if (sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await dbAdapter.deleteProduct(req.params.id);
    res.json({ message: 'Product listing deleted successfully' });
  } catch (error) {
    console.error('[ProductController] Delete Product Error:', error.message);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};
