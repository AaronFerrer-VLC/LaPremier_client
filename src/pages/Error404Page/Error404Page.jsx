import { Link } from "react-router-dom"
import { Container } from "react-bootstrap"
import { Button } from "../../components/UI"

import "./Error404Page.css"

const Error404Page = () => {
    return (
        <div className="Error404Page text-center">
            <Container className="min-vh-100 d-flex justify-content-center align-items-center">
                <div>
                    <img className="mb-4" src="https://res.cloudinary.com/dhluctrie/image/upload/v1732270177/kenan-thompson-kenan_pdapo3.gif" alt="Ups!" />
                    <h5 className="mb-4">Ups! Parece que el cine ha cerrado... jeje</h5>
                    <Button as={Link} to={"/"} variant="primary">Vuelve a intentarlo</Button>
                </div>
            </Container>
        </div>
    )
}

export default Error404Page