import { useEffect, useState, useCallback } from "react"
import { Form, ListGroup } from "react-bootstrap"
import { Link } from "react-router-dom"
import { cinemasService } from "../../services/cinemas.service"
import { logError } from "../../utils/errorHandler"
import { debounce } from "../../utils/debounce"
import "./CinemasGlobalFilter.css"

const CinemasGlobalFilter = ({ filterSelected, handleFilterSelected }) => {
    const [filterValue, setFilterValue] = useState('')
    const [filterResults, setFilterResults] = useState([])
    const [showFilterResults, setShowFilterResults] = useState(false)

    const searchCinemas = useCallback(async (query) => {
        if (!query || query.trim().length < 2) {
            setFilterResults([])
            return
        }

        try {
            const response = await cinemasService.searchByName(query)
            setFilterResults(response.data.filter(cinema => !cinema.isDeleted))
        } catch (err) {
            logError(err, 'CinemasGlobalFilter')
            setFilterResults([])
        }
    }, [])

    const debouncedSearch = useCallback(
        debounce((query) => searchCinemas(query), 300),
        [searchCinemas]
    )

    useEffect(() => {
        if (filterValue && filterValue.trim().length >= 2) {
            debouncedSearch(filterValue)
            setShowFilterResults(true)
        } else {
            setFilterResults([])
            setShowFilterResults(false)
        }
    }, [filterValue, debouncedSearch])


    const handleFilterChange = (e) => {
        const { value } = e.target
        setFilterValue(value)
        setShowFilterResults(true)
    }

    const handleFocus = () => {
        handleFilterSelected("cines")
        // Si hay texto, mostrar resultados
        if (filterValue && filterValue.trim().length >= 2) {
            setShowFilterResults(true)
        }
    }

    const handleBlur = () => {
        // Delay para permitir clicks en los items
        setTimeout(() => {
            setShowFilterResults(false)
            handleFilterSelected("")
        }, 200)
    }

    const handleItemClick = (cinema) => {
        setFilterValue(cinema.name || '')
        setShowFilterResults(false)
    }

    if (filterSelected === 'pelis') {
        return (
            <Form.Control
                disabled
                type="text"
                placeholder="Buscar cine"
            />
        )
    }

    return (
        <div className="CinemasGlobalFilter position-relative">
            <Form.Control
                type="text"
                placeholder="Buscar cine"
                className="form-control mr-sm-2"
                onChange={handleFilterChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                value={filterValue}
            />
            {showFilterResults && filterResults.length > 0 && (
                <ListGroup 
                    className="position-absolute w-100 mt-1 autocomplete-dropdown" 
                    style={{ 
                        zIndex: 1000, 
                        maxHeight: '300px', 
                        overflowY: 'auto'
                    }}
                >
                    {filterResults.map(cinema => {
                        const cinemaId = cinema.id || cinema._id;
                        if (!cinemaId) return null;
                        return (
                            <ListGroup.Item
                                key={cinemaId}
                                as={Link}
                                to={`/cines/detalles/${cinemaId}`}
                                onClick={() => handleItemClick(cinema)}
                                action
                                className="autocomplete-item"
                                style={{
                                    cursor: 'pointer',
                                    border: 'none',
                                    borderBottom: '1px solid var(--border-color-light)',
                                    padding: '0.75rem 1rem'
                                }}
                            >
                                {cinema.name}
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup>
            )}
        </div>
    )

}

export default CinemasGlobalFilter