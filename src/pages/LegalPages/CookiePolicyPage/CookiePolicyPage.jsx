import { Container } from 'react-bootstrap'
import './CookiePolicyPage.css'

const CookiePolicyPage = () => {
    return (
        <div className="CookiePolicyPage">
            <Container className="py-5">
                <div className="legal-content text-white">
                    <h1 className="legal-title mb-4">Política de Cookies</h1>
                    
                    <section className="mb-5">
                        <h2 className="legal-section-title">1. ¿Qué son las Cookies?</h2>
                        <p>
                            Las cookies son pequeños archivos de texto que se almacenan en su dispositivo 
                            (ordenador, tablet, smartphone) cuando visita un sitio web. Las cookies permiten 
                            que el sitio web recuerde sus acciones y preferencias durante un período de tiempo, 
                            por lo que no tiene que volver a configurarlas cada vez que regrese al sitio o 
                            navegue de una página a otra.
                        </p>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">2. Tipos de Cookies que Utilizamos</h2>
                        
                        <h3 className="legal-subsection-title">2.1. Cookies Técnicas</h3>
                        <p>
                            Son aquellas que permiten al usuario la navegación a través de una página web y 
                            la utilización de las diferentes opciones o servicios que en ella existen.
                        </p>

                        <h3 className="legal-subsection-title">2.2. Cookies de Análisis</h3>
                        <p>
                            Son aquellas que permiten el seguimiento y análisis del comportamiento de los 
                            usuarios en los sitios web. La información recogida mediante este tipo de cookies 
                            se utiliza en la medición de la actividad del sitio web y para la elaboración 
                            de perfiles de navegación de los usuarios.
                        </p>

                        <h3 className="legal-subsection-title">2.3. Cookies de Preferencias</h3>
                        <p>
                            Permiten recordar información para que el usuario acceda al servicio con 
                            determinadas características que pueden diferenciar su experiencia de la de 
                            otros usuarios.
                        </p>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">3. Cookies Utilizadas en este Sitio Web</h2>
                        <p>
                            En LA PREMIERE utilizamos las siguientes cookies:
                        </p>
                        <table className="cookie-table">
                            <thead>
                                <tr>
                                    <th>Cookie</th>
                                    <th>Propósito</th>
                                    <th>Duración</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>theme</td>
                                    <td>Almacena la preferencia de tema (claro/oscuro) del usuario</td>
                                    <td>Persistente</td>
                                </tr>
                                <tr>
                                    <td>auth</td>
                                    <td>Mantiene la sesión del usuario autenticado</td>
                                    <td>Sesión</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">4. Cookies de Terceros</h2>
                        <p>
                            Este sitio web puede utilizar servicios de terceros que, por cuenta de LA PREMIERE, 
                            recopilan información con fines estadísticos, de uso del sitio web por parte del 
                            usuario y para la prestación de otros servicios relacionados con la actividad del 
                            sitio web.
                        </p>
                        <p>
                            En particular, este sitio web utiliza Google Maps para mostrar la ubicación de los 
                            cines. Google Maps puede utilizar cookies propias según se indica en su 
                            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-white ms-1">
                                Política de Privacidad
                            </a>.
                        </p>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">5. Gestión de Cookies</h2>
                        <p>
                            Puede permitir, bloquear o eliminar las cookies instaladas en su equipo mediante 
                            la configuración de las opciones del navegador instalado en su ordenador.
                        </p>
                        <p>
                            A continuación, le proporcionamos enlaces donde podrá encontrar más información sobre 
                            la gestión de cookies en los principales navegadores:
                        </p>
                        <ul>
                            <li>
                                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-white">
                                    Google Chrome
                                </a>
                            </li>
                            <li>
                                <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-white">
                                    Mozilla Firefox
                                </a>
                            </li>
                            <li>
                                <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-white">
                                    Safari
                                </a>
                            </li>
                            <li>
                                <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-white">
                                    Microsoft Edge
                                </a>
                            </li>
                        </ul>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">6. Consentimiento</h2>
                        <p>
                            Al navegar y continuar en nuestro sitio web estará consintiendo el uso de las 
                            cookies antes descritas, y en las condiciones contenidas en la presente Política 
                            de Cookies.
                        </p>
                        <p>
                            Si no está de acuerdo, puede configurar su navegador para restringir, bloquear o 
                            borrar las cookies de LA PREMIERE o de cualquier otro sitio web.
                        </p>
                    </section>

                    <section className="mb-5">
                        <h2 className="legal-section-title">7. Actualizaciones de la Política de Cookies</h2>
                        <p>
                            LA PREMIERE puede modificar esta Política de Cookies en función de exigencias 
                            legislativas, reglamentarias, o con la finalidad de adaptar dicha política a las 
                            instrucciones dictadas por la Agencia Española de Protección de Datos.
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

export default CookiePolicyPage

