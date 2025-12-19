import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-toastify/dist/ReactToastify.css'
import "./App.css"
import AppRoutes from './routes/AppRoutes'
import Navigation from './components/Navigation/Navigation'
import Footer from './components/Footer/Footer'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import { useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import { useState } from 'react'

import LoginForm from './components/LoginForm/LoginForm'
import { Modal } from './components/UI'
import SkipLinks from './components/SkipLinks/SkipLinks'

const App = () => {

  const location = useLocation()

  const currentFamilyPath =
    location.pathname.startsWith('/cines') ? 'cines'
      :
      location.pathname.startsWith('/peliculas') ? 'peliculas'
        :
        location.pathname.startsWith('/datos') ? 'datos'
          :
          null

  const [showModal, setShowModal] = useState(false)


  return (


    <div className='App'>
      <SkipLinks />
      <ScrollToTop />
      
      <Navigation currentFamilyPath={currentFamilyPath} setShowModal={setShowModal} />

      <main id="main-content" role="main">
        <AppRoutes currentFamilyPath={currentFamilyPath} />
      </main>

      <Footer currentFamilyPath={currentFamilyPath} />

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Iniciar sesión"
      >
        <LoginForm setShowModal={setShowModal} />
      </Modal>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

    </div>

  )
}

export default App
