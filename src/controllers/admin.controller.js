import Product from "../models/product.model.js";

export const adminGetAllProducts = async (req, res) => {
  try {
    // Extract query parameters with defaults.
    const {
      page = 1,
      limit = 20,
      search = "",
      sortField = "createdAt",
      sortOrder = -1,
    } = req.query;

    // Calculate the number of documents to skip based on page and limit.
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build a search condition; use MongoDB text search if a search term is provided.
    const searchCondition = search 
      ? { $text: { $search: search } }
      : {};

    // Fetch products with pagination, sorting, and populate related fields.
    const products = await Product.find(searchCondition)
      .populate("category subCategory vendor")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ [sortField]: parseInt(sortOrder) });

    // Count the total number of matching products to compute pagination details.
    const totalProducts = await Product.countDocuments(searchCondition);

    // Return products and pagination info.
    res.status(200).json({
      success: true,
      products,
      pagination: {
        total: totalProducts,
        page: parseInt(page),
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products for admin:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
