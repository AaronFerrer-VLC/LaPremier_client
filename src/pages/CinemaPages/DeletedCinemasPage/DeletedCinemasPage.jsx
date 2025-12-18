import CinemaCard from "../../../components/CinemaCard/CinemaCard"
import { useContext } from "react"
import { Row, Col, Container, Alert } from "react-bootstrap"
import { Button } from "../../../components/UI"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../../../contexts/auth.context"
import { cinemasService } from "../../../services/cinemas.service"
import { moviesService } from "../../../services/movies.service"
import { useApi } from "../../../hooks/useApi"
import { notifySuccess, notifyError } from "../../../utils/notifications"
import logger from "../../../utils/logger"
import { SkeletonCardList } from "../../../components/SkeletonLoader/SkeletonLoader"

const DeletedCinemasPage = () => {
    const { isAuthenticated } = useContext(AuthContext)

    if (!isAuthenticated) {
        return <Navigate to="/cines" />
    }

    // Fetch cinemas using useApi hook
    const { data: cinemas, loading: isLoading, refetch } = useApi(
        () => cinemasService.getAll(),
        []
    )

    const deletedCinemas = cinemas?.filter(cinema => cinema.isDeleted) || []

    const handleCinemaRecovery = async (cinema) => {
        try {
            // Get all movies
            const moviesResponse = await moviesService.getAll()
            const allMovies = moviesResponse.data

            // Filter movies that reference this cinema
            const moviesToUpdate = allMovies.filter(eachMovie =>
                cinema?.movieId?.includes(eachMovie.id)
            )

            // Update each movie to add cinema reference
            const updatePromises = moviesToUpdate.map(eachMovie => {
                const newCinemasIds = Array.isArray(eachMovie.cinemaId)
                    ? [...eachMovie.cinemaId, cinema.id]
                    : [eachMovie.cinemaId, cinema.id].filter(Boolean)

                return moviesService.update(eachMovie.id, {
                    ...eachMovie,
                    cinemaId: newCinemasIds
                })
            })

            await Promise.all(updatePromises)

            // Restore cinema
            await cinemasService.restore(cinema.id)

            notifySuccess('Cine recuperado correctamente')
            logger.info('Cinema restored', { cinemaId: cinema.id }, 'DeletedCinemasPage')
            refetch() // Refresh list
        } catch (error) {
            logger.error('Failed to restore cinema', error, 'DeletedCinemasPage')
            notifyError('Error al recuperar el cine')
        }
    }


    if (isLoading) {
        return (
            <Container className="mt-5">
                <SkeletonCardList count={6} />
            </Container>
        )
    }

    if (deletedCinemas.length === 0) {
        return (
            <Container className="mt-5">
                <Alert variant="info">
                    No hay cines eliminados para recuperar.
                </Alert>
            </Container>
        )
    }

    return (
        <Container className="mt-5">
            <div className="DeletedCinemasPage">
                <Row>
                    {deletedCinemas.map(cinema => (
                        <Col className="text-center" md={{ span: 4 }} key={cinema.id}>
                            <CinemaCard {...cinema} />
                            <Button
                                variant="accent"
                                size="md"
                                className="mt-3"
                                onClick={() => handleCinemaRecovery(cinema)}
                            >
                                Recuperar cine
                            </Button>
                        </Col>
                    ))}
                </Row>
            </div>
        </Container>
    )
}

export default DeletedCinemasPage