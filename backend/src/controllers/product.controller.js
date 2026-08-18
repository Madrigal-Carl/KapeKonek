import {
    getProducts,
    getCatalogProducts,
    getProductById,
    getProductReviews,
    createProductReview,
    createProduct,
    updateProduct,
    updateProductPrice,
    deleteProduct,
} from "../services/product.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getProductsHandler = asyncHandler(async (req, res) => {
    const { products, pagination } = await getProducts(req.query, req.user);

    return res.status(200).json({
        message: "Products fetched successfully",
        products,
        pagination,
    });
});

export const getCatalogProductsHandler = asyncHandler(async (req, res) => {
    const { products, pagination } = await getCatalogProducts(
        req.query,
        req.user,
    );

    return res.status(200).json({
        message: "Catalog products fetched successfully",
        products,
        pagination,
    });
});

export const getProductDetailHandler = asyncHandler(async (req, res) => {
    const product = await getProductById(req.params.id, req.user);

    return res.status(200).json({
        message: "Product fetched successfully",
        product,
    });
});

export const getProductReviewsHandler = asyncHandler(async (req, res) => {
    const reviews = await getProductReviews(req.params.id);

    return res.status(200).json({
        message: "Reviews fetched successfully",
        reviews,
    });
});

export const createProductReviewHandler = asyncHandler(async (req, res) => {
    const review = await createProductReview(req.params.id, req.body, req.user);

    return res.status(201).json({
        message: "Review submitted successfully",
        review,
    });
});

export const updateProductPriceHandler = asyncHandler(async (req, res) => {
    const product = await updateProductPrice(
        req.params.id,
        req.body.price,
        req.user,
    );

    return res.status(200).json({
        message: "Product price updated successfully",
        product,
    });
});

export const createProductHandler = asyncHandler(async (req, res) => {
    const product = await createProduct(req.body, req.user);

    return res.status(201).json({
        message: "Product created successfully",
        product,
    });
});

export const updateProductHandler = asyncHandler(async (req, res) => {
    const product = await updateProduct(req.params.id, req.body, req.user);

    return res.status(200).json({
        message: "Product updated successfully",
        product,
    });
});

export const deleteProductHandler = asyncHandler(async (req, res) => {
    const product = await deleteProduct(req.params.id, req.user);

    return res.status(200).json({
        message: "Product deleted successfully",
        product,
    });
});
