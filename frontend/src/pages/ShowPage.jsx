import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ShowCard from "../components/ShowCard";
import Ratings from '../components/Ratings';
import FavoriteHeart from "../components/FavoriteHeart";


/// The TMDB API key stored in the .env file
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const ShowPage = () => {
  /// Retrieves the show ID from the current route.
  const { id } = useParams();

  /// Stores the show details, similar shows, and loading status
  const [details, setDetails] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  ///  Local states for the user interactions attached to each profile
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [watched, setWatched] = useState(false);
  const [listed, setListed] = useState(false);

  useEffect(() => {
    /// Fetches show details and recommendations when the route ID changes
    const fetchDetails = async () => {
      try {
        /// Pulls the selected show's details from TMDB.
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=en-US`
        );
        const data = await res.json();
        setDetails(data);

        /// fetch similar shows to display as recommendations
        const simRes = await fetch(
          `https://api.themoviedb.org/3/tv/${id}/similar?api_key=${API_KEY}&language=en-US&page=1`
        );
        const simData = await simRes.json();
        setSimilar(simData.results || []);
      } catch (err) {
        console.error("Error fetching showId details:", err);
      } finally {
        /// Removes the loading state after the request finishes
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  /// Displays feedback while the data is loading or renders message if the show is not found.
  if (loading) return <p className="text-white p-6">Loading...</p>;
  if (!details) return <p className="text-white p-6">show not found</p>;

  return (
    <div className="min-h-screen text-white my-32 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Displays the show;s poster, with a fallback image when no image is available */}
        <div>
          {details.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
              alt={details.name}
              className="rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-96 bg-accent flex items-center justify-center rounded-lg">
              No Image
            </div>
          )}
        </div>

        {/* Shows title, ratings, release info, and media overview */}
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold mb-2">{details.name}</h1>

          {/* TMDB Rating and vote count */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-highlight text-xl">⭐</span>
            <span className="text-lg font-semibold">
              {details.vote_average?.toFixed(1)}
            </span>
            <span className="text-accent text-sm">
              ({details.vote_count?.toLocaleString()} ratings)
            </span>
          </div>

          <p className="text-accent mb-4">
            {details.first_air_date?.split("-")[0]}{" "}
            {details.created_by?.length > 0 &&
              ` | Creator: ${details.created_by[0].name}`}
          </p>

          <p className="text-accent mb-4">
            {details.number_of_seasons} seasons •{" "}
            {details.number_of_episodes} episodes
          </p>

          <p className="text-white leading-relaxed">{details.overview}</p>

          {/* Renders the user rating (⭐ out of 5) component for the selected show*/}
          <div className="mt-6">
            <p className="mb-2 font-semibold">Rate?</p>
            <Ratings showId={details.id}/>
          </div>

          {/* Allow users to toggle their watched and listed selections */}
          <div className="mt-6 flex space-x-6">
            {/* Watched status toggle */}
            <div className="flex items-center gap-1">
              <span
                onClick={() => setWatched(!watched)}
                className={`p-2 rounded-full cursor-pointer transition-colors duration-200 ${
                  !watched ? "hover:bg-secondary" : "bg-highlight text-white"
                }`}
              >
                {watched ? "✔️" : "📺"}
              </span>
              <span className="text-accent">
                {details.vote_count
                  ? `${details.vote_count.toLocaleString()} watched`  // API placeholder (replace Eventually)
                  : "No data"}
              </span>
            </div>

            {/* Listed status toggle */}
            <div className="flex items-center gap-1">
              <span
                onClick={() => setListed(!listed)}
                className={`p-2 rounded-full cursor-pointer transition-colors duration-200 ${
                  !listed ? "hover:bg-secondary" : "bg-highlight text-white"
                }`}
              >
                {listed ? "✔️" : "📃"}
              </span>
              <span className="text-accent">
                {details.popularity
                  ? `${Math.round(details.popularity * 1000).toLocaleString()} listed` // API placeholder (replace Eventually)
                  : "No data"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Displays a grid of recommended shows (10max) using reusable ShowCard components. */}
      <div className="max-w-6xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4">More Shows Like {details.name} </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {similar.slice(0, 10).map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShowPage;