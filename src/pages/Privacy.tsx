import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg shadow-sm hover:shadow transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Inicio
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>

          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Introducción</h2>
              <p>
                FrenillosCR ("nosotros", "nuestro" o "nos") opera un chatbot ("el Chatbot") alojado en Microsoft Copilot Studio,
                diseñado para asistir a los usuarios con consultas relacionadas a nuestros servicios de ortodoncia, incluyendo
                programación de citas, información sobre tratamientos, precios y soporte al cliente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Información que Recopilamos</h2>
              <p className="mb-3">El Chatbot puede procesar los siguientes tipos de información:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mensajes que envíe al Chatbot (consultas sobre citas, tratamientos o precios)</li>
                <li>Datos de contacto (si son proporcionados voluntariamente, ej. nombre, teléfono, email)</li>
                <li>Metadatos de plataformas Meta (ej. ID de usuario, historial de mensajes)</li>
                <li>Registros de interacciones con el Chatbot (para mejorar respuestas)</li>
              </ul>
              <p className="mt-3 font-medium">No recopilamos intencionalmente:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Información financiera (tarjetas de crédito, datos bancarios)</li>
                <li>Registros médicos sensibles (más allá de consultas generales)</li>
                <li>Documentos de identificación oficial</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Uso de la Información</h2>
              <p className="mb-3">Utilizamos los datos para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Responder consultas sobre citas, tratamientos y precios</li>
                <li>Mejorar la precisión y experiencia del Chatbot</li>
                <li>Redirigir conversaciones a canales apropiados (ej. soporte humano)</li>
                <li>Cumplir con obligaciones legales cuando aplique</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Compartir Datos</h2>
              <p className="mb-3">Compartimos información con:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Meta Platforms:</strong> Mensajes se procesan mediante sus APIs cumpliendo sus políticas</li>
                <li><strong>Microsoft Copilot Studio:</strong> Aloja el Chatbot bajo sus estándares de seguridad</li>
              </ul>
              <p className="mt-3">No vendemos ni compartimos datos con terceros para marketing.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Seguridad de Datos</h2>
              <p>
                Implementamos medidas para proteger su información:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Accesos restringidos a la información</li>
                <li>Monitoreo continuo de seguridad</li>
                <li>Retención mínima necesaria de mensajes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Sus Derechos</h2>
              <p className="mb-3">Usted puede:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Solicitar acceso o eliminación de sus datos</li>
                <li>Rectificar información inexacta</li>
                <li>Dejar de interactuar con el Chatbot en cualquier momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Retención de Datos</h2>
              <p>
                Conservamos mensajes solo el tiempo necesario para cumplir con las solicitudes y obligaciones legales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Cumplimiento con Meta</h2>
              <p>
                El Chatbot sigue las <strong>Políticas para Desarrolladores</strong> y <strong>Términos de Plataforma</strong> de Meta.
                No almacenamos datos sensibles más allá de lo necesario para su funcionamiento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">9. Contacto</h2>
              <p>
                Para preguntas sobre privacidad:
              </p>
              <div className="mt-3">
                <p className="font-medium">FrenillosCR</p>
                <p>Email: [Insertar Email de Contacto]</p>
                <p>Teléfono: [Insertar Teléfono si aplica]</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">10. Actualizaciones</h2>
              <p>
                Esta política puede actualizarse. La versión vigente estará siempre disponible aquí. 
                Última actualización: {new Date().toLocaleDateString()}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
