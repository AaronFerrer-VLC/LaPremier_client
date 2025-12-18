import { Container } from 'react-bootstrap'
import './PrivacyPolicyPage.css'

const PrivacyPolicyPage = () => {
    return (
        <div className="PrivacyPolicyPage">
            <Container className="py-5">
                <div className="legal-content">
                    <h1 className="legal-title mb-4">Política de Privacidad</h1>
                    
                    <section className="mb-5">
                        <h2 className="legal-section-title">1. Información General</h2>
                        <p>
                            LA PREMIERE se compromete a proteger la privacidad de los usuarios que accedan a 
                            este sitio web y/o utilicen los servicios ofrecidos en el mismo.
                        </p>
                        <p>
                            El presente documento informa a los usuarios sobre la política de protección de 
                            datos de carácter personal que LA PREMIERE aplica en el tratamiento de los datos 
                            personales que voluntariamente nos proporcionan a través del sitio web.
                        </p>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">2. Responsable del Tratamiento</h2>
                        <p>
                            Los datos personales que el usuario pueda facilitar serán incorporados a un fichero 
                            del que es responsable:
                        </p>
                        <ul>
                            <li><strong>Denominación:</strong> LA PREMIERE</li>
                            <li><strong>Propietarios:</strong> Aaron & Lucas</li>
                            <li><strong>Copyright:</strong> © 2024 La Premiere</li>
                        </ul>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">3. Datos Recopilados</h2>
                        <p>
                            En LA PREMIERE recopilamos y procesamos los siguientes tipos de datos personales:
                        </p>
                        <ul>
                            <li><strong>Datos de identificación:</strong> nombre de usuario, correo electrónico (si se proporciona)</li>
                            <li><strong>Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas</li>
                            <li><strong>Datos de contenido:</strong> reseñas, comentarios y valoraciones realizadas por los usuarios</li>
                        </ul>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">4. Finalidad del Tratamiento</h2>
                        <p>
                            Los datos personales recopilados se utilizan para las siguientes finalidades:
                        </p>
                        <ul>
                            <li>Gestión y administración del sitio web</li>
                            <li>Procesamiento de reseñas y comentarios de usuarios</li>
                            <li>Mejora de la experiencia del usuario</li>
                            <li>Análisis estadístico y mejora de servicios</li>
                            <li>Cumplimiento de obligaciones legales</li>
                        </ul>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">5. Base Legal</h2>
                        <p>
                            El tratamiento de sus datos personales se basa en:
                        </p>
                        <ul>
                            <li>El consentimiento del usuario para el tratamiento de sus datos</li>
                            <li>La ejecución de medidas precontractuales o contractuales</li>
                            <li>El cumplimiento de obligaciones legales</li>
                            <li>El interés legítimo del responsable</li>
                        </ul>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">6. Conservación de Datos</h2>
                        <p>
                            Los datos personales se conservarán durante el tiempo necesario para cumplir con 
                            la finalidad para la que fueron recabados y para determinar las posibles 
                            responsabilidades que se pudieran derivar de dicha finalidad y del tratamiento 
                            de los datos.
                        </p>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">7. Derechos del Usuario</h2>
                        <p>
                            Los usuarios tienen derecho a:
                        </p>
                        <ul>
                            <li><strong>Acceso:</strong> Obtener información sobre sus datos personales que tratamos</li>
                            <li><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos o incompletos</li>
                            <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos personales</li>
                            <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos personales</li>
                            <li><strong>Limitación:</strong> Solicitar la limitación del tratamiento de sus datos</li>
                            <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
                        </ul>
                        <p>
                            Para ejercer estos derechos, puede contactar con nosotros a través de los medios 
                            de contacto disponibles en el sitio web.
                        </p>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">8. Seguridad</h2>
                        <p>
                            LA PREMIERE adopta las medidas técnicas y organizativas necesarias para garantizar 
                            la seguridad de los datos personales y evitar su alteración, pérdida, tratamiento 
                            o acceso no autorizado.
                        </p>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">9. Cookies</h2>
                        <p>
                            Este sitio web utiliza cookies. Para más información sobre el uso de cookies, 
                            consulte nuestra <a href="/politica-cookies" className="text-white">Política de Cookies</a>.
                        </p>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">10. Modificaciones</h2>
                        <p>
                            LA PREMIERE se reserva el derecho de modificar la presente política de privacidad 
                            para adaptarla a novedades legislativas, jurisprudenciales o de interpretación de 
                            la Agencia Española de Protección de Datos.
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

export default PrivacyPolicyPage

