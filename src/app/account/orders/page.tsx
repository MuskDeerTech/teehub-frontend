"use client";

import { useEffect, useState } from "react";

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
    };
    quantity: number;
  }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReview, setShowReview] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, review: "" });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`);
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.docs || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

const handleSubmitReview = async (productId: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: "Product Review", // ✅ add this line
        product: productId,
        rating: reviewData.rating,
        review: reviewData.review,
      }),
    });

    const data = await res.json();
    console.log("Review save response:", res.status, data);

    if (!res.ok) throw new Error(data?.message || "Failed to submit review");

    alert("✅ Review submitted successfully!");
    setShowReview(null);
    setReviewData({ rating: 5, review: "" });
  } catch (error) {
    console.error(error);
    alert("❌ Failed to submit review");
  }
};


  if (loading)
    return <div className="flex justify-center h-64 text-gray-500">Loading orders...</div>;

  if (error)
    return <div className="text-center text-red-600 mt-10">{error}</div>;

  if (orders.length === 0)
    return <div className="text-center mt-10 text-gray-600">No orders yet.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-center border-b pb-3 mb-3">
              <h2 className="font-semibold text-lg text-gray-800">
                Order #{order.orderId}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  order.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : order.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {order.status}
              </span>
            </div>

            {order.products?.map((p, index) => (
              <div key={index} className="border-b border-gray-100 pb-2">
                <div className="flex justify-between items-center py-2">
                  <span>
                    {p.product?.name || "Unnamed Product"} × {p.quantity}
                  </span>

                  {/* ✅ Show Review Button if order completed */}
                  {order.status === "completed" && (
                    <button
                      onClick={() => setShowReview(p.product.id)}
                      className="text-sm text-orange-600 hover:underline"
                    >
                      Write Review
                    </button>
                  )}
                </div>

                {/* Review Form (conditionally shown) */}
                {showReview === p.product.id && (
                  <div className="mt-3 bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm mb-1 font-medium">
                      Rating
                    </label>
                    <select
                      value={reviewData.rating}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          rating: Number(e.target.value),
                        })
                      }
                      className="border rounded-md px-2 py-1 mb-2"
                    >
                      {[1, 2, 3, 4, 5].map((r) => (
                        <option key={r} value={r}>
                          {r} ★
                        </option>
                      ))}
                    </select>

                    <textarea
                      placeholder="Write your review..."
                      value={reviewData.review}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          review: e.target.value,
                        })
                      }
                      className="w-full border rounded-md px-3 py-2 mb-2 text-sm"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowReview(null)}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmitReview(p.product.id)}
                        className="bg-orange-600 text-white px-4 py-1 rounded-md text-sm hover:bg-orange-700"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Placed on: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="font-semibold text-orange-600 text-lg">
                ₹{order.total.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
