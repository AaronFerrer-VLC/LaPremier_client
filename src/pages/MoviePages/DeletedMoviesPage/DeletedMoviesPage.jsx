import { useContext } from "react"
import { Row, Col, Container, Alert } from "react-bootstrap"
import { Button } from "../../../components/UI"
import MovieCard from "../../../components/MovieCard/MovieCard"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../../../contexts/auth.context"
import { moviesService } from "../../../services/movies.service"
import { cinemasService } from "../../../services/cinemas.service"
import { useApi } from "../../../hooks/useApi"
import { notifySuccess, notifyError } from "../../../utils/notifications"
import logger from "../../../utils/logger"
import { SkeletonCardList } from "../../../components/SkeletonLoader/SkeletonLoader"

const DeletedMoviesPage = () => {
    const { isAuthenticated } = useContext(AuthContext)

    if (!isAuthenticated) {
        return <Navigate to="/peliculas" />
    }

    // Fetch movies using useApi hook
    const { data: movies, loading: isLoading, refetch } = useApi(
        () => moviesService.getAll(),
        []
    )

    const deletedMovies = movies?.filter(movie => movie.isDeleted) || []

    const handleMovieRecovery = async (movie) => {
        try {
            // Get all cinemas
            const cinemasResponse = await cinemasService.getAll()
            const allCinemas = cinemasResponse.data

            // Filter cinemas that reference this movie
            const cinemasToUpdate = allCinemas.filter(eachCinema =>
                movie?.cinemaId?.includes(eachCinema.id)
            )

            // Update each cinema to add movie reference
            const updatePromises = cinemasToUpdate.map(eachCinema => {
                const newMoviesIds = Array.isArray(eachCinema.movieId)
                    ? [...eachCinema.movieId, movie.id]
                    : [eachCinema.movieId, movie.id].filter(Boolean)

                return cinemasService.update(eachCinema.id, {
                    ...eachCinema,
                    movieId: newMoviesIds
                })
            })

            await Promise.all(updatePromises)

            // Restore movie
            await moviesService.restore(movie.id)

            notifySuccess('Película recuperada correctamente')
            logger.info('Movie restored', { movieId: movie.id }, 'DeletedMoviesPage')
            refetch() // Refresh list
        } catch (error) {
            logger.error('Failed to restore movie', error, 'DeletedMoviesPage')
            notifyError('Error al recuperar la película')
        }
    }


    if (isLoading) {
        return (
            <Container className="mt-5">
                <SkeletonCardList count={8} />
            </Container>
        )
    }

    if (deletedMovies.length === 0) {
        return (
            <Container className="mt-5">
                <Alert variant="info">
                    No hay películas eliminadas para recuperar.
                </Alert>
            </Container>
        )
    }

    return (
        <Container className="mt-5">
            <div className="DeletedMoviesPage">
                <Row>
                    {deletedMovies.map(movie => (
                        <Col className="text-center" md={{ span: 4 }} key={movie.id}>
                            <MovieCard {...movie} />
                            <Button
                                variant="accent"
                                size="md"
                                className="mt-3"
                                onClick={() => handleMovieRecovery(movie)}
                            >
                                Recuperar película
                            </Button>
                        </Col>
                    ))}
                </Row>
            </div>
        </Container>
    )
}
export default DeletedMoviesPage