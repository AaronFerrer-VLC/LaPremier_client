import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Spinner } from "../components/UI";

// Lazy load pages for code splitting
const HomePage = lazy(() => import("../pages/HomePage/HomePage"));
const CinemasPage = lazy(() => import("../pages/CinemaPages/CinemasPage/CinemasPage"));
const CinemaDetailsPage = lazy(() => import("../pages/CinemaPages/CinemaDetailsPage/CinemaDetailsPage"));
const NewCinemaPage = lazy(() => import("../pages/CinemaPages/NewCinemaPage/NewCinemaPage"));
const EditCinemaPage = lazy(() => import("../pages/CinemaPages/EditCinemaPage/EditCinemaPage"));
const MoviesPage = lazy(() => import("../pages/MoviePages/MoviesPage/MoviesPage"));
const MovieDetailPage = lazy(() => import("../pages/MoviePages/MovieDetailsPage/MovieDetailsPage"));
const NewMoviePage = lazy(() => import("../pages/MoviePages/NewMoviePage/NewMoviePage"));
const EditMoviePage = lazy(() => import("../pages/MoviePages/EditMoviePage/EditMoviePage"));
const DeletedCinemasPage = lazy(() => import("../pages/CinemaPages/DeletedCinemasPage/DeletedCinemasPage"));
const DeletedMoviesPage = lazy(() => import("../pages/MoviePages/DeletedMoviesPage/DeletedMoviesPage"));
const ReviewMoviePage = lazy(() => import("../pages/MoviePages/ReviewMoviePage/ReviewMoviePage"));
const MovieStatsPage = lazy(() => import("../pages/Stats/MovieStatsPage"));
const Error404Page = lazy(() => import("../pages/Error404Page/Error404Page"));
const AvisoLegalPage = lazy(() => import("../pages/LegalPages/AvisoLegalPage/AvisoLegalPage"));
const PrivacyPolicyPage = lazy(() => import("../pages/LegalPages/PrivacyPolicyPage/PrivacyPolicyPage"));
const CookiePolicyPage = lazy(() => import("../pages/LegalPages/CookiePolicyPage/CookiePolicyPage"));
const NowPlayingPage = lazy(() => import("../pages/NowPlayingPage/NowPlayingPage"));
const SyncCinemasPage = lazy(() => import("../pages/CinemaPages/SyncCinemasPage/SyncCinemasPage"));
const FavoritesPage = lazy(() => import("../pages/FavoritesPage/FavoritesPage"));
const ComparePage = lazy(() => import("../pages/ComparePage/ComparePage"));
const SearchPage = lazy(() => import("../pages/SearchPage/SearchPage"));
const CalendarPage = lazy(() => import("../pages/CalendarPage/CalendarPage"));
const GenresPage = lazy(() => import("../pages/GenresPage/GenresPage"));

// Loading fallback component
const PageLoader = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
    <Spinner variant="primary" size="lg" />
  </div>
);

const AppRoutes = () => {
    return (
        <div className="AppRoutes">
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/cines" element={<CinemasPage />} />
                    <Route path="/cines/detalles/:cinemaId" element={<CinemaDetailsPage key={window.location.pathname} />} />

                    <Route path="/cines/crear" element={<NewCinemaPage />} />
                    <Route path="/cines/sincronizar" element={<SyncCinemasPage />} />
                    <Route path="/cines/editar/:cinemaId" element={<EditCinemaPage />} />
                    <Route path="/cines/eliminados" element={<DeletedCinemasPage />} />

                    <Route path="/peliculas" element={<MoviesPage />} />
                    <Route path="/peliculas/cartelera" element={<NowPlayingPage />} />
                    <Route path="/peliculas/detalles/:movieId" element={<MovieDetailPage />} />

                    <Route path="/peliculas/crear" element={<NewMoviePage />} />
                    <Route path="/peliculas/editar/:movieId" element={<EditMoviePage />} />
                    <Route path="/peliculas/eliminados" element={<DeletedMoviesPage />} />

                    <Route path="/datos" element={<MovieStatsPage />} />

                    <Route path="/peliculas/reseña/:movieId" element={<ReviewMoviePage />} />
                    
                    <Route path="/favoritos" element={<FavoritesPage />} />
                    <Route path="/comparar" element={<ComparePage />} />
                    <Route path="/buscar" element={<SearchPage />} />
                    <Route path="/calendario" element={<CalendarPage />} />
                    
                    <Route path="/aviso-legal" element={<AvisoLegalPage />} />
                    <Route path="/politica-privacidad" element={<PrivacyPolicyPage />} />
                    <Route path="/politica-cookies" element={<CookiePolicyPage />} />
                    
                    <Route path="*" element={<Error404Page />} />
                </Routes>
            </Suspense>
        </div>
    )
}

export default AppRoutes