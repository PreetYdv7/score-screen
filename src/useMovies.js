import { useEffect, useState } from "react";

const KEY = "38c4ba9b";

export function useMovies(query, callback) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(
    function () {
      callback?.();
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");

          // Don't fetch if query is empty
          if (!query.length) {
            setMovies([]);
            setError("");
            setIsLoading(false);
            return;
          }

          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok) throw new Error("Something went wrong!");
          const data = await res.json();

          if (data.Response === "False") throw new Error("No results Found");

          setMovies(data.Search);
          setError("");
        } catch (err) {
          console.error(err.message);
          // Only set error state if it's not an AbortError
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        }
      }

      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return { movies, isLoading, error };
}
