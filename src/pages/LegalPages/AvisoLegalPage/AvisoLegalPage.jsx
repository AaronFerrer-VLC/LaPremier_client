import { Container } from 'react-bootstrap'
import './AvisoLegalPage.css'

const AvisoLegalPage = () => {
    return (
        <div className="AvisoLegalPage">
            <Container className="py-5">
                <div className="legal-content">
                    <h1 className="legal-title mb-4">Aviso Legal</h1>
                    
                    <section className="mb-5">
                        <h2 className="legal-section-title">1. Datos Identificativos</h2>
                        <p>
                            En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, 
                            de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico, 
                            a continuación se reflejan los siguientes datos:
                        </p>
                        <ul>
                            <li><strong>Denominación social:</strong> LA PREMIERE</li>
                            <li><strong>Propietarios:</strong> Aaron & Lucas</li>
                            <li><strong>Copyright:</strong> © 2024 La Premiere</li>
                        </ul>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">2. Objeto</h2>
                        <p>
                            El presente aviso legal regula el uso del sitio web <strong>LA PREMIERE</strong> 
                            (en adelante, el sitio web), del cual es titular LA PREMIERE.
                        </p>
                        <p>
                            La navegación por el sitio web de LA PREMIERE implica la aceptación de todas las 
                            disposiciones incluidas en este aviso legal, así como de las políticas de privacidad 
                            y de cookies.
                        </p>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">3. Condiciones de Uso</h2>
                        <p>
                            El acceso y uso del sitio web tiene carácter gratuito y libre, sin necesidad de 
                            registro previo. Sin embargo, algunas funcionalidades pueden requerir registro o 
                            identificación del usuario.
                        </p>
                        <p>
                            El usuario se compromete a hacer un uso adecuado y lícito del sitio web, así como 
                            de los contenidos y servicios, de conformidad con la legislación vigente, el presente 
                            aviso legal, las buenas costumbres y el orden público.
                        </p>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">4. Propiedad Intelectual e Industrial</h2>
                        <p>
                            Todos los contenidos del sitio web, incluyendo textos, gráficos, imágenes, iconos, 
                            tecnología, software, así como su diseño gráfico y códigos fuente, constituyen una 
                            obra cuya propiedad pertenece a LA PREMIERE, sin que puedan entenderse cedidos al 
                            usuario ninguno de los derechos de explotación sobre los mismos.
                        </p>
                        <p>
                            Las marcas, nombres comerciales o signos distintivos son titularidad de LA PREMIERE, 
                            sin que pueda entenderse que el acceso al sitio web atribuya ningún derecho sobre los 
                            mismos.
                        </p>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">5. Responsabilidades</h2>
                        <p>
                            LA PREMIERE no se hace responsable de la información y contenidos almacenados en 
                            foros, chats, generadores de blogs, comentarios, redes sociales o cualquier otro 
                            medio que permita a terceros publicar contenidos de forma independiente en la página web.
                        </p>
                        <p>
                            Sin embargo, y en cumplimiento de lo dispuesto en los artículos 11 y 16 de la LSSI-CE, 
                            LA PREMIERE se compromete a retirar o en su caso bloquear aquellos contenidos que 
                            puedan afectar o contravenir la legislación nacional o internacional, derechos de 
                            terceros o la moral y el orden público.
                        </p>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">6. Modificaciones</h2>
                        <p>
                            LA PREMIERE se reserva el derecho de realizar sin previo aviso las modificaciones 
                            que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los 
                            contenidos y servicios que se presten a través de la misma como la forma en la que 
                            éstos aparezcan presentados o localizados en su portal.
                        </p>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">7. Legislación Aplicable y Jurisdicción</h2>
                        <p>
                            Para la resolución de todas las controversias o cuestiones relacionadas con el 
                            presente sitio web o de las actividades en él desarrolladas, será de aplicación la 
                            legislación española, a la que se someten expresamente las partes.
                        </p>
                    </section>

                    <p className="text-muted mt-5">
                        <small>Última actualización: Enero 2024</small>
                    </p>
                </div>
            </Container>
        </div>
    )
}

export default AvisoLegalPage

