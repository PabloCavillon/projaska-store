import Link from "next/link";
import LegalPage from "@/components/store/legal-page";
import { CONSUMER_CLAIMS_URL, LEGAL } from "@/lib/store-contact";

export const metadata = { title: "Términos y condiciones" };

export default function TermsPage() {
    return (
        <LegalPage title="Términos y condiciones">
            <p>
                Estos términos regulan el uso del sitio Projaska y las compras que se hacen a través de él. Al registrarte o hacer un
                pedido los aceptás. Si no estás de acuerdo, no uses el sitio.
            </p>

            <h2>1. Quién vende</h2>
            <ul>
                <li>Titular: {LEGAL.holder}</li>
                <li>CUIT: {LEGAL.cuit}</li>
                <li>Domicilio: {LEGAL.address}</li>
                <li>Contacto: {LEGAL.email}</li>
            </ul>

            <h2>2. Cuenta de usuario</h2>
            <p>
                Para hacer pedidos tenés que crear una cuenta con datos verdaderos. Sos responsable de mantener tu contraseña en
                secreto y de lo que se haga con tu cuenta. Podés darla de baja cuando quieras desde{" "}
                <Link href="/account">Mi cuenta</Link>.
            </p>

            <h2>3. Productos y precios</h2>
            <ul>
                <li>Las fotos y descripciones son ilustrativas. Las especificaciones técnicas son las que informa el fabricante.</li>
                <li>
                    Los precios se muestran en pesos argentinos e incluyen IVA. Se calculan a partir del costo en dólares y de la
                    cotización del día, que se informa en el sitio. El valor en dólares que figura debajo es solo una referencia.
                </li>
                <li>
                    El precio final en pesos queda fijo al momento de registrar el pago. Si la cotización cambió entre el pedido y el
                    pago, te lo informamos antes de cobrar y podés cancelar el pedido sin costo.
                </li>
                <li>Los descuentos para instaladores y por volumen se aplican de forma automática y se ven antes de confirmar.</li>
                <li>Todo pedido está sujeto a disponibilidad de stock. Si un producto no está disponible, te avisamos y no se cobra.</li>
            </ul>

            <h2>4. Cómo se hace una compra</h2>
            <p>
                Al confirmar el carrito se genera un pedido con un código. El pedido no es una venta cerrada: te contactamos por
                WhatsApp o email para coordinar el pago y el envío o retiro. La venta se perfecciona cuando el pago queda registrado.
                Podés seguir el estado del pedido en <Link href="/orders">Mis pedidos</Link>.
            </p>

            <h2>5. Envíos y retiro</h2>
            <p>
                Los envíos se coordinan con cada cliente. El costo y el plazo se informan antes del pago y corren por cuenta del
                comprador, salvo que se indique lo contrario. Revisá el paquete al recibirlo y avisanos dentro de las 48 horas si
                llegó dañado o incompleto.
            </p>

            <h2>6. Derecho de arrepentimiento</h2>
            <p>
                Tenés 10 días corridos desde que recibís el producto (o desde la compra, lo que ocurra después) para revocar la
                aceptación sin dar motivos y sin costo, según el art. 34 de la Ley 24.240 y el art. 1110 del Código Civil y
                Comercial. El producto tiene que devolverse en el mismo estado en que lo recibiste. Los gastos de devolución corren
                por nuestra cuenta. Para hacerlo usá el <Link href="/arrepentimiento">Botón de arrepentimiento</Link>.
            </p>

            <h2>7. Garantía</h2>
            <p>
                Los productos nuevos tienen la garantía legal de 6 meses del art. 11 de la Ley 24.240, además de la garantía del
                fabricante cuando sea mayor. La garantía no cubre daños por mala instalación, mal uso, sobretensión, golpes,
                humedad o intervención de terceros. Para usarla escribinos con el código de pedido.
            </p>

            <h2>8. Instalación</h2>
            <p>
                La instalación no está incluida en el precio de los productos salvo que se indique. Si contratás la instalación, se
                presupuesta aparte y se rige por lo que se acuerde en ese presupuesto.
            </p>

            <h2>9. Responsabilidad</h2>
            <p>
                Los equipos de seguridad ayudan a prevenir y registrar incidentes, pero no garantizan que no ocurran. Nada en estos
                términos limita los derechos que te da la Ley 24.240 de Defensa del Consumidor.
            </p>

            <h2>10. Propiedad intelectual</h2>
            <p>
                Los textos, el diseño y el logo de Projaska son de su titular. Las marcas de los productos pertenecen a sus
                fabricantes.
            </p>

            <h2>11. Datos personales</h2>
            <p>
                Tratamos tus datos según la <Link href="/privacy">Política de privacidad</Link>.
            </p>

            <h2>12. Cambios en estos términos</h2>
            <p>
                Podemos actualizar estos términos. La versión vigente es la publicada en esta página. Los cambios no afectan los
                pedidos ya hechos.
            </p>

            <h2>13. Reclamos y jurisdicción</h2>
            <p>
                Ante cualquier problema escribinos primero a {LEGAL.email}. También podés hacer un reclamo ante{" "}
                <a href={CONSUMER_CLAIMS_URL} target="_blank" rel="noopener noreferrer">Defensa de las y los Consumidores</a>.
                Se aplica la ley argentina. Es competente el tribunal correspondiente a tu domicilio, como establece el art. 36 de
                la Ley 24.240.
            </p>
        </LegalPage>
    );
}
