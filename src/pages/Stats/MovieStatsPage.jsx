import { useContext, useMemo } from "react"
import { Row, Col, Container, Alert } from "react-bootstrap"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../../contexts/auth.context"
import { moviesService } from "../../services/movies.service"
import { cinemasService } from "../../services/cinemas.service"
import { useApi } from "../../hooks/useApi"
import { SkeletonDetails } from "../../components/SkeletonLoader/SkeletonLoader"
import MoviesGenrePieChart from "../../components/MoviesGenrePieChart/MoviesGenrePieChart"
import CinemasSeatingPieChart from "../../components/CinemasSeatingPieChart/CinemasSeatingPieChart"
import "./MovieStatsPage.css"

const MovieStatsPage = () => {
    const { isAuthenticated } = useContext(AuthContext)

    if (!isAuthenticated) {
        return <Navigate to="/" />
    }

    // Fetch data using useApi hooks
    const { data: movies, loading: isLoadingMovies } = useApi(
        () => moviesService.getAll(),
        []
    )

    const { data: cinemas, loading: isLoadingCinemas } = useApi(
        () => cinemasService.getAll(),
        []
    )

    const isLoading = isLoadingMovies || isLoadingCinemas

    const activeMovies = movies?.filter(movie => !movie.isDeleted) || []
    const activeCinemas = cinemas?.filter(cinema => !cinema.isDeleted) || []

    // Calculate duration statistics
    const durationData = useMemo(() => {
        let numLongMovies = 0
        let numShortMovies = 0

        activeMovies.forEach(eachMovie => {
            if (eachMovie.duration > 120) {
                numLongMovies++
            } else if (eachMovie.duration <= 120) {
                numShortMovies++
            }
        })

        return [
            { id: "> 120 min", value: numLongMovies },
            { id: "< 120 min", value: numShortMovies }
        ]
    }, [activeMovies])

    // Calculate seating statistics
    const seatingData = useMemo(() => {
        let smallCinemas = 0
        let bigCinemas = 0

        activeCinemas.forEach(eachCinema => {
            const seating = Number(eachCinema?.capacity?.seating) || 0
            if (seating <= 600) {
                smallCinemas++
            } else {
                bigCinemas++
            }
        })

        return [
            { id: "> 600 butacas", value: bigCinemas },
            { id: "< 600 butacas", value: smallCinemas }
        ]
    }, [activeCinemas])


    if (isLoading) {
        return (
            <div className="MovieStatsPage">
                <Container>
                    <SkeletonDetails />
                </Container>
            </div>
        )
    }

    return (
        <div className="MovieStatsPage">
                <Container className="h-100">
                    <Row className="stats h-100">
                        <Col md={6} className="text-center h-100">
                            <MoviesGenrePieChart data={durationData} />
                        </Col>
                        <Col md={6} className="text-center h-100">
                            <CinemasSeatingPieChart data={seatingData} />
                        </Col>
                    </Row>
                </Container>
            </div>

    )
}

export default MovieStatsPage