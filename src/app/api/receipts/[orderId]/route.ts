export const runtime = "nodejs";

import { getOrder } from "@/actions/orders";
import { auth } from "@/auth";
import { Document } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import React from "react";
const { renderToBuffer } = await import("@react-pdf/renderer");
const { OrderReceipt } = await import("@/components/receipts/OrderReceipt");

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ orderId: string }> },
) {
	const { orderId } = await params;

	const session = await auth();
	if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

	const order = await getOrder(orderId);

	if (!order) {
		return NextResponse.json(
			{
				error: "Orden no encontrada",
			},
			{
				status: 404,
			},
		);
	}

	const element = React.createElement(OrderReceipt, {
		order,
	}) as unknown as React.ReactElement<React.ComponentProps<typeof Document>>;

	const buffer = await renderToBuffer(element);

	return new NextResponse(new Uint8Array(buffer), {
		status: 200,
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="recibo-${order.code ?? orderId}.pdf"`,
		},
	});
}
