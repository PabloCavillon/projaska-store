import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddToCartControls } from "@/components/store/add-to-cart-controls";
import { CartProvider } from "@/contexts/cart-context";

const item = {
    cartKey: "product:test-1:unit",
    type: "product" as const,
    id: "test-1",
    name: "Producto Test",
    sku: "TST-001",
    priceUsd: 50,
    unit: "unit" as const,
    isOffer: false,
};

// Los botones +/− no tienen aria-label: los identificamos por posición o por texto
// del span de cantidad que los rodea.

function setup() {
    render(
        <CartProvider>
            <AddToCartControls item={item} />
        </CartProvider>
    );
    return userEvent.setup();
}

beforeEach(() => {
    // Evita que el localStorage cargue el carrito del test anterior en el CartProvider
    localStorage.clear();
});

describe("AddToCartControls", () => {
    it("muestra botón 'Agregar al carrito' cuando el ítem no está en el carrito", () => {
        setup();
        expect(screen.getByRole("button", { name: /agregar al carrito/i })).toBeTruthy();
    });

    it("agrega el ítem al carrito al hacer click en el botón", async () => {
        const user = setup();
        await user.click(screen.getByRole("button", { name: /agregar al carrito/i }));
        // El botón desaparece y aparece el control de cantidad con "1 en el carrito"
        expect(screen.queryByRole("button", { name: /agregar al carrito/i })).toBeNull();
        expect(screen.getByText(/en el carrito/i)).toBeTruthy();
    });

    it("muestra la cantidad 1 al agregar por primera vez", async () => {
        const user = setup();
        await user.click(screen.getByRole("button", { name: /agregar al carrito/i }));
        // El span de cantidad muestra "1"
        expect(screen.getByDisplayValue("1")).toBeTruthy();
    });

    it("incrementa la cantidad al hacer click en el botón +", async () => {
        const user = setup();
        await user.click(screen.getByRole("button", { name: /agregar al carrito/i }));
        const buttons = screen.getAllByRole("button");
        const plusButton = buttons[1]; // [0]=Trash/Minus, [1]=Plus
        await user.click(plusButton);
        expect(screen.getByDisplayValue("2")).toBeTruthy();
    });

    it("elimina el ítem al hacer click en la papelera (quantity=1)", async () => {
        const user = setup();
        await user.click(screen.getByRole("button", { name: /agregar al carrito/i }));
        // Con quantity=1, el primer botón es la papelera
        const buttons = screen.getAllByRole("button");
        await user.click(buttons[0]); // Trash2
        // Vuelve a mostrar "Agregar al carrito"
        expect(screen.getByRole("button", { name: /agregar al carrito/i })).toBeTruthy();
    });

    it("disminuye la quantity al hacer click en − (quantity>1)", async () => {
        const user = setup();
        await user.click(screen.getByRole("button", { name: /agregar al carrito/i }));
        // Agregar una vez más para tener quantity=2
        const buttons = screen.getAllByRole("button");
        await user.click(buttons[1]); // Plus → quantity 2
        expect(screen.getByDisplayValue("2")).toBeTruthy();
        // Ahora el primer botón es − (no papelera)
        const buttonsNow = screen.getAllByRole("button");
        await user.click(buttonsNow[0]); // Minus → quantity 1
        expect(screen.getByDisplayValue("1")).toBeTruthy();
    });
});
