import Review from "../models/Review.js";
import Product from "../models/Product.js";

// ✅ Add a Review
export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    const review = new Review({
      user: req.user.id,
      product: productId,
      rating,
      comment,
    });

    await review.save();

    // Update product rating
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, { ratings: avgRating });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Error adding review" });
  }
};

// ✅ Get Product Reviews
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate("user", "name");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Error fetching reviews" });
  }
};
