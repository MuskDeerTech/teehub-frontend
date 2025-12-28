"use client";

import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

interface Review {
  id: string;
  rating: number;
  review: string;
  product: string;
}

interface Order {
  id: string;
  orderId: string;
  total: number;
  status: string;
  createdAt: string;
  products: {
    product: {
      id: string;
      name: string;
      slug:string;
      images?: {
        image: {
          url: string;
          alt?: string;
        };
      }[];
    };
    quantity: number;
    size: string;
  }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReview, setShowReview] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 0, review: "" });

  const ratingLabels: Record<number, string> = {
    1: "Poor 😞",
    2: "Average 😐",
    3: "Good 🙂",
    4: "Very Good 😃",
    5: "Excellent 🤩",
  };

  const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const parsed = JSON.parse(storedUser);
    setUserId(parsed.id); // or parsed._id depending on your backend
  }
}, []);


  // 🟠 Fetch orders and reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, reviewsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`),
        ]);

        if (!ordersRes.ok || !reviewsRes.ok) throw new Error("Failed to load data");

        const ordersData = await ordersRes.json();
        const reviewsData = await reviewsRes.json();

        setOrders(ordersData.docs || []);
        setReviews(reviewsData.docs || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🟢 Submit or update review
  const handleSubmitReview = async (productId: string) => {
    const existingReview = reviews.find((r) => r.product === productId);

    const payload = {
      title: "Product Review",
      product: productId,
      rating: reviewData.rating,
      review: reviewData.review,
      user: userId, // ✅ Must include this
      status: "pending", // NEW
    };

    try {
      const url = existingReview
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${existingReview.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/reviews`;

      const method = existingReview ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Review response:", data);

      if (!res.ok) throw new Error(data?.message || "Failed to submit review");

      alert(existingReview ? "✅ Review updated successfully!" : "✅ Review submitted successfully!");

      // Update local reviews state
      if (existingReview) {
        setReviews((prev) =>
          prev.map((r) => (r.id === existingReview.id ? { ...r, ...payload } : r))
        );
      } else {
        setReviews((prev) => [...prev, data.doc]);
      }

      setShowReview(null);
      setReviewData({ rating: 0, review: "" });
    } catch (error) {
      console.error(error);
      alert("❌ Failed to submit review");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading orders...
      </div>
    );

  if (error)
    return <div className="text-center text-red-600 mt-10">{error}</div>;

  if (orders.length === 0)
    return <div className="text-center mt-10 text-gray-600">No orders yet.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Order #{order.orderId}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : order.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              {order.products?.map((p, index) => {
                const userReview = reviews.find(
                  (r) => r.product === p.product.id
                );

                return (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <Link href={`/products/${p.product.slug}`} className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                          {p.product?.images?.[0]?.image?.url ? (
                           <Image
  unoptimized
  width={80}
  height={80}
  src={`${process.env.NEXT_PUBLIC_API_URL}${p.product.images[0].image.url}`}
  alt={p.product.name}
  className="object-cover w-full h-full"
/>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                              No Image
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${p.product.slug}`} className="block hover:text-orange-600 transition-colors">
                          <h3 className="font-medium text-gray-800 mb-1 truncate">
                            {p.product?.name || "Unnamed Product"}
                          </h3>
                          <p className="text-sm text-gray-500 mb-1">
                            Size: {p.size || "N/A"} • Qty: {p.quantity}
                          </p>
                        </Link>

                        {/* Review button (Write/Edit) */}
                        {order.status === "completed" && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowReview(p.product.id);
                              setReviewData({
                                rating: userReview?.rating || 0,
                                review: userReview?.review || "",
                              });
                            }}
                            className="text-sm text-orange-600 hover:underline mt-1 inline-block"
                          >
                            {userReview ? "Edit Review" : "Write Review"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Review Form */}
                    {showReview === p.product.id && (
                      <div className="mt-4 bg-orange-50 border border-orange-200 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating
                        </label>

                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              size={24}
                              className={`cursor-pointer transition-colors ${
                                star <= reviewData.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              onClick={() =>
                                setReviewData({ ...reviewData, rating: star })
                              }
                            />
                          ))}
                        </div>

                        {reviewData.rating > 0 && (
                          <p className="text-sm text-gray-600 mb-3">
                            {ratingLabels[reviewData.rating]}
                          </p>
                        )}

                        <textarea
                          placeholder="Write your review..."
                          value={reviewData.review}
                          onChange={(e) =>
                            setReviewData({
                              ...reviewData,
                              review: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          rows={3}
                        />

                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setShowReview(null)}
                            className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSubmitReview(p.product.id)}
                            className="bg-orange-600 text-white px-4 py-1 rounded-md text-sm hover:bg-orange-700 transition-colors"
                          >
                            {userReview ? "Update Review" : "Submit Review"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Placed on: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xl font-bold text-orange-600">
                ₹{order.total.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
