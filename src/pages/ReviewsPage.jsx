import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useCatalog } from "../context/CatalogContext.jsx";
import { starString, useLocalStorage, validateForm } from "../utils/helpers.jsx";

const REVIEW_KEY = "voltxpress-reviews";

function Field({ label, name, type = "text", error, autoComplete, wide = false }) {
  return (
    <label className={`field${wide ? " field-wide" : ""}${error ? " has-error" : ""}`}>
      <span>{label}</span>
      <input type={type} name={name} autoComplete={autoComplete} />
      <small>{error}</small>
    </label>
  );
}

export default function ReviewsPage() {
  const { defaultReviews } = useCatalog();
  const [storedReviews, setStoredReviews] = useLocalStorage(REVIEW_KEY, []);
  const [serverReviews, setServerReviews] = useState(defaultReviews);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const reviews = [...storedReviews, ...serverReviews];

  useEffect(() => {
    let cancelled = false;
    setServerReviews(defaultReviews);

    api.getReviews()
      .then((reviews) => {
        if (!cancelled) setServerReviews(reviews.length ? reviews : defaultReviews);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [defaultReviews]);

  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors = validateForm(form, ["name", "rating", "comment"]);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const review = {
      name: form.elements.name.value.trim(),
      rating: Number(form.elements.rating.value),
      comment: form.elements.comment.value.trim(),
      date: new Date().toISOString().slice(0, 10)
    };

    setMessage("Submitting review...");
    try {
      const saved = await api.createReview(review);
      setServerReviews((current) => [saved, ...current]);
      form.reset();
      setMessage("Review submitted to backend.");
    } catch (error) {
      setStoredReviews((current) => [review, ...current]);
      form.reset();
      setMessage(`Review saved locally. ${error.message}`);
    }
  };

  return (
    <main className="page-shell">
      <section className="page-heading container">
        <p className="eyebrow">Customer voices</p>
        <h1>Reviews</h1>
        <p>Read public reviews and submit feedback through the backend API.</p>
      </section>
      <section className="reviews-layout container">
        <div className="review-list">
          {reviews.map((review, index) => (
            <article className="review-card" key={`${review.name}-${review.date}-${index}`}>
              <div className="review-top">
                <div><strong>{review.name}</strong><small>{review.date}</small></div>
                <div className="stars" aria-label={`${review.rating} out of 5 stars`}>{starString(review.rating)}</div>
              </div>
              <p>{review.comment}</p>
            </article>
          ))}
        </div>

        <form className="form-panel review-form" onSubmit={submit} noValidate>
          <h2>Leave a Review</h2>
          <Field label="Name" name="name" error={errors.name} />
          <label className={`field${errors.rating ? " has-error" : ""}`}>
            <span>Rating</span>
            <select name="rating" defaultValue="5">
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
            <small>{errors.rating}</small>
          </label>
          <label className={`field${errors.comment ? " has-error" : ""}`}>
            <span>Comment</span>
            <textarea name="comment" rows="5"></textarea>
            <small>{errors.comment}</small>
          </label>
          <button className="btn btn-primary btn-full" type="submit">Submit Review</button>
          <p className="form-message" role="status">{message}</p>
        </form>
      </section>
    </main>
  );
}
