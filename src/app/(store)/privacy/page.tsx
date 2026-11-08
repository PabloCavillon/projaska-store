import Link from "next/link";
import LegalPage from "@/components/store/legal-page";
import { LEGAL } from "@/lib/store-contact";

export const metadata = { title: "Política de privacidad" };

export default function PrivacyPage() {
    return (
        <LegalPage title="Política de privacidad">
            <p>
                Esta política explica qué datos personales recolecta Projaska, para qué los usa y cómo podés ejercer tus derechos,
                según la Ley 25.326 de Protección de Datos Personales.
            </p>

            <h2>1. Responsable</h2>
            <p>
                {LEGAL.holder}, CUIT {LEGAL.cuit}, con domicilio en {LEGAL.address}. Contacto: {LEGAL.email}.
            </p>

            <h2>2. Qué datos recolectamos</h2>
            <ul>
                <li>Al registrarte: nombre, email, teléfono (opcional) y contraseña. La contraseña se guarda cifrada y nadie puede leerla.</li>
                <li>Al hacer un pedido: los productos, cantidades, importes y la dirección de envío que nos indiques.</li>
                <li>Al usar el Botón de arrepentimiento: nombre, email, teléfono, código de pedido y el motivo, si lo indicás.</li>
                <li>Datos técnicos de navegación anónimos y agregados, para medir el rendimiento del sitio.</li>
            </ul>

            <h2>3. Para qué los usamos</h2>
            <ul>
                <li>Gestionar tu cuenta, tus pedidos, pagos, envíos y garantías.</li>
                <li>Contactarte por WhatsApp o email por tus pedidos.</li>
                <li>Cumplir obligaciones legales, contables e impositivas.</li>
            </ul>
            <p>No vendemos ni cedemos tus datos a terceros con fines comerciales.</p>

            <h2>4. Con quién los compartimos</h2>
            <p>
                Solo con quienes los necesitan para prestar el servicio: la empresa de transporte que lleva tu pedido y los
                proveedores de infraestructura del sitio (hosting y base de datos), que los tratan por cuenta nuestra. Algunos de
                estos proveedores están fuera de Argentina. También los entregamos si lo exige una autoridad competente.
            </p>

            <h2>5. Cookies</h2>
            <p>
                Usamos una cookie propia necesaria para mantener tu sesión iniciada, y el navegador guarda tu carrito y tus
                preferencias de visualización. No usamos cookies publicitarias ni de seguimiento de terceros. La medición de
                visitas es anónima y no usa cookies.
            </p>

            <h2>6. Cuánto tiempo los guardamos</h2>
            <p>
                Mientras tengas la cuenta activa. Si te das de baja, borramos tu nombre, email, teléfono y dirección de la cuenta.
                Los datos de los pedidos (productos, importes y fechas) se conservan el tiempo que exigen las normas contables e
                impositivas, sin asociarlos a tus datos de contacto.
            </p>

            <h2>7. Tus derechos</h2>
            <p>
                Podés pedir acceso, rectificación, actualización o supresión de tus datos escribiendo a {LEGAL.email}. El acceso es
                gratuito en intervalos de seis meses, salvo que acredites un interés legítimo (art. 14, inc. 3, Ley 25.326).
                Respondemos dentro de los plazos legales: 10 días corridos para el acceso y 5 días hábiles para rectificación o
                supresión. Para borrar tu cuenta podés hacerlo vos mismo desde <Link href="/account">Mi cuenta</Link>.
            </p>
            <p>
                La Agencia de Acceso a la Información Pública, órgano de control de la Ley 25.326, atiende las denuncias y
                reclamos por incumplimiento de las normas de protección de datos personales.
            </p>

            <h2>8. Seguridad</h2>
            <p>
                El sitio usa conexión cifrada (HTTPS), las contraseñas se guardan con hash y el acceso a los datos está limitado al
                personal que los necesita.
            </p>

            <h2>9. Cambios</h2>
            <p>Si cambiamos esta política, publicamos la nueva versión en esta página con su fecha de actualización.</p>
        </LegalPage>
    );
}
